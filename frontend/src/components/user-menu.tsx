"use client";

import { HeartIcon, SignOutIcon, UserCircleIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { logout } from "@/lib/auth";
import { useCurrentUser } from "../context/current-user-provider";
import styles from "./user-menu.module.css";

export default function UserMenu() {
  const { user, isLoading, clearUser } = useCurrentUser();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  // While open, close on any click outside the menu and on Escape.
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // While the stored user is being read, render an invisible copy of the
  // logged-out links so the header keeps its size instead of jumping.
  if (isLoading) {
    return (
      <div className={`${styles.auth} ${styles.pending}`} aria-hidden="true">
        <span className="button-secondary">Log in</span>
        <span className="button">Sign up</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.auth}>
        <Link href="/login" className="button-secondary">
          Log in
        </Link>
        <Link href="/signup" className="button">
          Sign up
        </Link>
      </div>
    );
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch {
      // A failed logout most likely means the session is already gone, so
      // ending up logged out locally is correct either way.
    }
    clearUser();
    setIsOpen(false);
    setIsLoggingOut(false);
    router.push("/");
  }

  return (
    <div className={styles.auth} ref={containerRef}>
      <button
        type="button"
        ref={triggerRef}
        className={styles.trigger}
        aria-label="Account menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <UserCircleIcon size={28} weight={isOpen ? "fill" : "duotone"} />
      </button>

      {isOpen && (
        <div id={menuId} className={styles.menu}>
          <p className={styles.identity}>
            <span className={styles.name}>{user.name}</span>
            <span className={styles.email}>{user.email}</span>
          </p>
          <Link
            href="/saved-jobs"
            className={styles.item}
            onClick={() => setIsOpen(false)}
          >
            <HeartIcon size={18} weight="duotone" aria-hidden="true" />
            Saved jobs
          </Link>
          <button
            type="button"
            className={styles.item}
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <SignOutIcon size={18} weight="duotone" aria-hidden="true" />
            {isLoggingOut ? "Logging out…" : "Log out"}
          </button>
        </div>
      )}
    </div>
  );
}
