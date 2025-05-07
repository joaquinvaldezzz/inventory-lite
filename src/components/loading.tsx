import { IonSpinner } from "@ionic/react";

/**
 * A functional React component that renders a loading spinner centered within a container. The
 * container has a fixed height and uses flexbox utilities for centering the spinner both vertically
 * and horizontally.
 *
 * @returns A JSX element containing a centered loading spinner.
 */
export function Loading() {
  return (
    <div className="flex h-96 items-center justify-center">
      <IonSpinner />
    </div>
  );
}
