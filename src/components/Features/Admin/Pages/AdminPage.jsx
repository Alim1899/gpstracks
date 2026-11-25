import { Link, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { Alert, Loader } from "@/components/UI/Index";
import { localized } from "@/components/Utils/localized";
import { MODERATION_STATUSES } from "@/components/Services/adminService";
import { useModerationTrails, useStatusCounts } from "@/hooks/useAdmin";
import { ModerationPanel } from "../ModerationPanel/ModerationPanel";
import styles from "./AdminPage.module.css";

// მოდერაცია: ტაბები სტატუსებით (URL-ში ?status=), სია მოქმედებებით
export function AdminPage() {
  const { t, i18n } = useTranslation();
  const [params, setParams] = useSearchParams();
  const status = MODERATION_STATUSES.includes(params.get("status")) ? params.get("status") : "pending";
  const counts = useStatusCounts().data;
  const { data: trails, isLoading, isError } = useModerationTrails(status);

  const lang = i18n.resolvedLanguage;
  const dateFormat = new Intl.DateTimeFormat(lang === "ka" ? "ka-GE" : "en-GB", { dateStyle: "medium" });

  return (
    <div className={styles.page}>
      <title>{`${t("admin.title")} — GPS Tracks`}</title>
      <h1 className={styles.title}>{t("admin.title")}</h1>

      <div className={styles.tabs} role="tablist">
        {MODERATION_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={s === status}
            className={`${styles.tab} ${s === status ? styles.activeTab : ""}`}
            onClick={() => setParams(s === "pending" ? {} : { status: s })}
          >
            {t(`admin.tabs.${s}`)}
            {counts && <span className={styles.count}>{counts[s]}</span>}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Loader />
      ) : isError ? (
        <Alert variant="error">{t("admin.loadError")}</Alert>
      ) : trails.length === 0 ? (
        <p className={styles.empty}>{t(`admin.empty.${status}`)}</p>
      ) : (
        <ul className={styles.list}>
          {trails.map((trail) => {
            const title = localized(trail.title, lang);
            return (
              <li key={trail.id} className={styles.row}>
                <div className={styles.info}>
                  <Link to={`/trails/${trail.id}`} className={styles.trailTitle} lang={title.lang ?? undefined}>
                    {title.text}
                  </Link>
                  <p className={styles.meta}>
                    {t(`activities.${trail.activity}`)} · {trail.distanceKm?.toFixed(1)} {t("units.km")} ·{" "}
                    {trail.municipalities?.map((m) => t(`municipalities.${m}`)).join(", ")}
                  </p>
                  <p className={styles.meta}>
                    {t("trailPage.by", { name: trail.authorName || "—" })}
                    {trail.createdAt && ` · ${dateFormat.format(trail.createdAt.toDate())}`}
                  </p>
                </div>
                <ModerationPanel trail={trail} compact />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}