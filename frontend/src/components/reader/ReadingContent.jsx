import ReactMarkdown from 'react-markdown';

export default function ReadingContent({
  loading,
  content,
  currentFont,
  fontSize,
  currentTheme
}) {
  return (
    <div className="container" style={{ maxWidth: 'var(--reading-max-width)' }}>
      {loading ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-md)',
          padding: 'var(--space-2xl) 0'
        }}>
          <div className="skeleton" style={{ height: '24px', width: '100%' }} />
          <div className="skeleton" style={{ height: '24px', width: '95%' }} />
          <div className="skeleton" style={{ height: '24px', width: '90%' }} />
          <div className="skeleton" style={{ height: '24px', width: '97%' }} />
          <div className="skeleton" style={{ height: '24px', width: '85%' }} />
        </div>
      ) : (
        <article className="animate-fade-in" style={{
          fontFamily: currentFont,
          fontSize: `${fontSize}px`,
          lineHeight: 'var(--reading-line-height)',
          color: currentTheme.text,
          textAlign: 'justify',
          padding: 'var(--space-md) 0 var(--space-2xl) 0',
          transition: 'font-size var(--transition-fast)'
        }}>
          <ReactMarkdown
            components={{
              p: ({node, ...props}) => <p style={{ marginBottom: '1.5em' }} {...props} />,
              em: ({node, ...props}) => <em style={{ fontStyle: 'italic', opacity: 0.9 }} {...props} />
            }}
          >
            {content}
          </ReactMarkdown>
        </article>
      )}
    </div>
  );
}
