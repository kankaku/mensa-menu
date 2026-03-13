"use client";

import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AppLanguage,
  DailyMenu,
  MenuItem as MenuItemType,
  MenuSection as MenuSectionType,
  TranslationTargetLanguage,
  ALLERGEN_LABELS,
  ADDITIVE_LABELS,
  ALLERGEN_LABELS_JA,
  ALLERGEN_LABELS_KO,
  ADDITIVE_LABELS_JA,
  ADDITIVE_LABELS_KO,
  ALLERGEN_TOOLTIPS,
  ADDITIVE_TOOLTIPS,
  ALLERGEN_TOOLTIPS_JA,
  ALLERGEN_TOOLTIPS_KO,
  ADDITIVE_TOOLTIPS_JA,
  ADDITIVE_TOOLTIPS_KO,
  CATEGORY_TOOLTIPS,
} from "@/lib/types";
import { getCurrentMenuDateKey } from "@/lib/menu-date";

interface Props {
  initialMenu: DailyMenu;
  initialTranslatedMenu?: DailyMenu | null;
}

type TranslatedMenus = Partial<Record<TranslationTargetLanguage, DailyMenu>>;

const LANGUAGE_OPTIONS: Array<{ code: AppLanguage; label: string }> = [
  { code: "de", label: "DE" },
  { code: "en", label: "EN" },
  { code: "ko", label: "KO" },
  { code: "ja", label: "JP" },
];

const DATE_LOCALES: Record<TranslationTargetLanguage, string> = {
  en: "en-US",
  ko: "ko-KR",
  ja: "ja-JP",
};

const UI_TEXT: Record<
  AppLanguage,
  {
    title: string;
    subtitle: string;
    noMenu: string;
    loading: string;
    refreshingMenu: string;
    refreshingMenuHint: string;
    explanationUnavailable: string;
    student: string;
    staff: string;
    guest: string;
    studentShort: string;
    staffShort: string;
    guestShort: string;
  }
> = {
  de: {
    title: "Mensa Süd",
    subtitle: "Universität Rostock",
    noMenu: "Heute kein Menü verfügbar.",
    loading: "Laden...",
    refreshingMenu: "Heutiger Speiseplan wird aktualisiert.",
    refreshingMenuHint: "Wir laden die neuesten Gerichte direkt von der Mensa-Website.",
    explanationUnavailable: "Erklärung nicht verfügbar.",
    student: "Student",
    staff: "Bedienstete",
    guest: "Gast",
    studentShort: "Stud",
    staffShort: "Bed",
    guestShort: "Gast",
  },
  en: {
    title: "Mensa South",
    subtitle: "University of Rostock",
    noMenu: "No menu available today.",
    loading: "Loading...",
    refreshingMenu: "Updating today's menu.",
    refreshingMenuHint: "We are fetching the latest dishes directly from the Mensa source.",
    explanationUnavailable: "Could not load explanation.",
    student: "Student",
    staff: "Staff",
    guest: "Guest",
    studentShort: "Student",
    staffShort: "Staff",
    guestShort: "Guest",
  },
  ko: {
    title: "Mensa South",
    subtitle: "로스토크 대학교",
    noMenu: "오늘은 제공되는 메뉴가 없습니다.",
    loading: "불러오는 중...",
    refreshingMenu: "오늘 메뉴를 새로 불러오고 있습니다.",
    refreshingMenuHint: "멘자 원본 페이지에서 최신 식단을 직접 가져오는 중입니다.",
    explanationUnavailable: "설명을 불러오지 못했습니다.",
    student: "학생",
    staff: "교직원",
    guest: "외부인",
    studentShort: "학생",
    staffShort: "교직원",
    guestShort: "외부인",
  },
  ja: {
    title: "メンザ南部",
    subtitle: "ロストック大学",
    noMenu: "本日のメニューはありません。",
    loading: "読み込み中...",
    refreshingMenu: "本日のメニューを更新しています。",
    refreshingMenuHint: "メンザの元ページから最新の料理を直接取得しています。",
    explanationUnavailable: "説明を読み込めませんでした。",
    student: "学生",
    staff: "職員",
    guest: "一般",
    studentShort: "学生",
    staffShort: "職員",
    guestShort: "一般",
  },
};

const CATEGORY_LABELS: Record<AppLanguage, Record<string, string>> = {
  de: {
    vegan: "Vegan",
    vegetarisch: "Vegetarisch",
    Fisch: "Fisch",
    meat: "Fleisch",
  },
  en: {
    vegan: "Vegan",
    vegetarisch: "Vegetarian",
    Fisch: "Fish",
    meat: "Meat",
  },
  ko: {
    vegan: "비건",
    vegetarisch: "채식",
    Fisch: "생선",
    meat: "육류",
  },
  ja: {
    vegan: "ヴィーガン",
    vegetarisch: "ベジタリアン",
    Fisch: "魚",
    meat: "肉",
  },
};

