import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Sparkles, Trash2, X } from "lucide-react";
import { LANGUAGES } from "@/i18n";
import { WaypointPin } from "@/components/Features/Common/WaypointPin/WaypointPin";
import {
  WAYPOINT_NAME_MAX,
  WAYPOINT_TYPES,
  missingNameLangs,
} from "@/components/Utils/waypoints";
import styles from "./WaypointForm.module.css";
import { translateTexts } from "@/components/Services/translateService";
import { useAiTranslate } from "@/components/Services/useAiTranslate";

const LANG_LABELS = Object.fromEntries(LANGUAGES.map((l) => [l.code, l.label]));

/**
 * წერტილის სახელი (ბილიკის ყველა ენაზე) და ტიპი — პირდაპირ რუკაზე, წერტილის popup-ში
 * langs: ბილიკის ენები; სახელი ან ცარიელია, ან ყველა ენაზეა შევსებული
 * isNew: ახალი წერტილი (გაუქმება = წაშლა)
 */
export function WaypointForm({
  waypoint,
  langs,
  isNew,
  onChange,
  onConfirm,
  onDelete,
}) {
  const { t } = useTranslation();
  const formRef = useRef(null);
  const missing = missingNameLangs(waypoint, langs);
  // არსებულ არასრულ წერტილზე (მაგ. ბილიკს ენა დაემატა) შეცდომა მაშინვე ჩანს
  const [showMissing, setShowMissing] = useState(
    () => !isNew && missing.length > 0,
  );

  // preventScroll: ფოკუსმა გვერდი არ ჩამოასქროლოს
  useEffect(() => {
    const first =
      formRef.current?.querySelector('[aria-invalid="true"]') ??
      formRef.current?.querySelector("input");
    first?.focus({ preventScroll: true });
  }, []);

    const ai = useAiTranslate();
  // სახელი ერთ ენაზეა, მეორეზე აკლია → AI-ით შევსება
  const source = langs.find((lang) => waypoint.name?.[lang]?.trim());
  const canTranslate = Boolean(source) && missing.length > 0;

  async function translateName() {
    const translated = await ai.run("name", async () => {
      const name = {};
      for (const to of missing) {
        [name[to]] = await translateTexts([waypoint.name[source]], source, to);
      }
      return name;
    });
    if (translated) onChange({ name: { ...waypoint.name, ...translated } });
  }
  function changeName(lang, value) {
    onChange({ name: { ...waypoint.name, [lang]: value } });
  }

  function submit(e) {
    e.preventDefault();
    if (missing.length) {
      setShowMissing(true);
      formRef.current
        .querySelector(`input[lang="${missing[0]}"]`)
        ?.focus({ preventScroll: true });
      return;
    }
    onConfirm();
  }

  const multi = langs.length > 1;

  return (
    <form ref={formRef} className={styles.form} onSubmit={submit} noValidate>
      {langs.map((lang) => {
        const invalid = showMissing && missing.includes(lang);
        return (
          <div
            key={lang}
            className={`${styles.field} ${invalid ? styles.invalid : ""}`}
          >
            {multi && (
              <span className={styles.langTag}>
                {LANG_LABELS[lang] ?? lang}
              </span>
            )}
            <input
              className={styles.input}
              lang={lang}
              value={waypoint.name?.[lang] ?? ""}
              placeholder={t("waypoints.namePlaceholder", { lng: lang })}
              maxLength={WAYPOINT_NAME_MAX}
              aria-label={`${t("waypoints.name")} (${t(`languages.${lang}`)})`}
              aria-invalid={invalid}
              onChange={(e) => changeName(lang, e.target.value)}
            />
          </div>
        );
      })}
            {(canTranslate || ai.failed) && (
        <div className={styles.nameActions}>
          <div className={styles.error} role="alert">
            {ai.failed ? t("translate.error") : showMissing ? t("waypoints.nameAllLangs") : null}
          </div>
          {canTranslate && (
            <button
              type="button"
              className={styles.translate}
              onClick={translateName}
              disabled={ai.pending != null}
            >
              <Sparkles size={14} />
              {ai.pending ? t("waypoints.translating") : t("waypoints.translateName")}
            </button>
          )}
        </div>
      )}

      <div
        className={styles.types}
        role="radiogroup"
        aria-label={t("waypoints.type")}
      >
        {WAYPOINT_TYPES.map(({ id }) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={waypoint.type === id}
            title={t(`waypoints.types.${id}`)}
            className={`${styles.type} ${waypoint.type === id ? styles.active : ""}`}
            onClick={() => onChange({ type: id })}
          >
            <WaypointPin type={id} size={26} />
          </button>
        ))}
      </div>

      {/* div და არა p: Leaflet popup-ში p-ს დიდი დაშორებები აქვს */}
      <div className={styles.meta}>
        {t(`waypoints.types.${waypoint.type}`)}
        {waypoint.ele != null && ` · ${waypoint.ele} ${t("units.m")}`}
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.secondary} onClick={onDelete}>
          {isNew ? <X size={16} /> : <Trash2 size={16} />}
          {isNew ? t("waypoints.cancel") : t("waypoints.delete")}
        </button>
        <button type="submit" className={styles.primary}>
          <Check size={16} />
          {t("waypoints.done")}
        </button>
      </div>
    </form>
  );
}
