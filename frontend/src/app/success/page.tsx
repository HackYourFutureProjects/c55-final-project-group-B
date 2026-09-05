import { UserCircleCheckIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import styles from "./page.module.css";

export default function SuccessPage() {
  return (
    <>
      <section className={styles.section}>
        <div className="container">
          <section className={styles.pane}>
            <div className={styles.card}>
              <UserCircleCheckIcon
                size={64}
                weight="duotone"
                className={styles.icon}
              />
              <h1 className={styles.heading}>Welcome aboard!</h1>
            </div>
            <div className={styles.message}>
              <p>
                Your account has been created successfully. You can now save
                jobs and come back to them anytime. Good luck!
              </p>
              <Link className="button" href={"/jobs"}>
                Browse jobs
              </Link>
            </div>
          </section>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
