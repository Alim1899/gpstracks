import { useAuth } from "@/Context/useAuth";
import { LoginPage } from "../Features/Auth/Pages/LoginPage";
const Layout = () => {
  const { user, loading, logout } = useAuth();
  if (loading) return null;
  if (!user) return <LoginPage />;
  return (
    <div>
      <p>გამარჯობა, {user.displayName ?? user.email}</p>
      <button onClick={logout}>გასვლა</button>
    </div>
  );

};

export default Layout;
