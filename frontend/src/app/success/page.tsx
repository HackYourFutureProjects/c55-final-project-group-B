import { UserCircleCheckIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { StatusPage } from "@/components/status-page";

export default function SuccessPage() {
  return (
    <StatusPage
      icon={UserCircleCheckIcon}
      variant="success"
      heading="Welcome aboard!"
      actions={
        <Link className="button" href="/jobs">
          Browse jobs
        </Link>
      }
    >
      <p>
        Your account has been created successfully. You can now save jobs and
        come back to them anytime. Good luck!
      </p>
    </StatusPage>
  );
}
