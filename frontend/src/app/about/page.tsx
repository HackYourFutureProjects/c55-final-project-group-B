import { InfoIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { StatusPage } from "@/components/status-page";

export default function AboutPage() {
  return (
    <StatusPage
      icon={InfoIcon}
      variant="info"
      heading="Under construction"
      actions={
        <Link className="button" href="/">
          Back to home
        </Link>
      }
    >
      <p>
        This page hasn't been built yet. We're a student team building the
        project one sprint at a time, so it should appear before long.
      </p>
      <p>Thanks for your patience!</p>
    </StatusPage>
  );
}
