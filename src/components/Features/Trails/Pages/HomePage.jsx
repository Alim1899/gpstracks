import { useState } from "react";
import { List, Map as MapIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import styles from "./HomePage.module.css";

export function HomePage() {
  const { t } = useTranslation();
  const [mobileView, setMobileView] = useState("list"); // list | map

  const toggleView = () => setMobileView((v) => (v === "list" ? "map" : "list"));

  return (
    <div className={styles.page}>
      <div className={styles.filters}>{t("home.filters")}</div>

      <div className={styles.content} data-view={mobileView}>
        <section className={styles.listPanel} aria-label={t("home.list")}>
          {t("home.list")}
        </section>
        <section className={styles.mapPanel} aria-label={t("home.map")}>
          {t("home.map")}
        </section>
      </div>

      <button className={styles.viewToggle} onClick={toggleView}>
        {mobileView === "list" ? (
          <><MapIcon size={18} /> {t("home.showMap")}</>
        ) : (
          <><List size={18} /> {t("home.showList")}</>
        )}
      </button>
    </div>
  );
}