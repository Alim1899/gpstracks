import { Link, Outlet, useLocation } from "react-router";
import { Upload, LogOut, Mountain } from "lucide-react";
import { useAuth } from "@/Context/useAuth";
import styles from "./Layout.module.css";

const Layout = () => {
  const { user, loading, logout } = useAuth();
  const { pathname } = useLocation();
  const isAuthPage = ["/login", "/register"].includes(pathname);
  const initial = (user?.displayName ?? user?.email ?? "?")[0].toUpperCase();

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <Link to="/" className={styles.logo} aria-label="მთავარი გვერდი">
          <Mountain size={24} strokeWidth={2.2} />
          <span>GPS Tracks</span>
        </Link>

        {!isAuthPage && (
          <nav className={styles.nav}>
            <Link to="/upload" className={styles.uploadLink}>
              <Upload size={18} />
              <span className={styles.uploadText}>ატვირთე ტრეკი</span>
            </Link>

            {!loading &&
              (user ? (
                <div className={styles.user}>
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
                    aria-label="გასვლა"
                    title="გასვლა"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <Link to="/login" className={styles.loginLink}>
                  შესვლა
                </Link>
              ))}
          </nav>
        )}
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
