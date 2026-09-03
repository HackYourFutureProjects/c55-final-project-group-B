"use client";

import { QuestionIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { StatusPage } from "@/components/status-page";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <StatusPage
      icon={QuestionIcon}
      variant="error"
      heading="Something went wrong..."
      actions={
        <>
          <Link className="button" href="/">
            Back to home
          </Link>
          <button type="button" className="button-secondary" onClick={reset}>
            Try again
          </button>
        </>
      }
    >
      <p>{error.message}</p>
    </StatusPage>
  );
}
