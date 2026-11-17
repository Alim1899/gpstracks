const MESSAGES = {
  "auth/invalid-credential": "ელ-ფოსტა ან პაროლი არასწორია",
  "auth/invalid-email": "ელ-ფოსტის ფორმატი არასწორია",
  "auth/user-disabled": "ეს ანგარიში დაბლოკილია",
  "auth/too-many-requests": "ძალიან ბევრი მცდელობა. სცადე რამდენიმე წუთში",
  "auth/network-request-failed": "ინტერნეტთან კავშირი ვერ დამყარდა",
  "auth/popup-blocked": "ბრაუზერმა ფანჯარა დაბლოკა. დაუშვი pop-up და სცადე თავიდან",
  "auth/email-already-in-use": "ამ ელ-ფოსტით ანგარიში უკვე არსებობს",
"auth/weak-password": "პაროლი ძალიან სუსტია",
};

// მომხმარებლის ქმედებაა და არა შეცდომა
const IGNORED = ["auth/popup-closed-by-user", "auth/cancelled-popup-request"];

export function getAuthErrorMessage(code) {
  if (IGNORED.includes(code)) return null;
  return MESSAGES[code] ?? "დაფიქსირდა შეცდომა. სცადე თავიდან";
}