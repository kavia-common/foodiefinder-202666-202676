import React, { useMemo, useState } from "react";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Spinner from "../ui/Spinner";

/**
 * PUBLIC_INTERFACE
 * Login/Signup modal. Since backend endpoints are not yet available in OpenAPI,
 * this component validates input and shows a clear integration error until
 * `/auth/login` and `/auth/signup` exist.
 */
export default function AuthModal({ open, mode, onClose, onAuthed, apiReady = false }) {
  const isLogin = mode === "login";
  const title = isLogin ? "Log in" : "Create account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const emailError = useMemo(() => {
    if (!email) return "Email is required.";
    // basic email check
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Please enter a valid email address.";
    return "";
  }, [email]);

  const passwordError = useMemo(() => {
    if (!password) return "Password is required.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    return "";
  }, [password]);

  const displayNameError = useMemo(() => {
    if (isLogin) return "";
    if (!displayName) return "Display name is required.";
    if (displayName.length < 2) return "Display name is too short.";
    return "";
  }, [displayName, isLogin]);

  const canSubmit =
    !busy &&
    !emailError &&
    !passwordError &&
    (isLogin ? true : !displayNameError) &&
    email &&
    password &&
    (isLogin ? true : displayName);

  async function submit() {
    setError("");
    if (!canSubmit) return;

    setBusy(true);
    try {
      if (!apiReady) {
        throw new Error(
          "Backend auth endpoints are not available yet. Expected /auth/login and /auth/signup."
        );
      }
      // Integration note:
      // - login: POST /auth/login { email, password } -> { access_token }
      // - signup: POST /auth/signup { email, password, display_name } -> { access_token }
      // Once backend is implemented, wire via apiRequest + setToken and call onAuthed(token).
      onAuthed?.("token-placeholder");
      onClose?.();
    } catch (e) {
      setError(e?.message || "Authentication failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      title={title}
      open={open}
      onClose={busy ? undefined : onClose}
      footer={
        <div className="row row-end">
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submit} disabled={!canSubmit} ariaLabel={title}>
            {busy ? <Spinner label="Authenticating" /> : isLogin ? "Log in" : "Sign up"}
          </Button>
        </div>
      }
    >
      <div className="stack">
        {!isLogin ? (
          <Input
            id="displayName"
            label="Display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Alex"
            error={displayNameError}
            autoComplete="nickname"
            required
          />
        ) : null}

        <Input
          id="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          error={emailError}
          autoComplete="email"
          required
        />
        <Input
          id="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          type="password"
          error={passwordError}
          autoComplete={isLogin ? "current-password" : "new-password"}
          required
        />

        {error ? <div className="callout callout-error">{error}</div> : null}

        {!apiReady ? (
          <div className="callout callout-warn">
            Backend auth API is not yet implemented (OpenAPI currently only has <code>/</code>).
            The UI is ready; once backend adds auth endpoints, wire them in <code>AuthModal</code>.
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
