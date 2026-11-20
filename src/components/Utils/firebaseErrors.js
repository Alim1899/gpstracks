// Firebase-ის შეცდომის კოდი → თარგმანის გასაღები
const MESSAGES = {
  "auth/invalid-credential": "authErrors.invalidCredential",
  "auth/invalid-email": "authErrors.invalidEmail",
  "auth/user-disabled": "authErrors.userDisabled",
  "auth/too-many-requests": "authErrors.tooManyRequests",
  "auth/network-request-failed": "authErrors.network",
  "auth/popup-blocked": "authErrors.popupBlocked",
  "auth/email-already-in-use": "authErrors.emailInUse",
  "auth/weak-password": "authErrors.weakPassword",
};

// მომხმარებლის ქმედებაა და არა შეცდომა
const IGNORED = ["auth/popup-closed-by-user", "auth/cancelled-popup-request"];

export function getAuthErrorKey(code) {
  if (IGNORED.includes(code)) return null;
  return MESSAGES[code] ?? "authErrors.unknown";
}

// მომხმარებლის ქმედებაა და არა შეცდომა

