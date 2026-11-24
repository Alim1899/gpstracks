import { useTranslation } from "react-i18next";
import { Pencil, Sparkles, Trash2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/UI/Index";
import { translateTexts } from "@/components/Services/translateService";
import { useAiTranslate } from "@/components/Services/useAiTranslate";
import { WaypointPin } from "@/components/Features/Common/WaypointPin/WaypointPin";
import { missingNameLangs, waypointName } from "@/components/Utils/waypoints";
import styles from "./WaypointEditor.module.css";

/**
 * რედაქტირებისას წერტილების სია: ✎ (ან რიგზე დაჭერა) ხსნის წერტილის ფორმას რუკაზე, 🗑 შლის
 * langs: ბილიკის ენები — სახელი თუ რომელიმე ენაზე აკლია, რიგზე გაფრთხილება ჩანს
 */
export function WaypointEditor({
  waypoints,
  langs,
  selected,
  onSelect,
  onDelete,
  onUpdate,
}) {
  const { t, i18n } = useTranslation();
  const ai = useAiTranslate();
  const canTranslate =
    langs.length > 1 &&
    waypoints.some((w) => missingNameLangs(w, langs).length > 0);

  // ყველა აკლებული სახელი ერთად: ენების თითო წყვილზე ერთი მოთხოვნა
  async function translateNames() {
    const groups = {}; // "ka>en": [{ index, to, text }]
    waypoints.forEach((w, index) => {
      const from = langs.find((lang) => w.name?.[lang]?.trim());
      for (const to of missingNameLangs(w, langs)) {
        (groups[`${from}>${to}`] ??= []).push({
          index,
          to,
          text: w.name[from],
        });
      }
    });

    const names = {}; // index → ახალი სახელები
    const done = await ai.run("waypoints", async () => {
      for (const [pair, jobs] of Object.entries(groups)) {
        const [from, to] = pair.split(">");
        const translated = await translateTexts(
          jobs.map((job) => job.text),
          from,
          to,
        );
        jobs.forEach((job, i) => {
          names[job.index] = { ...names[job.index], [job.to]: translated[i] };
        });
      }
      return true;
    });
    if (!done) return;

    for (const [index, name] of Object.entries(names)) {
      onUpdate(Number(index), { name: { ...waypoints[index].name, ...name } });
    }
  }
  return (
    <section className={styles.card}>
      <div className={styles.head}>
        <h2 className={styles.title}>
          {t("waypoints.title")}
          {waypoints.length > 0 && (
            <span className={styles.count}>{waypoints.length}</span>
          )}
        </h2>
        {canTranslate && (
          <Button
            variant="link"
            onClick={translateNames}
            loading={ai.pending === "waypoints"}
            title={t("waypoints.translateNamesHint")}
          >
            <Sparkles size={16} />
            {t("waypoints.translateNames")}
          </Button>
        )}
      </div>
      {ai.failed === "waypoints" && (
        <p className={styles.aiError}>{t("translate.error")}</p>
      )}

      {waypoints.length === 0 ? (
        <p className={styles.empty}>{t("waypoints.empty")}</p>
      ) : (
        <ul className={styles.list}>
          {waypoints.map((w, i) => {
            const missing = missingNameLangs(w, langs);
            const missingText = missing.length
              ? t("waypoints.missingLangs", {
                  langs: missing.map((l) => t(`languages.${l}`)).join(", "),
                })
              : null;
            return (
              <li
                key={`${i}-${w.lat}-${w.lng}`}
                className={`${styles.item} ${i === selected ? styles.open : ""} ${missing.length ? styles.incomplete : ""}`}
              >
                <button
                  type="button"
                  className={styles.row}
                  onClick={() => onSelect(i)}
                >
                  <WaypointPin type={w.type} size={26} />
                  <span className={styles.name}>
                    {waypointName(w, i18n.resolvedLanguage).text ||
                      t(`waypoints.types.${w.type}`)}
                  </span>
                  {missingText && (
                    <span
                      className={styles.warning}
                      role="img"
                      aria-label={missingText}
                      title={missingText}
                    >
                      <TriangleAlert size={16} />
                    </span>
                  )}
                  {w.ele != null && (
                    <span className={styles.ele}>
                      {w.ele} {t("units.m")}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={() => onSelect(i)}
                  aria-label={t("waypoints.edit")}
                  title={t("waypoints.edit")}
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  className={`${styles.iconButton} ${styles.delete}`}
                  onClick={() => onDelete(i)}
                  aria-label={t("waypoints.delete")}
                  title={t("waypoints.delete")}
                >
                  <Trash2 size={16} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
