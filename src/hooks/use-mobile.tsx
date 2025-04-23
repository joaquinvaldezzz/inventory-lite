import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * Custom hook to determine if the current viewport width is considered mobile.
 *
 * This hook listens for changes in the viewport width and updates its state accordingly. It uses a
 * predefined `MOBILE_BREAKPOINT` constant to determine the maximum width for mobile devices.
 *
 * @returns `true` if the viewport width is less than the mobile breakpoint, otherwise `false`.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => {
      mql.removeEventListener("change", onChange);
    };
  }, []);

  return !!(isMobile ?? false);
}
