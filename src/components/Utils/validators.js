const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// თითოეული ფუნქცია აბრუნებს თარგმანის გასაღებს ან undefined-ს, თუ შეცდომა არ არის

export function validateEmail(value) {
  if (!value.trim()) return "validation.emailRequired";
  if (!EMAIL_RE.test(value.trim())) return "validation.emailInvalid";
}

export function validatePassword(value) {
  if (!value) return "validation.passwordRequired";
  if (value.length < 6) return "validation.passwordMin";
  if (!/\p{L}/u.test(value)) return "validation.passwordLetter";
  if (!/\d/.test(value)) return "validation.passwordDigit";
}

export function validateName(value) {
  if (!value.trim()) return "validation.nameRequired";
  if (value.trim().length < 2) return "validation.nameMin";
}

export function validateConfirmPassword(value, values) {
  if (!value) return "validation.confirmRequired";
  if (value !== values.password) return "validation.passwordsMismatch";
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
}