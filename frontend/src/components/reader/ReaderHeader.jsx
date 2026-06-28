import { ArrowLeft, Bookmark } from 'lucide-react';

export default function ReaderHeader({
  title,
  chunkIndex,
  totalChunks,
  savingProgress,
  isAuthenticated,
  onBack
}) {
  return (
    <div className="glass" style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      borderBottom: '1px solid var(--border-color)',
      padding: '0.75rem 0',
      marginBottom: 'var(--space-xl)',
      backgroundColor: 'inherit'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 'var(--space-md)'
      }}>
        {/* Back and Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <button onClick={onBack} className="btn btn-ghost btn-icon">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.125rem',
              fontWeight: 700,
              maxWidth: '280px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {title}
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Page {chunkIndex + 1} of {totalChunks}
            </span>
          </div>
        </div>

        {/* Bookmark indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          {isAuthenticated && (
            <span
              title={savingProgress ? 'Saving progress...' : 'Progress saved'}
              style={{
                display: 'flex',
                alignItems: 'center',
                color: savingProgress ? 'var(--text-muted)' : 'var(--accent-primary)',
                transition: 'color var(--transition-fast)'
              }}
            >
              <Bookmark size={18} fill={savingProgress ? 'none' : 'currentColor'} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
