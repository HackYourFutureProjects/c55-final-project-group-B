"use client";

import { useState } from "react";
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
  const suggestions = getSuggestions(titles, query);

  return (
    <div className={styles.wrapper}>
      <input
        type="search"
        id="q"
        name="q"
        aria-label="Search by role, skill or company"
        placeholder="Search by role, skill or company"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoComplete="off"
        className={styles.input}
      />

      {suggestions.length > 0 && (
        <div className={styles.list}>
          {suggestions.map((title) => (
            <button key={title} type="button" className={styles.option}>
              {title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
