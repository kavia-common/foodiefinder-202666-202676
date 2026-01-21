import React, { useEffect } from "react";

/**
 * PUBLIC_INTERFACE
 * Toast message that auto-dismisses.
 */
export default function Toast({ message, kind = "info", onClose, durationMs = 3500 }) {
  useEffect(() => {
    if (!message) return undefined;
    const t = setTimeout(() => onClose?.(), durationMs);
    return () => clearTimeout(t);
  }, [message, durationMs, onClose]);

  if (!message) return null;

  return (
    <div className={`toast toast-${kind}`} role="status" aria-live="polite">
      <div className="toast-text">{message}</div>
      <button className="icon-btn" onClick={onClose} aria-label="Dismiss message">
        ×
      </button>
    </div>
  );
}
