import { useCallback, useEffect, useState } from "react";

export function useDeviceHeading() {
  const [heading, setHeading] = useState(null);
  const [enabled, setEnabled] = useState(false);

  // iOS-ზე ნებართვა მხოლოდ ღილაკზე დაჭერისას შეიძლება მოითხოვო
  const enable = useCallback(async () => {
    const DOE = window.DeviceOrientationEvent;
    if (!DOE) return false;
    if (typeof DOE.requestPermission === "function") {
      if ((await DOE.requestPermission()) !== "granted") return false;
    }
    setEnabled(true);
    return true;
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const handle = (e) => {
      let h = null;
      if (e.webkitCompassHeading != null) h = e.webkitCompassHeading; // iOS
      else if (e.absolute && e.alpha != null) h = (360 - e.alpha) % 360; // Android
      if (h == null) return;

      // სენსორი წამში ~60-ჯერ აგზავნის, ამიტომ მხოლოდ 3°-ზე მეტ ცვლილებაზე ვარენდერებთ
      setHeading((prev) => {
        if (prev == null) return Math.round(h);
        const diff = Math.abs(((h - prev + 540) % 360) - 180);
        return diff < 3 ? prev : Math.round(h);
      });
    };

    const type =
      "ondeviceorientationabsolute" in window ? "deviceorientationabsolute" : "deviceorientation";
    window.addEventListener(type, handle);
    return () => window.removeEventListener(type, handle);
  }, [enabled]);

  return { heading, enable };
}