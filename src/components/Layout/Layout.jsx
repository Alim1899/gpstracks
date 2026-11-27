import { Link, Outlet, useLocation } from "react-router";
import { Upload, Mountain, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/Context/useAuth";
import { ErrorBoundary, LanguageSwitcher } from "@/components/UI/Index";
import { useIsAdmin } from "@/hooks/useAdmin";
import UserMenu from "@/components/Features/UserMenu/UserMenu";
import styles from "./Layout.module.css";

const Layout = () => {
  const isAdmin = useIsAdmin();
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const { pathname } = useLocation();
  const isAuthPage = ["/login", "/register"].includes(pathname);

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
                    {isAdmin === true && (
                      <Link
                        to="/admin"
                        className={styles.iconButton}
                        aria-label={t("nav.admin")}
                        title={t("nav.admin")}
                      >
                        <ShieldCheck size={18} />
                      </Link>
                    )}

                    <UserMenu />
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