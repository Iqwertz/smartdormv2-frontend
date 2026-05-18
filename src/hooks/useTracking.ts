// src/hooks/useTracking.ts
import { useEffect } from "react";

export const useTracking = () => {
  useEffect(() => {
    const shouldDisableTracking = () => {
      const hostname = window.location.hostname;
      return (
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname.includes("local") ||
        hostname.includes("dev") ||
        hostname.includes("staging")
      );
    };

    if (shouldDisableTracking()) {
      //console.log("Umami tracking disabled for development");
      localStorage.setItem("umami.disabled", "true");
    } else {
      localStorage.removeItem("umami.disabled");
    }
  }, []);
};
