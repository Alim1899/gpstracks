import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/Context/useAuth";
import { getOrCreateUserProfile } from "@/components/Services/userService";
import InterfacePanel from "./InterfacePanel";
import NotificationsModal from "./NotificationsModal";
import EditProfileModal from "./EditProfileModal";
import DeleteAccountModal from "./DeleteAccountModal";
import styles from "./UserMenu.module.css";

export default function UserMenu() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [modal, setModal] = useState(null); // "notifications" | "edit" | "delete" | null
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    getOrCreateUserProfile(user)
      .then((p) => !cancelled && setProfile(p))
      .catch(console.error);

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!open) return;

    const close = () => {
      setOpen(false);
      setPanelOpen(false);
    };
    const onClick = (e) => !wrapperRef.current?.contains(e.target) && close();
    const onKey = (e) => e.key === "Escape" && close();

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const closeMenu = () => {
    setOpen(false);
    setPanelOpen(false);
  };

  const openModal = (name) => {
    closeMenu();
    setModal(name);
  };

  const closeModal = useCallback(() => setModal(null), []);

  const handleLogout = async () => {
    closeMenu();
    await logout();
    navigate("/");
  };

  if (!user) return null;

  const fullName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : user.displayName ?? user.email;

  const avatar = user.photoURL ? (
    <img src={user.photoURL} alt="" className={styles.avatar} referrerPolicy="no-referrer" />
  ) : (
    <span className={styles.avatarFallback}>{(fullName?.[0] ?? "?").toUpperCase()}</span>
  );

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        className={styles.avatarBtn}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {avatar}
      </button>

      {open && (
        <div className={styles.dropdown} role="menu">
          <div className={styles.userInfo}>
            {avatar}
            <div className={styles.userText}>
              <p className={styles.name}>{fullName}</p>
              <p className={styles.email}>{user.email}</p>
              <p className={styles.likes}>❤️ {profile?.likesReceived ?? 0}</p>
            </div>
          </div>

          <hr className={styles.divider} />

          <Link to="/my-trails" className={styles.item} onClick={closeMenu}>
            {t("userMenu.myTrails")}
          </Link>

          <button className={styles.item} onClick={() => openModal("notifications")}>
            {t("userMenu.notifications")}
          </button>

          <div className={styles.panelAnchor}>
            <button
              className={`${styles.item} ${panelOpen ? styles.active : ""}`}
              onClick={() => setPanelOpen((p) => !p)}
              aria-expanded={panelOpen}
            >
              {t("userMenu.interface")}
              <span className={`${styles.chevron} ${panelOpen ? styles.chevronOpen : ""}`}>›</span>
            </button>

            {panelOpen && (
              <InterfacePanel
                uid={user.uid}
                settings={profile?.settings}
                onChange={(settings) => setProfile((p) => ({ ...p, settings }))}
              />
            )}
          </div>

          <button className={styles.item} disabled>
            {t("userMenu.myTraces")} <span className={styles.badge}>PRO</span>
          </button>

          <button className={styles.item} disabled>
            {t("userMenu.pro")} <span className={styles.badgeMuted}>{t("userMenu.soon")}</span>
          </button>

          <hr className={styles.divider} />

          <div className={styles.row}>
            <button className={styles.item} onClick={() => openModal("edit")} disabled={!profile}>
              {t("userMenu.editProfile")}
            </button>
            <button
              className={styles.dots}
              onClick={() => openModal("delete")}
              aria-label={t("userMenu.moreOptions")}
            >
              ⋮
            </button>
          </div>

          <button className={styles.item} onClick={handleLogout}>
            {t("userMenu.logout")}
          </button>
        </div>
      )}

      {modal === "notifications" && <NotificationsModal onClose={closeModal} />}

      {modal === "edit" && (
        <EditProfileModal
          onClose={closeModal}
          uid={user.uid}
          profile={profile}
          onSaved={(data) => setProfile((p) => ({ ...p, ...data }))}
        />
      )}

      {modal === "delete" && (
        <DeleteAccountModal onClose={closeModal} onDeleted={() => navigate("/")} />
      )}
    </div>
  );
}