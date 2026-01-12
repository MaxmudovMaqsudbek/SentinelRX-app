import React from "react";

/**
 * Intentional crash screen for testing error boundary functionality.
 * This component deliberately accesses a property on undefined to trigger an error.
 */
export default function CrashScreen() {
  const someUndefinedVariable = undefined as unknown as { property: string };
  const undefinedVariable = someUndefinedVariable.property;
  return <>{undefinedVariable}</>;
}
