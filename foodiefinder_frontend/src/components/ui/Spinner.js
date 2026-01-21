import React from "react";

/**
 * PUBLIC_INTERFACE
 * Simple inline spinner.
 */
export default function Spinner({ label = "Loading" }) {
  return (
    <div className="spinner" role="status" aria-live="polite" aria-label={label}>
      <div className="spinner-dot" />
      <div className="spinner-dot" />
      <div className="spinner-dot" />
    </div>
  );
}
