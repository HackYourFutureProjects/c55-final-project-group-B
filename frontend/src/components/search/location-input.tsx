"use client";

import {
  type ChangeEvent,
  type KeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { getLocationSuggestions, type LocationOption } from "@/lib/job-filters";
import styles from "./location-input.module.css";

type LocationInputProps = {
  options: LocationOption[];
  defaultValue?: string;
};

export default function LocationInput({
  options,
  defaultValue,
}: LocationInputProps) {
  const [text, setText] = useState(
    () => options.find((option) => option.value === defaultValue)?.label ?? "",
  );
  const [isOpen, setIsOpen] = useState(false);
  // Index of the keyboard-highlighted suggestion; -1 means none.
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const suggestions = getLocationSuggestions(options, text);
  const showList = isOpen && suggestions.length > 0;
  const activeId = activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined;

  const normalizedText = text.trim().toLowerCase();
  const selected = options.find(
    (option) => option.label.toLowerCase() === normalizedText,
  );
  const submitValue = selected?.value ?? "";

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
    setText(event.target.value);
    setIsOpen(true);
    setActiveIndex(-1);
  }

  function select(option: LocationOption) {
    setText(option.label);
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
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
        type="text"
        id="location"
        role="combobox"
        aria-label="Location filter"
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={listId}
        aria-activedescendant={activeId}
        placeholder="City or province"
        value={text}
        onChange={handleChange}
        onBlur={() => {
          setIsOpen(false);
          setActiveIndex(-1);
        }}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        className={styles.input}
      />
      <input type="hidden" name="location" value={submitValue} />

      {showList && (
        <div
          id={listId}
          role="listbox"
          aria-label="Location suggestions"
          className={styles.list}
          onMouseDown={(event) => event.preventDefault()}
        >
          {suggestions.map((option, index) => (
            <button
              key={option.value}
              type="button"
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              tabIndex={-1}
              className={`${styles.option} ${
                index === activeIndex ? styles.active : ""
              }`}
              onClick={() => select(option)}
            >
              {option.label}
              <span className={styles.kind}>{option.kind}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
