import { useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "@/components/UI/Modal/Modal";
import { updateUserProfile } from "@/components/Services/userService";
import styles from "./UserMenu.module.css";

export default function EditProfileModal({ onClose, uid, profile, onSaved }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(() => ({
    firstName: profile?.firstName ?? "",
    lastName: profile?.lastName ?? "",
  }));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    const data = { firstName: form.firstName.trim(), lastName: form.lastName.trim() };

    if (!data.firstName) return setError(t("editProfile.errors.firstNameRequired"));
    if (data.firstName.length > 50 || data.lastName.length > 50) {
      return setError(t("editProfile.errors.maxLength", { max: 50 }));
    }

    setSaving(true);
    try {
      await updateUserProfile(uid, data);
      onSaved(data);
      onClose();
    } catch (err) {
      console.error(err);
      setError(t("editProfile.errors.saveFailed"));
      setSaving(false);
    }
  }

  return (
    <Modal
      onClose={onClose}
      title={t("editProfile.title")}
      footer={
        <>
          <button className={styles.btnSecondary} onClick={onClose} disabled={saving}>
            {t("common.cancel")}
          </button>
          <button className={styles.btnPrimary} type="submit" form="edit-profile-form" disabled={saving}>
            {saving ? t("editProfile.saving") : t("editProfile.save")}
          </button>
        </>
      }
    >
      <form id="edit-profile-form" onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.field}>
          {t("editProfile.firstName")}
          <input name="firstName" value={form.firstName} onChange={handleChange} autoFocus />
        </label>
        <label className={styles.field}>
          {t("editProfile.lastName")}
          <input name="lastName" value={form.lastName} onChange={handleChange} />
        </label>
        {error && <p className={styles.error}>{error}</p>}
      </form>
    </Modal>
  );
}