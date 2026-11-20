import { Component } from "react";
import { useTranslation } from "react-i18next";
import { TriangleAlert } from "lucide-react";
import styles from "@/components/Features/Common/Pages/NotFoundPage.module.css";

function ErrorFallback() {
  const { t } = useTranslation();

  return (
    <div className={styles.page} role="alert">
      <TriangleAlert size={56} strokeWidth={1.5} className={styles.icon} />
      <h1 className={styles.title}>{t("errorPage.title")}</h1>
      <p className={styles.text}>{t("errorPage.text")}</p>
      <button type="button" className={styles.link} onClick={() => window.location.reload()}>
        {t("errorPage.reload")}
      </button>
    </div>
  );
}

export class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // მოგვიანებით აქ შეცდომების სერვისი ჩაჯდება (მაგ. Sentry)
    console.error(error, info.componentStack);
  }

  render() {
    return this.state.hasError ? <ErrorFallback /> : this.props.children;
  }
}