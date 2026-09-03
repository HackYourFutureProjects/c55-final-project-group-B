"use client";

import { EyeClosedIcon, EyeIcon } from "@phosphor-icons/react";
import { type ChangeEvent, type FocusEvent, useState } from "react";
import styles from "./password-input.module.css";

type PasswordInputProps = {
  id: string;
  name: string;
  value: string;
  placeholder: string;
  className: string;
  autoComplete: "current-password" | "new-password";
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
};

export default function PasswordInput({
  id,
  name,
  value,
  placeholder,
  className,
  autoComplete,
  onChange,
  onBlur,
  onFocus,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  function toggleVisibility() {
    setVisible((prev) => !prev);
  }

  return (
    <div className={styles.wrapper}>
      <input
        id={id}
        name={name}
        value={value}
        placeholder={placeholder}
        className={className}
        autoComplete={autoComplete}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        type={visible ? "text" : "password"}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
      ></input>
      <button
        type="button"
        className={styles.toggle}
        onClick={toggleVisibility}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
      >
        {visible ? (
          <EyeIcon size={18} weight="duotone" />
        ) : (
          <EyeClosedIcon size={18} weight="duotone" />
        )}
      </button>
    </div>
  );
}
