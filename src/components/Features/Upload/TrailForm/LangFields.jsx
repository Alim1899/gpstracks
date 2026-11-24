import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";
import { LANGUAGES } from "@/i18n";
import { Button, Input, Textarea } from "@/components/UI/Index";
import { translateTexts } from "@/components/Services/translateService";
import { DESCRIPTION_MAX, TITLE_MAX, getActiveLangs } from "./trailFormSchema";
import styles from "./TrailForm.module.css";
import { useAiTranslate } from "@/components/Services/useAiTranslate";

const FIELDS = ["title", "description"];
const LANG_LABELS = Object.fromEntries(LANGUAGES.map((l) => [l.code, l.label]));

/**
 * რა ითარგმნება: თითო ველი შევსებული ენიდან იმ ენებზე, სადაც ცარიელია
 * შევსებულ ველს თარგმანი არ ცვლის — ხელახლა სათარგმნად ავტორი ველს ასუფთავებს
 */
function buildPlan(values, langs) {
  return FIELDS.flatMap((field) => {
    const filled = langs.filter((lang) => values[`${field}_${lang}`].trim());
    if (!filled.length) return [];
    return langs
      .filter((lang) => !filled.includes(lang))
      .map((to) => ({ field, from: filled[0], to }));
  });
}

// სათაური და აღწერა ყველა ენაზე (ორივე სავალდებულო) + ერთი AI თარგმნის ღილაკი
export function LangFields({ values, setFields, getFieldProps }) {
  const { t } = useTranslation();
  const langs = getActiveLangs(values);
  const ai = useAiTranslate();
  const plan = buildPlan(values, langs);

  // ღილაკზე მიმართულება: "ქარ → ENG" ან, თუ ორივე მხარეს რამე ითარგმნება, "ქარ ⇄ ENG"
  const directions = [...new Set(plan.map((job) => `${job.from}>${job.to}`))];
  const directionLabel =
    directions.length === 1
      ? directions[0].split(">").map((lang) => LANG_LABELS[lang]).join(" → ")
      : langs.map((lang) => LANG_LABELS[lang]).join(" ⇄ ");

  async function translate() {
    const patch = {};
    const done = await ai.run("trail", async () => {
      for (const pair of directions) {
        const [from, to] = pair.split(">");
        const jobs = plan.filter((job) => job.from === from && job.to === to);
        const translated = await translateTexts(
          jobs.map((job) => values[`${job.field}_${from}`]),
          from,
          to,
        );
        jobs.forEach((job, i) => {
          patch[`${job.field}_${to}`] = translated[i];
        });
      }
      return true;
    });
    if (!done) return;

    const translatedLangs = directions.map((pair) => pair.split(">")[1]);
    setFields({ ...patch, aiLangs: [...new Set([...values.aiLangs, ...translatedLangs])] });
  }

  // ერთი ადგილი შეტყობინებისთვის: შეცდომა → ნათარგმნია → რა უნდა ქნას ავტორმა
  const status = ai.failed
    ? { text: t("translate.error"), error: true }
    : values.aiLangs.length
      ? {
          text: t("trailForm.aiTranslatedNote", {
            langs: values.aiLangs.map((lang) => LANG_LABELS[lang]).join(", "),
          }),
        }
      : { text: t(plan.length ? "trailForm.aiTranslateReady" : "trailForm.aiTranslateIdle") };

  return (
    <>
      <div className={styles.translateBar}>
        <Button
          variant="outline"
          onClick={translate}
          loading={ai.pending === "trail"}
          disabled={!plan.length || ai.pending != null}
        >
          <Sparkles size={16} />
          {t("trailForm.aiTranslate")}
          {plan.length > 0 && <span className={styles.direction}>{directionLabel}</span>}
        </Button>
        <p className={`${styles.translateStatus} ${status.error ? styles.aiError : ""}`} role="status">
          {status.text}
        </p>
      </div>

      <div className={styles.langGrid}>
        {langs.map((lang) => (
          <div key={lang} className={styles.langGroup}>
            <h3 className={styles.langTitle}>
              {t(`languages.${lang}`)}
              {values.aiLangs.includes(lang) && <span className={styles.aiBadge}>AI</span>}
            </h3>

            <Input
              label={`${t("trailForm.title")} *`}
              placeholder={t("trailForm.titlePlaceholder", { lng: lang })}
              maxLength={TITLE_MAX}
              lang={lang}
              {...getFieldProps(`title_${lang}`)}
            />
            <Textarea
              label={t("trailForm.description")}
              placeholder={t("trailForm.descriptionPlaceholder", { lng: lang })}
              maxLength={DESCRIPTION_MAX}
              rows={5}
              lang={lang}
              {...getFieldProps(`description_${lang}`)}
            />
          </div>
        ))}
      </div>
    </>
  );
}