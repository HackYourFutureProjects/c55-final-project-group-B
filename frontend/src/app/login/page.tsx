import Link from "next/link";
import LoginForm from "@/components/auth/login-form";
import styles from "./page.module.css";

export const metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.pane}>
          <h1 className={styles.title}>Log in</h1>
          <p className={styles.subtitle}>
            Welcome back. Log in to see your saved jobs.
          </p>

          <LoginForm />

          <p className={styles.note}>
            No account yet?{" "}
            <Link href="/signup" className={styles.noteLink}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
