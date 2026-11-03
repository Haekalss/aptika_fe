export const BEFORE_NAVIGATION_EVENT = "aptika:before-navigation";
export interface BeforeNavigationDetail { proceed: () => void }

/** A dirty form can defer the entire action, including logout or account changes. */
export function runGuardedNavigation(action: () => void): void {
  let proceeded = false;
  const proceed = () => {
    if (proceeded) return;
    proceeded = true;
    action();
  };
  if (typeof window === "undefined") {
    proceed();
    return;
  }
  const event = new CustomEvent<BeforeNavigationDetail>(BEFORE_NAVIGATION_EVENT, {
    cancelable: true,
    detail: { proceed },
  });
  if (window.dispatchEvent(event)) proceed();
}
