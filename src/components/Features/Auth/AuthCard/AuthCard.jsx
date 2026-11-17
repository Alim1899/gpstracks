import styles from "./AuthCard.module.css";

export function AuthCard({ title, subtitle, children }) {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <header className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </header>
        {children}
      </section>
    </main>
  );
}