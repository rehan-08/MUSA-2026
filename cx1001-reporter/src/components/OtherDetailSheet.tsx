import { useState } from 'react';

interface OtherDetailSheetProps {
  onSubmit: (note: string) => void;
  onSkip: () => void;
}

const MAX_LENGTH = 500;

/**
 * Shown after picking "Other" - an optional free-text detail. Like category,
 * this only enriches a report that was already submitted the moment the
 * main button was tapped; skipping (including tapping the backdrop) leaves
 * the report exactly as-is, just without a note.
 */
export function OtherDetailSheet({ onSubmit, onSkip }: OtherDetailSheetProps) {
  const [text, setText] = useState('');
  const trimmed = text.trim();

  const handleSubmit = () => {
    if (trimmed.length > 0) onSubmit(trimmed);
    else onSkip();
  };

  return (
    <div className="sheet-backdrop" onClick={onSkip}>
      <div className="sheet" role="dialog" aria-label="Add a detail" onClick={(e) => e.stopPropagation()}>
        <h2>Add a detail?</h2>
        <p>Optional - your report is already sent either way.</p>
        <p className="privacy-warning">
          Don&apos;t include your name, phone number, or anyone else&apos;s identifying details - just describe what
          happened.
        </p>
        <textarea
          className="detail-textarea"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_LENGTH))}
          placeholder="What happened..."
          rows={4}
          maxLength={MAX_LENGTH}
          autoFocus
        />
        <div className="char-count">
          {text.length}/{MAX_LENGTH}
        </div>
        <button className="category-button submit-detail-button" onClick={handleSubmit}>
          {trimmed.length > 0 ? 'Submit' : 'Done'}
        </button>
        <button className="skip-button" onClick={onSkip}>
          Skip
        </button>
      </div>
    </div>
  );
}
