interface SyncIndicatorProps {
  unsyncedCount: number;
}

/** Tiny, unobtrusive dot - never a blocking spinner or error dialog. */
export function SyncIndicator({ unsyncedCount }: SyncIndicatorProps) {
  if (unsyncedCount <= 0) return null;
  return (
    <span
      className="sync-dot"
      role="status"
      aria-label={`${unsyncedCount} report${unsyncedCount === 1 ? '' : 's'} waiting to sync`}
      title={`${unsyncedCount} waiting to sync`}
    />
  );
}