function parseLocalDate(dateInput: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateInput);
  if (!match) {
    return null;
  }

  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

function formatDateForLanguage(
  dateInput: string,
  lang: TranslationTargetLanguage,
): string {
  const parsedDate = parseLocalDate(dateInput);
  if (!parsedDate) {
    return dateInput;
  }

  return parsedDate.toLocaleDateString(DATE_LOCALES[lang], {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function handleKeyboardActivate(
  event: KeyboardEvent,
  activate: () => void,
) {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  event.preventDefault();
  activate();
}

function getItemName(item: MenuItemType, lang: AppLanguage): string {
  switch (lang) {
    case "en":
      return item.nameEn || item.name;
    case "ko":
      return item.nameKo || item.name;
    case "ja":
      return item.nameJa || item.name;
    case "de":
    default:
      return item.name;
  }
}

function getSectionName(section: MenuSectionType, lang: AppLanguage): string {
  switch (lang) {
    case "en":
      return section.nameEn || section.name;
    case "ko":
      return section.nameKo || section.name;
    case "ja":
      return section.nameJa || section.name;
    case "de":
    default:
      return section.name;
  }
}

function getMensaName(menu: DailyMenu, lang: AppLanguage): string {
  switch (lang) {
    case "en":
      return menu.mensaNameEn || "Mensa South";
    case "ko":
      return menu.mensaNameKo || "멘자 남부";
    case "ja":
      return menu.mensaNameJa || "メンザ南部";
    case "de":
    default:
      return menu.mensaName;
  }
}

function getAllergenLabel(code: string, lang: AppLanguage): string {
  switch (lang) {
    case "en":
      return ALLERGEN_LABELS[code] || code;
    case "ko":
      return ALLERGEN_LABELS_KO[code] || ALLERGEN_LABELS[code] || code;
    case "ja":
      return ALLERGEN_LABELS_JA[code] || ALLERGEN_LABELS[code] || code;
    case "de":
    default:
      return code;
  }
}

function getAllergenTooltip(code: string, lang: AppLanguage): string | undefined {
  switch (lang) {
    case "de":
    case "en":
      return ALLERGEN_TOOLTIPS[code]?.[lang];
    case "ko":
      return ALLERGEN_TOOLTIPS_KO[code] || ALLERGEN_TOOLTIPS[code]?.en;
    case "ja":
      return ALLERGEN_TOOLTIPS_JA[code] || ALLERGEN_TOOLTIPS[code]?.en;
    default:
      return undefined;
  }
}

function getAdditiveLabel(code: string, lang: AppLanguage): string {
  switch (lang) {
    case "en":
      return ADDITIVE_LABELS[code] || code;
    case "ko":
      return ADDITIVE_LABELS_KO[code] || ADDITIVE_LABELS[code] || code;
    case "ja":
      return ADDITIVE_LABELS_JA[code] || ADDITIVE_LABELS[code] || code;
    case "de":
    default:
      return code;
  }
}

function getAdditiveTooltip(code: string, lang: AppLanguage): string | undefined {
  switch (lang) {
    case "de":
    case "en":
      return ADDITIVE_TOOLTIPS[code]?.[lang];
    case "ko":
      return ADDITIVE_TOOLTIPS_KO[code] || ADDITIVE_TOOLTIPS[code]?.en;
    case "ja":
      return ADDITIVE_TOOLTIPS_JA[code] || ADDITIVE_TOOLTIPS[code]?.en;
    default:
      return undefined;
  }
}

function isMenuDateCurrent(dateKey: string): boolean {
  return dateKey === getCurrentMenuDateKey();
}

export default function MenuClient({
  initialMenu,
  initialTranslatedMenu,
}: Props) {
  const [menu, setMenu] = useState<DailyMenu>(initialMenu);
  const [lang, setLang] = useState<AppLanguage>("de");
  const [refreshingMenu, setRefreshingMenu] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [translatedMenus, setTranslatedMenus] = useState<TranslatedMenus>(() =>
    initialTranslatedMenu ? { en: initialTranslatedMenu } : {},
  );
  const [modal, setModal] = useState<{
    item: MenuItemType;
    text: string | null;
    loading: boolean;
  } | null>(null);

  const modalRequestIdRef = useRef(0);
  const activeLangRef = useRef<AppLanguage>("de");
  const translationRequestIdRef = useRef(0);

  useEffect(() => {
    activeLangRef.current = lang;
  }, [lang]);

  const loadTranslation = useCallback(
    async (
      targetLang: TranslationTargetLanguage,
      sourceMenu: DailyMenu,
    ): Promise<boolean> => {
      const requestId = translationRequestIdRef.current + 1;
      translationRequestIdRef.current = requestId;
      setTranslating(true);
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ menu: sourceMenu, language: targetLang }),
        });
        if (!res.ok) {
          return false;
        }

        const translatedMenu = (await res.json()) as DailyMenu;
        if (translationRequestIdRef.current !== requestId) {
          return false;
        }

        setTranslatedMenus((prev) => ({ ...prev, [targetLang]: translatedMenu }));
        return true;
      } catch (error) {
        console.error(error);
        return false;
      } finally {
        if (translationRequestIdRef.current === requestId) {
          setTranslating(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (isMenuDateCurrent(initialMenu.date)) {
      return;
    }

    const abortController = new AbortController();

    async function refreshDailyMenu() {
      setRefreshingMenu(true);

      try {
        const response = await fetch("/api/menu?fresh=1", {
          cache: "no-store",
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to refresh menu");
        }

        const freshMenu = (await response.json()) as DailyMenu;
        if (abortController.signal.aborted) {
          return;
        }

        setMenu(freshMenu);
        translationRequestIdRef.current += 1;
        setTranslating(false);
        setTranslatedMenus({});

        const activeLang = activeLangRef.current;
        if (activeLang !== "de") {
          await loadTranslation(activeLang, freshMenu);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("Failed to refresh stale menu", error);
      } finally {
        if (!abortController.signal.aborted) {
          setRefreshingMenu(false);
        }
      }
    }

    void refreshDailyMenu();

    return () => {
      abortController.abort();
    };
  }, [initialMenu.date, loadTranslation]);

  const switchLang = useCallback(
    async (newLang: AppLanguage) => {
      setLang(newLang);

      if (newLang === "de" || translatedMenus[newLang]) {
        return;
      }

      await loadTranslation(newLang, menu);
    },
    [loadTranslation, menu, translatedMenus],
  );

  const openModal = useCallback(
    async (item: MenuItemType) => {
      const requestId = modalRequestIdRef.current + 1;
      modalRequestIdRef.current = requestId;

      setModal({ item, text: null, loading: true });
      try {
        const res = await fetch("/api/explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dishName: item.name, language: lang }),
        });
        if (res.ok) {
          const data = (await res.json()) as { explanation?: string };
          setModal((m) => {
            if (!m || m.item.id !== item.id || modalRequestIdRef.current !== requestId) {
              return m;
            }

            return {
              ...m,
              text: data.explanation || UI_TEXT[lang].explanationUnavailable,
              loading: false,
            };
          });
        } else {
          throw new Error("Failed");
        }
      } catch {
        if (modalRequestIdRef.current !== requestId) {
          return;
        }

        setModal((m) =>
          m && m.item.id === item.id
            ? {
                ...m,
                text: UI_TEXT[lang].explanationUnavailable,
                loading: false,
              }
            : m,
        );
      }
    },
    [lang],
  );

  const closeModal = () => {
    modalRequestIdRef.current += 1;
    setModal(null);
  };

  const current = lang === "de" ? menu : translatedMenus[lang] || menu;
  const todayDate = getCurrentMenuDateKey();
  const displayedDate = refreshingMenu ? todayDate : current.date;
  const showMenuRefreshSkeleton = refreshingMenu;
  const showTranslationSkeleton =
    !showMenuRefreshSkeleton && lang !== "de" && translating && !translatedMenus[lang];
  const dateDisplay =
    lang === "de" ? displayedDate : formatDateForLanguage(displayedDate, lang);
  const text = UI_TEXT[lang];

  return (
    <div className="app">
      <header className="header">
        <div className="header-row">
          <div>
            <h1 className="title">{getMensaName(current, lang) || text.title}</h1>
            <p className="subtitle">{text.subtitle}</p>
            <p className="date">{dateDisplay}</p>
          </div>
          <div className="lang-toggle">
            {LANGUAGE_OPTIONS.map((option) => (
              <button
                key={option.code}
                className={`lang-btn ${lang === option.code ? "active" : ""}`}
                onClick={() => switchLang(option.code)}
                disabled={translating || refreshingMenu}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="sections">
        {showMenuRefreshSkeleton ? (
          <MenuRefreshSkeleton text={text} />
        ) : showTranslationSkeleton ? (
          <TranslationSkeleton />
        ) : current.sections.length === 0 ? (
          <div className="empty">{text.noMenu}</div>
        ) : (
          current.sections.map((s) => (
            <Section
              key={s.id}
              section={s}
              lang={lang}
              onItemClick={openModal}
            />
          ))
        )}
      </div>

      {modal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{getItemName(modal.item, lang)}</h3>
              <button className="modal-close" onClick={closeModal} aria-label="Close">
                ×
              </button>
            </div>
            <div className="modal-body">
              {modal.loading ? (
                <div className="explanation-skeleton" aria-label={text.loading}>
                  <span className="sr-only">{text.loading}</span>
                  <div className="skeleton skeleton-text skeleton-text-long" />
                  <div className="skeleton skeleton-text" />
                  <div className="skeleton skeleton-text skeleton-text-short" />
                </div>
              ) : (
                <p>{modal.text}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuRefreshSkeleton({
  text,
}: {
  text: (typeof UI_TEXT)[AppLanguage];
}) {
  return (
    <div className="refresh-state" role="status" aria-live="polite">
      <p className="refresh-label">{text.refreshingMenu}</p>
      <p className="refresh-hint">{text.refreshingMenuHint}</p>
      <TranslationSkeleton />
    </div>
  );
}

function TranslationSkeleton() {
  return (
    <>
      {[0, 1].map((sectionIndex) => (
        <div className="section skeleton-section" key={sectionIndex} aria-hidden="true">
          <div className="section-header">
            <div className="skeleton skeleton-section-name" />
            <span className="section-arrow open">▼</span>
          </div>
          <div className="section-items">
            {[0, 1, 2].map((itemIndex) => (
              <div className="item skeleton-item" key={itemIndex}>
                <div className="item-content">
                  <div className="skeleton skeleton-item-name" />
                  <div className="skeleton-row">
                    <span className="skeleton skeleton-pill" />
                    <span className="skeleton skeleton-pill" />
                    <span className="skeleton skeleton-pill" />
                  </div>
                  <div className="skeleton-row">
                    <span className="skeleton skeleton-price" />
                    <span className="skeleton skeleton-price" />
                    <span className="skeleton skeleton-price" />
                  </div>
                </div>
                <span className="item-info skeleton skeleton-info" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

function Section({
  section,
  lang,
  onItemClick,
}: {
  section: MenuSectionType;
  lang: AppLanguage;
  onItemClick: (item: MenuItemType) => void;
}) {
  const [open, setOpen] = useState(true);
  const name = getSectionName(section, lang);
  const count = section.items.length;
  const toggleOpen = () => setOpen((prev) => !prev);

  return (
    <div className="section">
      <div
        className="section-header"
        onClick={toggleOpen}
        onKeyDown={(event) => handleKeyboardActivate(event, toggleOpen)}
        role="button"
        tabIndex={0}
        aria-expanded={open}
      >
        <h2 className="section-name">
          {name}
          <span className="section-count">({count})</span>
        </h2>
        <span className={`section-arrow ${open ? "open" : ""}`}>▼</span>
      </div>
      <div className={`section-items ${!open ? "collapsed" : ""}`}>
        {section.items.map((item) => (
          <Item
            key={item.id}
            item={item}
            lang={lang}
            onClick={() => onItemClick(item)}
          />
        ))}
      </div>
    </div>
  );
}

function Item({
  item,
  lang,
  onClick,
}: {
  item: MenuItemType;
  lang: AppLanguage;
  onClick: () => void;
}) {
  const name = getItemName(item, lang);
  const text = UI_TEXT[lang];

  const categoryClass: Record<string, string> = {
    vegan: "vegan",
    vegetarisch: "vegetarian",
    Fisch: "fish",
    meat: "meat",
  };

  return (
    <div
      className="item"
      onClick={onClick}
      onKeyDown={(event) => handleKeyboardActivate(event, onClick)}
      role="button"
      tabIndex={0}
    >
      <div className="item-content">
        <div className="item-name">{name}</div>
        <div className="item-tags">
          <span
            className={`tag ${categoryClass[item.category] || ""}`}
            data-tooltip={
              CATEGORY_TOOLTIPS[item.category]?.[lang] ||
              CATEGORY_TOOLTIPS[item.category]?.en ||
              undefined
            }
          >
            {CATEGORY_LABELS[lang][item.category] || item.category}
          </span>
          {item.allergens.map((a) => (
            <span
              key={a}
              className="tag allergen"
              data-tooltip={getAllergenTooltip(a, lang)}
            >
              {getAllergenLabel(a, lang)}
            </span>
          ))}
          {item.additives.map((a) => (
            <span
              key={a}
              className="tag additive"
              data-tooltip={getAdditiveTooltip(a, lang)}
            >
              {getAdditiveLabel(a, lang)}
            </span>
          ))}
        </div>
        <div className="item-prices">
          <span className="price-tag stud" title={text.student}>
            {text.studentShort}: {item.prices?.students || "-"}
          </span>
          <span className="price-tag bed" title={text.staff}>
            {text.staffShort}: {item.prices?.staff || "-"}
          </span>
          <span className="price-tag gast" title={text.guest}>
            {text.guestShort}: {item.prices?.guests || "-"}
          </span>
        </div>
      </div>
      <span className="item-info">i</span>
    </div>
  );
}
