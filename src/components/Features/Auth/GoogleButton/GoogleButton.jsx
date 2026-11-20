import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/Context/useAuth";
import { getAuthErrorKey } from "@/components/Utils/firebaseErrors";
import { isInAppBrowser } from "@/components/Utils/browser";
import { Alert, Button } from "@/components/UI/Index";

// onError იღებს თარგმანის გასაღებს (ან null-ს)
export function GoogleButton({ onError }) {
  const { t } = useTranslation();
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  if (isInAppBrowser()) {
    return <Alert variant="info">{t("auth.googleInApp")}</Alert>;
  }

  async function handleClick() {
    onError?.(null);
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      onError?.(getAuthErrorKey(err.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" fullWidth loading={loading} onClick={handleClick}>
      {t("auth.google")}
    </Button>
  );
}