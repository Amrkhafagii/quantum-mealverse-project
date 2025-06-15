
import { useCallback, useEffect, useState } from "react";

// Possible states from the Permissions API
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
          // Listen for permission changes
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
