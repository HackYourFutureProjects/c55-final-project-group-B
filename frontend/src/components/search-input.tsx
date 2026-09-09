"use client";

import { useState } from "react";
import styles from "./search-input.module.css";

type SearchInputProps = {
  titles: string[];
  defaultValue?: string;
};

export default function SearchInput({
  titles,
  defaultValue,
}: SearchInputProps) {
  const [query, setQuery] = useState("");

  return (
    <input
      type="search"
      id="q"
      name="q"
      aria-label="Search by role, skill or company"
      placeholder="Search by role, skill or company"
      defaultValue={defaultValue}
      // onChange={(e) => setQuery(e.target.value)}
      autoComplete="off"
      className={styles.input}
    />
  );
}
