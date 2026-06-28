import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadBook } from '../../api/books';
import { X, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
      setError('');
      // Auto-populate title from filename
      setTitle(file.name.replace('.pdf', ''));
    } else {
      setError('Only PDF files are supported.');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!uploadedFile) {
      setError('Please select a PDF file first.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await uploadBook(uploadedFile, title, author, genre);
      setSuccess(true);
      setTimeout(() => {
        onUploadSuccess(res.data);
        handleClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error processing the PDF. Please ensure it contains readable text.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setAuthor('');
    setGenre('');
    setError('');
    setSuccess(false);
    setUploadedFile(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-md)'
    }}>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)'
        }}
      />

      {/* Modal Content */}
      <div className="card glass animate-slide-up" style={{
        position: 'relative',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-md)',
        boxShadow: 'var(--shadow-xl)',
        zIndex: 1001
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.25rem' }}>
            Upload PDF Book
          </h3>
          <button onClick={handleClose} className="btn btn-ghost btn-icon" style={{ width: '2rem', height: '2rem' }}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'start',
            gap: 'var(--space-sm)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--error)',
            color: 'var(--error)',
            padding: 'var(--space-md)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-xl)',
            textAlign: 'center',
            gap: 'var(--space-md)'
          }}>
            <CheckCircle2 size={48} style={{ color: 'var(--success)' }} />
            <h4 style={{ fontWeight: 600 }}>Upload & Parsing Complete!</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Preparing your book library...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {/* Drag and Drop Zone */}
            <div
              {...getRootProps()}
              style={{
                border: '2px dashed ' + (isDragActive ? 'var(--accent-primary)' : 'var(--border-color)'),
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-xl)',
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: isDragActive ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                transition: 'all var(--transition-base)'
              }}
            >
              <input {...getInputProps()} />
              {uploadedFile ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-sm)' }}>
                  <FileText size={40} style={{ color: 'var(--accent-primary)' }} />
                  <span style={{ fontWeight: 500, fontSize: '0.875rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {uploadedFile.name}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-sm)' }}>
                  <Upload size={40} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontWeight: 500 }}>
                    {isDragActive ? 'Drop your PDF here' : 'Drag & drop your PDF here'}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    or click to browse (Max 50MB)
                  </span>
                </div>
              )}
            </div>

            {uploadedFile && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 'var(--space-sm)', color: 'var(--text-secondary)' }}>
                    Book Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter book title"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 'var(--space-sm)', color: 'var(--text-secondary)' }}>
                      Author (Optional)
                    </label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="e.g., Jane Austen"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 'var(--space-sm)', color: 'var(--text-secondary)' }}>
                      Genre / Category (Optional)
                    </label>
                    <input
                      type="text"
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      placeholder="e.g., Classics"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ width: '100%', marginTop: 'var(--space-sm)', height: '2.75rem' }}
                >
                  {loading ? 'Processing & Parsing PDF...' : 'Add to Library'}
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
