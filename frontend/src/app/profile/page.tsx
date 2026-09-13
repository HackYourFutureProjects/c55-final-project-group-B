import Link from "next/link";
import { StatusPage } from "@/components/ui/status-page";
import { InfoIcon } from "@phosphor-icons/react/ssr";

export default function ProfilePage() {
  return (
    <StatusPage
      icon={InfoIcon}
      variant="info"
      heading="Under Construction"
      actions={
        <>
          <Link className="button" href="/">
            Back to home
          </Link>
          <Link
            className="button-secondary"
            href="https://github.com/HackYourFutureProjects/c55-final-project-group-B"
          >
            Star the project
          </Link>
        </>
      }
    >
      <p>
        This page is currently being built and more features are coming. Follow
        the project on GitHub to stay informed of the latest changes.
      </p>
      <p>Stay tuned and check back here soon!</p>
    </StatusPage>
  );
}
