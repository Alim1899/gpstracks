import { useEffect, useMemo, useReducer } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import * as authService from "@/components/Services/authService";
import { AuthContext } from "./AuthContext";
import { authReducer, initialState } from "./authReducer";

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) =>
      dispatch({ type: "SET_USER", payload: user })
    );
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      loginWithGoogle: authService.loginWithGoogle,
      loginWithEmail: authService.loginWithEmail,
      resetPassword: authService.resetPassword,
      logout: authService.logout,
    }),
    [state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}