import { useState } from 'react';

interface SettingsMenuProps {
  onRegenerateIdentity: () => Promise<void>;
}

/** Low-key gear icon + popover. The only "identity" control in the app: forget my anonymous history. */
export function SettingsMenu({ onRegenerateIdentity }: SettingsMenuProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const handleRegenerate = async () => {
    setBusy(true);
    await onRegenerateIdentity();
    setBusy(false);
    setDone(true);
  };

  const close = () => {
    setOpen(false);
    setDone(false);
  };

  return (
    <>
      <button
        className="gear-button"
        aria-label="Privacy settings"
        onClick={() => setOpen(true)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>
      {open && (
        <div className="settings-backdrop" onClick={close}>
          <div className="settings-card" role="dialog" aria-label="Privacy settings" onClick={(e) => e.stopPropagation()}>
            <h2>Privacy</h2>
            <p>
              SafeSignal never asks for your name, phone number, or any identifying details. Reports are tied only to
              an anonymous device hash. You can reset that hash any time - it forgets your report history from the
              backend's point of view.
            </p>
            <div className="settings-actions">
              {done ? (
                <p style={{ color: 'var(--navy)', fontWeight: 600 }}>Done - new anonymous identity generated.</p>
              ) : (
                <button className="btn-secondary" onClick={handleRegenerate} disabled={busy}>
                  {busy ? 'Resetting…' : 'Reset my identity'}
                </button>
              )}
              <button className="btn-text" onClick={close}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
