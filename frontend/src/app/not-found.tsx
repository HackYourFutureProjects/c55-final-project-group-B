import { WarningDiamondIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { StatusPage } from "@/components/status-page";

export default function NotFoundPage() {
  return (
    <StatusPage
      icon={WarningDiamondIcon}
      variant="warning"
      heading="Page not found."
      actions={
        <>
          <Link className="button" href="/">
            Back to home
          </Link>
          <Link className="button-secondary" href="/jobs">
            Browse jobs
          </Link>
        </>
      }
    >
      <p>The page you are looking for does not exist.</p>
    </StatusPage>
  );
}
