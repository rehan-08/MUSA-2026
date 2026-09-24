import type { ReportCategory } from '../types';

interface CategoryBreakdownProps {
  breakdown: Partial<Record<ReportCategory, number>>;
}

const LABELS: Record<ReportCategory, string> = {
  catcalling: 'Catcalling',
  loitering: 'Loitering',
  unsafe_lighting: 'Unsafe lighting',
  other: 'Other',
};

const ORDER: ReportCategory[] = ['catcalling', 'loitering', 'unsafe_lighting', 'other'];

export function CategoryBreakdown({ breakdown }: CategoryBreakdownProps) {
  const max = Math.max(1, ...Object.values(breakdown).map((v) => v ?? 0));
  const entries = ORDER.filter((cat) => (breakdown[cat] ?? 0) > 0);

  if (entries.length === 0) {
    return <p className="alert-status-note">No categorized reports.</p>;
  }

  return (
    <div className="category-bar-list">
      {entries.map((cat) => {
        const count = breakdown[cat] ?? 0;
        return (
          <div className="category-bar-row" key={cat}>
            <span>{LABELS[cat]}</span>
            <span className="category-bar-track">
              <span className="category-bar-fill" style={{ width: `${(count / max) * 100}%` }} />
            </span>
            <span>{count}</span>
          </div>
        );
      })}
    </div>
  );
}
