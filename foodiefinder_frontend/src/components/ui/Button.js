import React from "react";

/**
 * PUBLIC_INTERFACE
 * Reusable button component with variants.
 */
export default function Button({
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  onClick,
  children,
  ariaLabel
}) {
  const className = `btn btn-${variant} btn-${size}`;
  return (
    <button
      type={type}
      className={className}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
