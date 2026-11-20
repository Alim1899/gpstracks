import { useState } from "react";
import { useTranslation } from "react-i18next";

export function useForm(initialValues, validate) {
  const { t } = useTranslation();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({}); // ინახება გასაღებები, არა ტექსტი
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    const next = { ...values, [name]: value };
    setValues(next);
    if (touched[name]) setErrors(validate(next));
  }

  function handleBlur(e) {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
    setErrors(validate(values));
  }

  const handleSubmit = (onSubmit) => async (e) => {
    e.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    setTouched(Object.fromEntries(Object.keys(values).map((k) => [k, true])));
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ველს ერთი ხაზით აძლევს ყველაფერს, რაც სჭირდება. შეცდომა აქ ითარგმნება
  const getFieldProps = (name) => ({
    name,
    value: values[name],
    onChange: handleChange,
    onBlur: handleBlur,
    error: touched[name] && errors[name] ? t(errors[name]) : undefined,
  });

  return { values, getFieldProps, handleSubmit, isSubmitting };
}