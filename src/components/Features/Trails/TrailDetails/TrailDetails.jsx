import { useTranslation } from "react-i18next";
import { localized } from "@/components/Utils/localized";
import styles from "./TrailDetails.module.css";

// [6,7,8,9] → "ივნ – სექ"; [5,6,9] → "მაი – ივნ, სექ"
function formatMonths(months, t) {
  const sorted = [...months].sort((a, b) => a - b);
  const ranges = [];
  for (const m of sorted) {
    const last = ranges.at(-1);
    if (last && m === last[1] + 1) last[1] = m;
    else ranges.push([m, m]);
  }
  return ranges
    .map(([a, b]) => (a === b ? t(`months.${a}`) : `${t(`months.${a}`)} – ${t(`months.${b}`)}`))
    .join(", ");
}

export function TrailDetails({ trail }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage;
  const description = localized(trail.description, lang);

  // მხოლოდ შევსებული ველები
  const rows = [
    { label: t("trailForm.routeType"), value: t(`routeTypes.${trail.routeType}`) },
    trail.seasons?.length && { label: t("trailForm.seasons"), value: formatMonths(trail.seasons, t) },
    trail.access && { label: t("trailForm.access"), value: t(`access.${trail.access}`) },
  ].filter(Boolean);

  const chipGroups = [
    trail.features?.length && { label: t("trailForm.features"), items: trail.features.map((f) => t(`features.${f}`)) },
    trail.overnight?.length && { label: t("trailForm.overnight"), items: trail.overnight.map((o) => t(`overnight.${o}`)) },
  ].filter(Boolean);

  return (
    <>
      {description.text && (
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.title}>{t("trailForm.description")}</h2>
            {description.lang !== lang && (
              <span className={styles.langBadge}>
                {t("trailPage.onlyIn", { language: t(`trailPage.inLanguage.${description.lang}`) })}
              </span>
            )}
          </div>
          <p className={styles.description} lang={description.lang}>{description.text}</p>
        </section>
      )}

      <section className={styles.card}>
        <h2 className={styles.title}>{t("trailPage.details")}</h2>
        <dl className={styles.rows}>
          {rows.map((row) => (
            <div key={row.label} className={styles.row}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
        {chipGroups.map((group) => (
          <div key={group.label} className={styles.chipGroup}>
            <h3 className={styles.chipLabel}>{group.label}</h3>
            <ul className={styles.chips}>
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </>
  );
}