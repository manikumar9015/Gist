import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ReaderNavigation({
  chunkIndex,
  totalChunks,
  loading,
  onPrev,
  onNext
}) {
  return (
    <div className="container" style={{ maxWidth: 'var(--reading-max-width)' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid var(--border-color)',
        paddingTop: 'var(--space-lg)',
        marginTop: 'var(--space-xl)',
        paddingBottom: 'var(--space-3xl)'
      }}>
        <button
          onClick={onPrev}
          disabled={chunkIndex === 0 || loading}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          {(((chunkIndex + 1) / totalChunks) * 100).toFixed(0)}% Read
        </span>

        <button
          onClick={onNext}
          disabled={chunkIndex === totalChunks - 1 || loading}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
