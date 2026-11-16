import { useCallback, useEffect, useMemo, useReducer } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { AuthContext } from "./AuthContext";
import { authReducer, initialState } from "./authReducer";
import { loginWithGoogle, logout } from "../components/Services/authService";
import { auth } from "../firebaseConfig";
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) =>
      dispatch({ type: "SET_USER", payload: user }),
    );
  }, []);

  const login = useCallback(async () => {
    dispatch({ type: "LOGIN_START" });
    try {
      await loginWithGoogle();
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: err.code });
    }
  }, []);
  const value = useMemo(() => ({ ...state, login, logout }), [state, login]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
