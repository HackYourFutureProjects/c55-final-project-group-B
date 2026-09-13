"use client";

import {
  type ChangeEvent,
  type KeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { getSuggestions } from "@/lib/job-filters";
import styles from "./search-input.module.css";

type SearchInputProps = {
  titles: string[];
  defaultValue?: string;
};

export default function SearchInput({
  titles,
  defaultValue,
}: SearchInputProps) {
  const [query, setQuery] = useState(defaultValue ?? "");
  const [isOpen, setIsOpen] = useState(false);
  // Index of the keyboard-highlighted suggestion; -1 means none.
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const suggestions = getSuggestions(titles, query);
  const showList = isOpen && suggestions.length > 0;
  const activeId = activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined;

  // While open, close on any click outside the input and its list.
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value);
    setIsOpen(true);
    setActiveIndex(-1);
  }

  function select(title: string) {
    setQuery(title);
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      // Only intercept while the list is open: a search input clears its
      // text on Escape in Chrome and Safari, which is fine once it's closed.
      if (isOpen) {
        event.preventDefault();
        setIsOpen(false);
        setActiveIndex(-1);
      }
      return;
    }

    if (suggestions.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault(); // stops the caret jumping to the end
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen) {
        return;
      }
      setActiveIndex(
        (prev) => (prev - 1 + suggestions.length) % suggestions.length,
      );
    } else if (event.key === "Enter" && showList && activeIndex >= 0) {
      event.preventDefault(); // stops the form submitting the half-typed text
      select(suggestions[activeIndex]);
    }
  }

  return (
    <div className={styles.wrapper} ref={containerRef}>
      <input
        type="search"
        id="q"
        name="q"
        role="combobox"
        aria-label="Search by role, skill or company"
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={listId}
        aria-activedescendant={activeId}
        placeholder="Search by role, skill or company"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        className={styles.input}
      />

      {showList && (
        <div
          id={listId}
          role="listbox"
          aria-label="Suggestions"
          className={styles.list}
          onMouseDown={(event) => event.preventDefault()}
        >
          {suggestions.map((title, index) => (
            <button
              key={title}
              type="button"
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              tabIndex={-1}
              className={`${styles.option} ${
                index === activeIndex ? styles.active : ""
              }`}
              onClick={() => select(title)}
            >
              {title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
