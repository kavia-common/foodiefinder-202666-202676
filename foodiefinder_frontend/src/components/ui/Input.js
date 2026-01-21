import React from "react";

/**
 * PUBLIC_INTERFACE
 * Reusable labeled input with optional helper/error text.
 */
export default function Input({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  error,
  helper,
  required = false
}) {
  return (
    <div className="field">
      {label ? (
        <label className="field-label" htmlFor={id}>
          {label} {required ? <span className="field-required">*</span> : null}
        </label>
      ) : null}
      <input
        id={id}
        className={`input ${error ? "input-error" : ""}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={helper || error ? `${id}-help` : undefined}
      />
      {error || helper ? (
        <div id={`${id}-help`} className={`field-help ${error ? "field-help-error" : ""}`}>
          {error || helper}
        </div>
      ) : null}
    </div>
  );
}
