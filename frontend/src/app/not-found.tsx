import { WarningDiamondIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { StatusPage } from "@/components/status-page";

export default function NotFoundPage() {
  return (
    <StatusPage
      icon={WarningDiamondIcon}
      variant="warning"
      heading="Page not found"
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
      <p>
        The page you're looking for doesn't exist, or it may have moved.
        Double-check the address, or pick up where you left off from the home
        page.
      </p>
      <p>Sorry for the detour!</p>
    </StatusPage>
  );
}
