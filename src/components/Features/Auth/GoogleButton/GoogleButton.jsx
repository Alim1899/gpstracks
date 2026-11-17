import { useState } from "react";
import { useAuth } from "@/Context/useAuth";
import { getAuthErrorMessage } from "@/components/Utils/firebaseErrors";
import { isInAppBrowser } from "@/components/Utils/browser";
import { Alert, Button } from "@/components/UI/Index";

export function GoogleButton({ onError }) {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  if (isInAppBrowser()) {
    return (
      <Alert variant="info">
        Google-ით შესასვლელად გახსენი გვერდი Chrome-ში ან Safari-ში.
      </Alert>
    );
  }

  async function handleClick() {
    onError?.(null);
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      onError?.(getAuthErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" fullWidth loading={loading} onClick={handleClick}>
      Google-ით შესვლა
    </Button>
  );
}