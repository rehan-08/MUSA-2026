import { useRef, useState } from 'react';

interface ReportButtonProps {
  disabled: boolean;
  onTap: () => void;
}

/**
 * The whole app, basically. Tapping fires onTap() immediately (which queues
 * the report - synchronously from the user's point of view) and shows a
 * confirmation pulse + toast right away, without waiting on anything async,
 * so it feels instant even with zero connectivity.
 */
export function ReportButton({ disabled, onTap }: ReportButtonProps) {
  const [pulsing, setPulsing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const pulseTimeout = useRef<number | undefined>(undefined);
  const toastTimeout = useRef<number | undefined>(undefined);

  const handleTap = () => {
    if (disabled) return;
    onTap();

    setPulsing(false);
    // force animation restart even on rapid repeat taps
    requestAnimationFrame(() => setPulsing(true));
    window.clearTimeout(pulseTimeout.current);
    pulseTimeout.current = window.setTimeout(() => setPulsing(false), 650);

    setShowToast(false);
    requestAnimationFrame(() => setShowToast(true));
    window.clearTimeout(toastTimeout.current);
    toastTimeout.current = window.setTimeout(() => setShowToast(false), 1400);
  };

  return (
    <>
      <button
        className={`report-button${pulsing ? ' confirmed' : ''}`}
        onClick={handleTap}
        disabled={disabled}
        aria-label="Report something here"
      >
        Report something here
      </button>
      {showToast && (
        <div className="confirmation-toast" aria-live="polite">
          Got it — queued to send.
        </div>
      )}
    </>
  );
}
