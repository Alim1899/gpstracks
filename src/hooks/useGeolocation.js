import { useCallback, useEffect, useState } from "react";

export function useGeolocation() {
  const [position, setPosition] = useState(null); // { lat, lng, accuracy }
  const [error, setError] = useState(null);
  const [watching, setWatching] = useState(false);

  const start = useCallback(() => {
    if (!navigator.geolocation) {
      setError("map.geoUnsupported");
      return;
    }
    setError(null);
    setWatching(true);
  }, []);

  useEffect(() => {
    if (!watching) return;
    const id = navigator.geolocation.watchPosition(
      ({ coords }) =>
        setPosition({
          lat: coords.latitude,
          lng: coords.longitude,
          accuracy: coords.accuracy,
        }),
      () => setError("map.geoDenied"),
      { enableHighAccuracy: true, maximumAge: 5000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [watching]);

  return { position, error, start, watching };
}
