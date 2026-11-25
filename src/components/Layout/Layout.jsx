import { Link, Outlet, useLocation } from "react-router";
import { Upload, LogOut, Mountain, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/Context/useAuth";
import { ErrorBoundary, LanguageSwitcher } from "@/components/UI/Index";
import styles from "./Layout.module.css";
import { useIsAdmin } from "@/hooks/useAdmin";
const Layout = () => {
  const isAdmin = useIsAdmin();
  const { t } = useTranslation();
  const { user, loading, logout } = useAuth();
  const { pathname } = useLocation();
  const isAuthPage = ["/login", "/register"].includes(pathname);
  const initial = (user?.displayName ?? user?.email ?? "?")[0].toUpperCase();

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <Link to="/" className={styles.logo} aria-label={t("nav.home")}>
          <Mountain size={24} strokeWidth={2.2} />
          <span>GPS Tracks</span>
        </Link>

        <nav className={styles.nav}>
          <LanguageSwitcher />

          {!isAuthPage && (
            <>
              <Link to="/upload" className={styles.uploadLink}>
                <Upload size={18} />
                <span className={styles.uploadText}>{t("nav.upload")}</span>
              </Link>

              {!loading &&
                (user ? (
                  <div className={styles.user}>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className={styles.iconButton}
                        aria-label={t("nav.admin")}
                        title={t("nav.admin")}
                      >
                        <ShieldCheck size={18} />
                      </Link>
                    )}
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName ?? ""}
                        className={styles.avatar}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className={styles.avatar}>{initial}</span>
                    )}
                    <button
                      className={styles.iconButton}
                      onClick={logout}
                      aria-label={t("nav.logout")}
                      title={t("nav.logout")}
                    >
                      <LogOut size={18} />
                    </button>
                  </div>
                ) : (
                  <Link to="/login" className={styles.loginLink}>
                    {t("nav.login")}
                  </Link>
                ))}
            </>
          )}
        </nav>
      </header>

      <main className={styles.main}>
        <ErrorBoundary key={pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
};

export default Layout;
