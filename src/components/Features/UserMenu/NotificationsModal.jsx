import { useTranslation } from "react-i18next";
import Modal from "@/components/UI/Modal/Modal";
import styles from "./UserMenu.module.css";

export default function NotificationsModal({ onClose }) {
  const { t } = useTranslation();

  return (
    <Modal onClose={onClose} title={t("notifications.title")}>
      <p className={styles.empty}>{t("notifications.empty")}</p>
    </Modal>
  );
}