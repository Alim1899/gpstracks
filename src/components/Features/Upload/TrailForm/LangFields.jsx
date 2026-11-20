import { useTranslation } from "react-i18next";
import { LANGUAGES } from "@/i18n";
import { Checkbox, Input, SegmentedControl, Textarea } from "@/components/UI/Index";
import { DESCRIPTION_MAX, TITLE_MAX, getActiveLangs } from "./trailFormSchema";
import styles from "./TrailForm.module.css";

// შევსების ენა + სახელი და აღწერა არჩეულ ენებზე
export function LangFields({ values, setFields, getFieldProps }) {
  const { t } = useTranslation();
  const activeLangs = getActiveLangs(values);

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
            {values.bothLangs && <h3 className={styles.langTitle}>{t(`languages.${lang}`)}</h3>}

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