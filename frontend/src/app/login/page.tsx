import styles from "./page.module.css";

export default function LoginPage() {
  return (
    <div className="container">
      <section className={styles.pane}>
        <h1>Login</h1>
        <form className={styles.form}>
          <div className={styles.name}>
            <div className="firstName">
              <label htmlFor="firstName">First name:</label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                aria-label="First name"
                placeholder="John"
              />
            </div>
            <div className="lastName">
              <label htmlFor="lastName">Last name:</label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                aria-label="Last name"
                placeholder="Smith"
              />
            </div>
          </div>
          <label htmlFor="email">E-mail:</label>
          <input
            type="email"
            name="email"
            id="email"
            aria-label="E-mail"
            placeholder="user@example.com"
          />
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            name="password"
            id="password"
            aria-label="Password"
            placeholder="**********"
          />
        </form>
      </section>
    </div>
  );
}
