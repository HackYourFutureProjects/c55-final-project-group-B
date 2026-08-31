import Link from "next/link";
import SignupForm from "@/components/signup-form";
import styles from "./page.module.css";

export default function SignupPage() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.pane}>
          <h1 className={styles.title}>Sign up</h1>
          <p className={styles.subtitle}>
            Create an account to save jobs you like.
          </p>

          <SignupForm />

          <p className={styles.note}>
            Already have an account?{" "}
            <Link href="/login" className={styles.noteLink}>
              Log in
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
