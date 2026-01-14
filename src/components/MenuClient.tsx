"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DailyMenu,
  MenuItem as MenuItemType,
  MenuSection as MenuSectionType,
  ALLERGEN_LABELS,
  ADDITIVE_LABELS,
  ALLERGEN_TOOLTIPS,
  ADDITIVE_TOOLTIPS,
  CATEGORY_TOOLTIPS,
} from "@/lib/types";

interface Props {
  initialMenu: DailyMenu;
}

export default function MenuClient({ initialMenu }: Props) {
  const [menu] = useState<DailyMenu>(initialMenu);
  const [lang, setLang] = useState<"de" | "en">("de");
  const [translating, setTranslating] = useState(false);
  const [translated, setTranslated] = useState<DailyMenu | null>(null);
  const [modal, setModal] = useState<{
    item: MenuItemType;
    text: string | null;
    loading: boolean;
  } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("mensa-lang");
    if (saved === "en" || saved === "de") setLang(saved);
  }, []);

  const switchLang = useCallback(
    async (newLang: "de" | "en") => {
      setLang(newLang);
      localStorage.setItem("mensa-lang", newLang);

      if (newLang === "en" && !translated) {
        setTranslating(true);
        try {
          const res = await fetch("/api/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ menu }),
          });
          if (res.ok) setTranslated(await res.json());
        } catch (e) {
          console.error(e);
        } finally {
          setTranslating(false);
        }
      }
    },
    [menu, translated]
  );

  useEffect(() => {
    const saved = localStorage.getItem("mensa-lang");
    if (saved === "en" && !translated && !translating) {
      switchLang("en");
    }
  }, [switchLang, translated, translating]);

  const openModal = useCallback(
    async (item: MenuItemType) => {
      setModal({ item, text: null, loading: true });
      try {
        const res = await fetch("/api/explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dishName: item.name, language: lang }),
        });
        if (res.ok) {
          const data = await res.json();
          setModal((m) =>
            m ? { ...m, text: data.explanation, loading: false } : null
          );
        } else {
          throw new Error("Failed");
        }
      } catch {
        setModal((m) =>
          m
            ? {
                ...m,
                text:
                  lang === "en"
                    ? "Could not load explanation."
                    : "Erklärung nicht verfügbar.",
                loading: false,
              }
            : null
        );
      }
    },
    [lang]
  );

  const closeModal = () => setModal(null);

  const current = lang === "en" && translated ? translated : menu;
  const dateDisplay =
    lang === "en"
      ? new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : current.date;

  return (
    <div className="app">
      <header className="header">
        <div className="header-row">
          <div>
            <h1 className="title">
              {lang === "en" ? "Mensa South" : "Mensa Süd"}
            </h1>
            <p className="subtitle">
              {lang === "en" ? "University of Rostock" : "Universität Rostock"}
            </p>
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
          </div>
        </div>
      </header>

      <div className="sections">
        {current.sections.length === 0 ? (
          <div className="empty">
            {lang === "en"
              ? "No menu available today."
              : "Heute kein Menü verfügbar."}
          </div>
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
              <h3 className="modal-title">
                {lang === "en" && modal.item.nameEn
                  ? modal.item.nameEn
                  : modal.item.name}
              </h3>
              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              {modal.loading ? (
                <div className="loading">
                  <div className="spinner" />
                  <span>{lang === "en" ? "Loading..." : "Laden..."}</span>
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

function Section({
  section,
  lang,
  onItemClick,
}: {
  section: MenuSectionType;
  lang: "de" | "en";
  onItemClick: (item: MenuItemType) => void;
}) {
  const [open, setOpen] = useState(true);
  const name = lang === "en" && section.nameEn ? section.nameEn : section.name;
  const count = section.items.length;

  return (
    <div className="section">
      <div className="section-header" onClick={() => setOpen(!open)}>
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
  lang: "de" | "en";
  onClick: () => void;
}) {
  const name = lang === "en" && item.nameEn ? item.nameEn : item.name;

  const categoryLabels: Record<string, string> = {
    vegan: lang === "en" ? "Vegan" : "Vegan",
    vegetarisch: lang === "en" ? "Vegetarian" : "Vegetarisch",
    Fisch: lang === "en" ? "Fish" : "Fisch",
    meat: lang === "en" ? "Meat" : "Fleisch",
  };

  const categoryClass: Record<string, string> = {
    vegan: "vegan",
    vegetarisch: "vegetarian",
    Fisch: "fish",
    meat: "meat",
  };

  return (
    <div className="item" onClick={onClick}>
      <div className="item-content">
        <div className="item-name">{name}</div>
        <div className="item-tags">
          <span
            className={`tag ${categoryClass[item.category] || ""}`}
            data-tooltip={CATEGORY_TOOLTIPS[item.category]?.[lang] || undefined}
          >
            {categoryLabels[item.category] || item.category}
          </span>
          {item.allergens.map((a) => (
            <span
              key={a}
              className="tag allergen"
              data-tooltip={ALLERGEN_TOOLTIPS[a]?.[lang] || undefined}
            >
              {lang === "en" ? ALLERGEN_LABELS[a] || a : a}
            </span>
          ))}
          {item.additives.map((a) => (
            <span
              key={a}
              className="tag additive"
              data-tooltip={ADDITIVE_TOOLTIPS[a]?.[lang] || undefined}
            >
              {lang === "en" ? ADDITIVE_LABELS[a] || a : a}
            </span>
          ))}
        </div>
      </div>
      <span className="item-info">i</span>
    </div>
  );
}
