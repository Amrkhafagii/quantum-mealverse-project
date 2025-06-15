
import { useCallback, useEffect, useState } from "react";

type GeoPermissionState = "granted" | "prompt" | "denied" | "unknown";

export function useGeolocationPermissionStatus() {
  const [status, setStatus] = useState<GeoPermissionState>("unknown");

  const checkPermission = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.permissions) {
      setStatus("unknown");
      return;
    }
    try {
      navigator.permissions
        .query({ name: "geolocation" as PermissionName })
        .then((permStatus) => {
          setStatus(permStatus.state as GeoPermissionState);
          permStatus.onchange = () => {
            setStatus(permStatus.state as GeoPermissionState);
          };
        })
        .catch(() => setStatus("unknown"));
    } catch {
      setStatus("unknown");
    }
  }, []);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return {
    permissionStatus: status,
    refreshPermission: checkPermission,
  };
}
