import { useState } from "react";
import { useTranslation } from "react-i18next";

export function useForm(initialValues, validate) {
  const { t } = useTranslation();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({}); // ინახება გასაღებები, არა ტექსტი
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // რამდენიმე ველის ერთდროულად შეცვლა: setFields({ activity: "hiking", difficulty: "" })
  function setFields(partial) {
    const next = { ...values, ...partial };
    setValues(next);
    if (Object.keys(partial).some((name) => touched[name])) setErrors(validate(next));
  }

  const setFieldValue = (name, value) => setFields({ [name]: value });

  function touch(name) {
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors(validate(values));
  }

  function handleChange(e) {
    setFieldValue(e.target.name, e.target.value);
  }

  const handleBlur = (e) => touch(e.target.name);

const handleSubmit = (onSubmit, onInvalid) => async (e) => {
    e.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    setTouched(Object.fromEntries(Object.keys(values).map((k) => [k, true])));
    if (Object.keys(validationErrors).length > 0) {
      onInvalid?.(validationErrors, e);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  const errorFor = (name) => (touched[name] && errors[name] ? t(errors[name]) : undefined);

  // ტექსტური ველებისთვის (Input, Textarea): {...getFieldProps("title")}
  const getFieldProps = (name) => ({
    name,
    value: values[name],
    onChange: handleChange,
    onBlur: handleBlur,
    error: errorFor(name),
  });

  // არჩევანის ველებისთვის (ChipGroup, MunicipalitySelect...): onChange იღებს მნიშვნელობას და არა event-ს
  const getChoiceProps = (name) => ({
    name,
    value: values[name],
    onChange: (value) => {
      setTouched((prev) => ({ ...prev, [name]: true }));
      const next = { ...values, [name]: value };
      setValues(next);
      setErrors(validate(next));
    },
    onBlur: () => touch(name),
    error: errorFor(name),
  });

  return { values, errors, setFields, setFieldValue, getFieldProps, getChoiceProps, handleSubmit, isSubmitting };
}