"use client";

import {
  type KeyboardEvent,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  AppLanguage,
  DailyMenu,
  MenuItem as MenuItemType,
  MenuSection as MenuSectionType,
  TranslationTargetLanguage,
  ALLERGEN_LABELS,
  ADDITIVE_LABELS,
  ALLERGEN_LABELS_KO,
  ADDITIVE_LABELS_KO,
  ALLERGEN_TOOLTIPS,
  ADDITIVE_TOOLTIPS,
  ALLERGEN_TOOLTIPS_KO,
  ADDITIVE_TOOLTIPS_KO,
  CATEGORY_TOOLTIPS,
} from "@/lib/types";

interface Props {
  initialMenu: DailyMenu;
  initialTranslatedMenu?: DailyMenu | null;
}

type TranslatedMenus = Partial<Record<TranslationTargetLanguage, DailyMenu>>;

const DATE_LOCALES: Record<TranslationTargetLanguage, string> = {
  en: "en-US",
  ko: "ko-KR",
};

const UI_TEXT: Record<
  AppLanguage,
  {
    title: string;
    subtitle: string;
    noMenu: string;
    loading: string;
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
    explanationUnavailable: "설명을 불러오지 못했습니다.",
    student: "학생",
    staff: "교직원",
    guest: "외부인",
    studentShort: "학생",
    staffShort: "교직원",
    guestShort: "외부인",
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
};

function isAppLanguage(value: string | null): value is AppLanguage {
  return value === "de" || value === "en" || value === "ko";
}

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
  if (lang === "en" && item.nameEn) return item.nameEn;
  if (lang === "ko" && item.nameKo) return item.nameKo;
  return item.name;
}

function getSectionName(section: MenuSectionType, lang: AppLanguage): string {
  if (lang === "en" && section.nameEn) return section.nameEn;
  if (lang === "ko" && section.nameKo) return section.nameKo;
  return section.name;
}

function getMensaName(menu: DailyMenu, lang: AppLanguage): string {
  if (lang === "en") return menu.mensaNameEn || "Mensa South";
  if (lang === "ko") return menu.mensaNameEn || "Mensa South";
  return menu.mensaName;
}

export default function MenuClient({
  initialMenu,
  initialTranslatedMenu,
}: Props) {
  const [menu] = useState<DailyMenu>(initialMenu);
  const [lang, setLang] = useState<AppLanguage>("de");
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
  const didInitLanguageRef = useRef(false);

  const switchLang = useCallback(
    async (newLang: AppLanguage) => {
      setLang(newLang);
      localStorage.setItem("mensa-lang", newLang);

      if (newLang === "de" || translatedMenus[newLang]) {
        return;
      }

      setTranslating(true);
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ menu, language: newLang }),
        });
        if (res.ok) {
          const translatedMenu = (await res.json()) as DailyMenu;
          setTranslatedMenus((prev) => ({ ...prev, [newLang]: translatedMenu }));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setTranslating(false);
      }
    },
    [menu, translatedMenus],
  );

  useEffect(() => {
    if (didInitLanguageRef.current) {
      return;
    }

    didInitLanguageRef.current = true;
    const storedLang = localStorage.getItem("mensa-lang");

    if (isAppLanguage(storedLang)) {
      void switchLang(storedLang);
    }
  }, [switchLang]);

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
  const showTranslationSkeleton =
    lang !== "de" && translating && !translatedMenus[lang];
  const dateDisplay =
    lang === "de" ? current.date : formatDateForLanguage(current.date, lang);
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
            <button
              className={`lang-btn ${lang === "de" ? "active" : ""}`}
              onClick={() => switchLang("de")}
              disabled={translating}
            >
              DE
            </button>
            <button
              className={`lang-btn ${lang === "en" ? "active" : ""}`}
              onClick={() => switchLang("en")}
              disabled={translating}
            >
              EN
            </button>
            <button
              className={`lang-btn ${lang === "ko" ? "active" : ""}`}
              onClick={() => switchLang("ko")}
              disabled={translating}
            >
              KO
            </button>
          </div>
        </div>
      </header>

      <div className="sections">
        {showTranslationSkeleton ? (
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
              data-tooltip={
                lang === "ko"
                  ? ALLERGEN_TOOLTIPS_KO[a] ||
                    ALLERGEN_TOOLTIPS[a]?.ko ||
                    ALLERGEN_TOOLTIPS[a]?.en ||
                    undefined
                  : ALLERGEN_TOOLTIPS[a]?.[lang] || undefined
              }
            >
              {lang === "de"
                ? a
                : lang === "ko"
                  ? ALLERGEN_LABELS_KO[a] || ALLERGEN_LABELS[a] || a
                  : ALLERGEN_LABELS[a] || a}
            </span>
          ))}
          {item.additives.map((a) => (
            <span
              key={a}
              className="tag additive"
              data-tooltip={
                lang === "ko"
                  ? ADDITIVE_TOOLTIPS_KO[a] ||
                    ADDITIVE_TOOLTIPS[a]?.ko ||
                    ADDITIVE_TOOLTIPS[a]?.en ||
                    undefined
                  : ADDITIVE_TOOLTIPS[a]?.[lang] || undefined
              }
            >
              {lang === "de"
                ? a
                : lang === "ko"
                  ? ADDITIVE_LABELS_KO[a] || ADDITIVE_LABELS[a] || a
                  : ADDITIVE_LABELS[a] || a}
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
