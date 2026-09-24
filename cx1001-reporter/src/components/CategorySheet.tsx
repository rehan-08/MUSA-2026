import type { ReportCategory } from '../lib/db';

interface CategorySheetProps {
  onPick: (category: ReportCategory) => void;
  onSkip: () => void;
}

const CATEGORIES: { value: ReportCategory; label: string }[] = [
  { value: 'catcalling', label: 'Catcalling' },
  { value: 'loitering', label: 'Loitering' },
  { value: 'unsafe_lighting', label: 'Unsafe lighting' },
  { value: 'other', label: 'Other' },
];

/**
 * Optional enrichment for an already-queued report. Dismissible by tapping
 * the backdrop - which is equivalent to Skip, since the report was already
 * submitted the moment the main button was tapped.
 */
export function CategorySheet({ onPick, onSkip }: CategorySheetProps) {
  return (
    <div className="sheet-backdrop" onClick={onSkip}>
      <div className="sheet" role="dialog" aria-label="What kind of thing was it?" onClick={(e) => e.stopPropagation()}>
        <h2>What kind of thing?</h2>
        <p>Optional - your report is already sent either way.</p>
        <div className="category-grid">
          {CATEGORIES.map((c) => (
            <button key={c.value} className="category-button" onClick={() => onPick(c.value)}>
              {c.label}
            </button>
          ))}
        </div>
        <button className="skip-button" onClick={onSkip}>
          Skip
        </button>
      </div>
    </div>
  );
}
