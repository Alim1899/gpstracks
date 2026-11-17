const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value) {
  if (!value.trim()) return "შეიყვანე ელ-ფოსტა";
  if (!EMAIL_RE.test(value.trim())) return "ელ-ფოსტის ფორმატი არასწორია";
}

export function validatePassword(value) {
  if (!value) return "შეიყვანე პაროლი";
  if (value.length < 6) return "მინიმუმ 6 სიმბოლო";
  if (!/\p{L}/u.test(value)) return "უნდა შეიცავდეს მინიმუმ ერთ ასოს";
  if (!/\d/.test(value)) return "უნდა შეიცავდეს მინიმუმ ერთ ციფრს";
}

// აერთიანებს ველების წესებს ერთ validate ფუნქციად
export function createValidator(rules) {
  return (values) => {
    const errors = {};
    for (const [field, rule] of Object.entries(rules)) {
      const message = rule(values[field], values);
      if (message) errors[field] = message;
    }
    return errors;
  };
}export function validateName(value) {
  if (!value.trim()) return "შეიყვანე სახელი";
  if (value.trim().length < 2) return "მინიმუმ 2 სიმბოლო";
}

export function validateConfirmPassword(value, values) {
  if (!value) return "გაიმეორე პაროლი";
  if (value !== values.password) return "პაროლები არ ემთხვევა";
}