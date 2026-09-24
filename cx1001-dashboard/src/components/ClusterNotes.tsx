import type { ClusterNote, ReportCategory } from '../types';

interface ClusterNotesProps {
  notes: ClusterNote[];
}

const LABELS: Record<ReportCategory, string> = {
  catcalling: 'Catcalling',
  loitering: 'Loitering',
  unsafe_lighting: 'Unsafe lighting',
  other: 'Other',
};

/** Free-text detail statements reporters optionally added - never shown alongside any device identity. */
export function ClusterNotes({ notes }: ClusterNotesProps) {
  if (notes.length === 0) {
    return <p className="alert-status-note">No detailed statements for this cluster.</p>;
  }

  const sorted = [...notes].sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  return (
    <div className="notes-list">
      {sorted.map((n, i) => (
        <div className="note-card" key={i}>
          <div className="note-meta">
            <span>{n.category ? LABELS[n.category] : 'Other'}</span>
            <span>{new Date(n.timestamp).toLocaleString()}</span>
          </div>
          <p className="note-text">{n.note}</p>
        </div>
      ))}
    </div>
  );
}
