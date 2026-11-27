import { useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "@/components/UI/Modal/Modal";
import { deleteAccount } from "@/components/Services/userService";
import styles from "./UserMenu.module.css";

const ERROR_KEYS = {
  "auth/popup-closed-by-user": "deleteAccount.errors.cancelled",
  "auth/cancelled-popup-request": "deleteAccount.errors.cancelled",
  "auth/user-mismatch": "deleteAccount.errors.userMismatch",
};

export default function DeleteAccountModal({ onClose, onDeleted }) {
  const { t } = useTranslation();
  const [choice, setChoice] = useState(null); // "delete" | "keep"
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const safeClose = () => !loading && onClose();

  async function handleDelete() {
    setLoading(true);
    setError("");
    try {
      await deleteAccount({ keepTrails: choice === "keep" });
      onClose();
      onDeleted();
    } catch (e) {
      console.error(e);
      setError(t(ERROR_KEYS[e.code] ?? "deleteAccount.errors.failed"));
      setLoading(false);
    }
  }

  return (
    <Modal
      onClose={safeClose}
      title={t("deleteAccount.title")}
      footer={
        <>
          <button className={styles.btnSecondary} onClick={safeClose} disabled={loading}>
            {t("common.cancel")}
          </button>
          <button
            className={styles.btnDanger}
            onClick={handleDelete}
            disabled={!choice || !confirmed || loading}
          >
            {loading ? t("deleteAccount.deleting") : t("deleteAccount.delete")}
          </button>
        </>
      }
    >
      <p className={styles.warning}>{t("deleteAccount.irreversible")}</p>

      <p className={styles.groupLabel}>{t("deleteAccount.trailsQuestion")}</p>

      <label className={styles.radio}>
        <input type="radio" name="trails" checked={choice === "delete"} onChange={() => setChoice("delete")} />
        {t("deleteAccount.deleteAll")}
      </label>

      <label className={styles.radio}>
        <input type="radio" name="trails" checked={choice === "keep"} onChange={() => setChoice("keep")} />
        {t("deleteAccount.keepPublished")}
      </label>

      <p className={styles.hint}>{t("deleteAccount.pendingNote")}</p>

      <label className={styles.checkbox}>
        <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
        {t("deleteAccount.confirm")}
      </label>

      {error && <p className={styles.error}>{error}</p>}
    </Modal>
  );
}