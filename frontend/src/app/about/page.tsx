import { StatusPage } from "@/components/status-page";
import { InfoIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { ReactNode } from "react";

export default function AboutPage() {
  return (
    <StatusPage
      icon={InfoIcon}
      variant="info"
      heading="Under construction."
      actions={
        <Link className="button" href="/">
          Back to home
        </Link>
      }
    >
      <p>This page is still being built. Come back another time.</p>
    </StatusPage>
  );
}
