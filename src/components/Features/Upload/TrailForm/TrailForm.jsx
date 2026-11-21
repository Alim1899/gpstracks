import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Activity, Car, Footprints, Mountain } from "lucide-react";
import { useForm } from "@/hooks/useForm";
import { Alert, Button, ChipGroup, Collapsible } from "@/components/UI/Index";
import { MunicipalitySelect } from "@/components/Features/Common/MunicipalitySelect/MunicipalitySelect";
import {
  ACTIVITIES,
  ACCESS,
  FEATURES,
  MONTHS,
  OVERNIGHT,
  ROUTE_TYPES,
  getActivity,
} from "@/components/Utils/trailOptions";
import { getHistoricalOptions } from "@/components/Utils/regions";
import {
  createInitialValues,
  toTrailInput,
  validateTrail,
} from "./trailFormSchema";
import { FormSection } from "./FormSection";
import { LangFields } from "./LangFields";
import styles from "./TrailForm.module.css";

const ACTIVITY_ICONS = { Footprints, Activity, Mountain, Car };
const SLOW_SUBMIT_MS = 15_000;
/**
 * ბილიკის ფორმა. ინახავს მხოლოდ ფორმის მდგომარეობას;
 * შენახვას აკეთებს მშობელი onSubmit-ით (იღებს toTrailInput()-ის შედეგს).
 */
export function TrailForm({
  routeType,
  municipalities,
  onSubmit,
  onActivityChange,
}) {
  const { t, i18n } = useTranslation();
  const [submitError, setSubmitError] = useState(null); // თარგმანის გასაღები
  const [slow, setSlow] = useState(false); // გაგზავნას ჩვეულებრივზე მეტი დრო სჭირდება
  const {
    values,
    setFields,
    getFieldProps,
    getChoiceProps,
    handleSubmit,
    isSubmitting,
  } = useForm(
    createInitialValues({
      lang: i18n.resolvedLanguage,
      routeType,
      municipalities,
    }),
    validateTrail,
  );

  // ჩიპების options: id-ების სია → [{ value, label }]
  const toOptions = (ids, prefix) =>
    ids.map((id) => ({ value: id, label: t(`${prefix}.${id}`) }));

  const difficulties = getActivity(values.activity)?.difficulties ?? [];
  const historicalOptions = getHistoricalOptions(values.municipalities);

  function changeActivity(activity) {
    // სირთულე აქტივობაზეა დამოკიდებული, ამიტომ ახალ აქტივობაზე ვასუფთავებთ
    setFields({ activity, difficulty: "" });
    onActivityChange?.(activity);
  }

  // პირველ შეცდომამდე ჩასქროლვა (შეცდომები შემდეგ რენდერზე ჩნდება, ამიტომ requestAnimationFrame)
  function scrollToFirstError(_errors, e) {
    const form = e.currentTarget;
    requestAnimationFrame(() => {
      form
        .querySelector('[aria-invalid="true"], [role="alert"]')
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  // 15 წამის შემდეგ გაფრთხილება: Firestore კავშირის გარეშე შეცდომას არ აგდებს, უბრალოდ ელოდება
  useEffect(() => {
    if (!isSubmitting) return;
    const timer = setTimeout(() => setSlow(true), SLOW_SUBMIT_MS);
    return () => clearTimeout(timer);
  }, [isSubmitting]);

  const submit = handleSubmit(async (formValues) => {
    setSubmitError(null);
    setSlow(false);
    try {
      await onSubmit(toTrailInput(formValues));
    } catch (err) {
      console.error(err);
      setSubmitError(
        err.code === "permission-denied"
          ? "trailForm.errors.permission"
          : "trailForm.errors.saveFailed",
      );
    }
  }, scrollToFirstError);

  return (
    <form
      className={styles.form}
      onSubmit={submit}
      noValidate
      aria-busy={isSubmitting}
    >
      <fieldset className={styles.formFields} disabled={isSubmitting}>
        <FormSection title={t("trailForm.sectionMain")}>
          <LangFields
            values={values}
            setFields={setFields}
            getFieldProps={getFieldProps}
          />

          <ChipGroup
            label={`${t("trailForm.activity")} *`}
            options={ACTIVITIES.map((a) => {
              const Icon = ACTIVITY_ICONS[a.icon];
              return {
                value: a.id,
                label: t(`activities.${a.id}`),
                icon: Icon && <Icon size={16} />,
              };
            })}
            {...getChoiceProps("activity")}
            onChange={changeActivity}
          />

          <ChipGroup
            label={`${t("trailForm.difficulty")} *`}
            options={toOptions(difficulties, "difficulty")}
            hint={
              difficulties.length
                ? undefined
                : t("trailForm.chooseActivityFirst")
            }
            {...getChoiceProps("difficulty")}
          />
        </FormSection>

        <FormSection title={t("trailForm.sectionLocation")}>
          <MunicipalitySelect
            label={`${t("trailForm.municipalities")} *`}
            hint={t(
              municipalities?.length
                ? "trailForm.municipalitiesAutoHint"
                : "trailForm.municipalitiesHint",
            )}
            {...getChoiceProps("municipalities")}
          />

          {historicalOptions.length > 0 && (
            <ChipGroup
              label={t("trailForm.historicalRegions")}
              multiple
              options={toOptions(historicalOptions, "historicalRegions")}
              {...getChoiceProps("historicalRegions")}
            />
          )}

          <ChipGroup
            label={`${t("trailForm.routeType")} *`}
            options={toOptions(ROUTE_TYPES, "routeTypes")}
            hint={t("trailForm.routeTypeHint")}
            {...getChoiceProps("routeType")}
          />
        </FormSection>

        <Collapsible
          title={t("trailForm.sectionDetails")}
          hint={t("form.optional")}
        >
          <ChipGroup
            label={t("trailForm.seasons")}
            multiple
            options={toOptions(MONTHS, "months")}
            {...getChoiceProps("seasons")}
          />
          <ChipGroup
            label={t("trailForm.features")}
            multiple
            options={toOptions(FEATURES, "features")}
            {...getChoiceProps("features")}
          />
          <ChipGroup
            label={t("trailForm.access")}
            allowDeselect
            options={toOptions(ACCESS, "access")}
            {...getChoiceProps("access")}
          />
          <ChipGroup
            label={t("trailForm.overnight")}
            multiple
            options={toOptions(OVERNIGHT, "overnight")}
            {...getChoiceProps("overnight")}
          />
        </Collapsible>
      </fieldset>
      <div className={styles.submitBar}>
        <Alert variant="error">{submitError && t(submitError)}</Alert>
        {isSubmitting && slow && (
          <Alert variant="info">{t("trailForm.slowSubmit")}</Alert>
        )}
        <Button type="submit" fullWidth loading={isSubmitting}>
          {t("trailForm.submit")}
        </Button>
        <p className={styles.note}>{t("trailForm.moderationNote")}</p>
      </div>
    </form>
  );
}
