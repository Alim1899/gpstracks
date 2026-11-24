import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";
import { LANGUAGES } from "@/i18n";
import { useAiTranslate } from "@/components/Services/useAiTranslate";
import { Button, Checkbox, Input, SegmentedControl, Textarea } from "@/components/UI/Index";
import { translateTexts } from "@/components/Services/translateService";
import { DESCRIPTION_MAX, TITLE_MAX, getActiveLangs } from "./trailFormSchema";
import styles from "./TrailForm.module.css";

// შევსების ენა + სახელი და აღწერა არჩეულ ენებზე
export function LangFields({ values, setFields, getFieldProps }) {
  const { t } = useTranslation();
  const activeLangs = getActiveLangs(values);

    const ai = useAiTranslate();

  // სათაური და აღწერა მეორე ენიდან; შედეგი ჩვეულებრივ ველებშია, ავტორს შესწორება შეუძლია
  async function translateTo(to) {
    const from = activeLangs.find((lang) => lang !== to);
    const result = await ai.run(to, () =>
      translateTexts([values[`title_${from}`], values[`description_${from}`]], from, to),
    );
    if (!result) return;
    const [title, description] = result;
    setFields({
      [`title_${to}`]: title,
      [`description_${to}`]: description,
      aiLangs: [...new Set([...values.aiLangs, to])],
    });
  }

  // თარგმნა შეიძლება, თუ მეორე ენაზე სათაური ან აღწერა შევსებულია
  const hasSource = (to) => {
    const from = activeLangs.find((lang) => lang !== to);
    return Boolean(values[`title_${from}`]?.trim() || values[`description_${from}`]?.trim());
  };

  return (
    <>
      <div className={styles.langBar}>
        <span className={styles.langLabel}>{t("trailForm.contentLang")}</span>
        <SegmentedControl
          ariaLabel={t("trailForm.contentLang")}
          options={LANGUAGES.map((l) => ({ value: l.code, label: l.label }))}
          value={values.primaryLang}
          onChange={(code) => setFields({ primaryLang: code })}
        />
        <Checkbox
          label={t("trailForm.bothLangs")}
          checked={values.bothLangs}
          onChange={(checked) => setFields({ bothLangs: checked })}
        />
      </div>

    <div className={values.bothLangs ? styles.langGrid : undefined}>
        {activeLangs.map((lang) => (
          <div key={lang} className={values.bothLangs ? styles.langGroup : styles.fields}>
            {values.bothLangs && <h3 className={styles.langTitle}>{t(`languages.${lang}`)}</h3>}            {values.bothLangs && (
              <div className={styles.langHead}>
                <h3 className={styles.langTitle}>{t(`languages.${lang}`)}</h3>
                <Button
                  variant="link"
                  onClick={() => translateTo(lang)}
                  loading={ai.pending === lang}
                  disabled={!hasSource(lang) || ai.pending != null}
                  title={t("trailForm.aiTranslateHint")}
                >
                  <Sparkles size={16} />
                  {t("trailForm.aiTranslate")}
                </Button>
              </div>
            )}
            {ai.failed === lang && <p className={styles.aiError}>{t("translate.error")}</p>}
            {values.aiLangs.includes(lang) && <p className={styles.aiNote}>{t("trailForm.aiTranslatedNote")}</p>}
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