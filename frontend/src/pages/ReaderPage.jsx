import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchBook, fetchChunk, getProgress, saveProgress } from '../api/books';
import { usePrefetch } from '../hooks/usePrefetch';
import { useAuth } from '../context/AuthContext';
import ChatPanel from '../components/chatbot/ChatPanel';
import { MessageSquare, Loader2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// Import modular subcomponents
import ReaderHeader from '../components/reader/ReaderHeader';
import ReadingSettings from '../components/reader/ReadingSettings';
import ReadingContent from '../components/reader/ReadingContent';
import ReaderNavigation from '../components/reader/ReaderNavigation';

export default function ReaderPage() {
  const { id } = useParams();
  const bookId = parseInt(id);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [book, setBook] = useState(null);
  const [chunkIndex, setChunkIndex] = useState(0);
  const [chunk, setChunk] = useState(null);
  const [easyRead, setEasyRead] = useState(() => {
    const saved = localStorage.getItem('gist-reader-easyRead');
    return saved !== null ? saved === 'true' : true;
  });
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('gist-reader-fontSize');
    return saved ? parseInt(saved, 10) : 18;
  });
  const [loading, setLoading] = useState(true);
  const [savingProgress, setSavingProgress] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  
  // Customization state
  const { theme, setTheme } = useTheme();
  const [fontFamily, setFontFamily] = useState(() => {
    return localStorage.getItem('gist-reader-fontFamily') || 'serif';
  });
  const [showSettings, setShowSettings] = useState(false);

  // Persist customization preferences to localStorage
  useEffect(() => {
    localStorage.setItem('gist-reader-easyRead', easyRead);
  }, [easyRead]);

  useEffect(() => {
    localStorage.setItem('gist-reader-fontSize', fontSize);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('gist-reader-fontFamily', fontFamily);
  }, [fontFamily]);

  const fonts = {
    serif: 'Merriweather, Georgia, serif',
    sans: 'Inter, system-ui, sans-serif',
    mono: 'monospace'
  };
  
  const currentTheme = { bg: 'var(--bg-primary)', text: 'var(--text-primary)' };
  const currentFont = fonts[fontFamily];

  // Background prefetching hook
  usePrefetch(bookId, chunkIndex, book?.totalChunks || 0, easyRead);

  // Load Book Details & User Progress
  useEffect(() => {
    const loadBookAndProgress = async () => {
      setLoading(true);
      try {
        const bookRes = await fetchBook(bookId);
        setBook(bookRes.data);

        if (isAuthenticated) {
          try {
            const progRes = await getProgress(bookId);
            setChunkIndex(progRes.data.lastChunk);
            setEasyRead(progRes.data.easyReadOn);
          } catch (err) {
            console.warn('Could not load user progress, starting from chunk 0');
          }
        }
      } catch (err) {
        console.error('Error loading book:', err);
        navigate('/');
      }
    };
    loadBookAndProgress();
  }, [bookId, isAuthenticated]);

  // Load Chunk Text when index or simplification mode changes
  useEffect(() => {
    const loadChunk = async () => {
      if (!book) return;
      setLoading(true);
      try {
        const res = await fetchChunk(bookId, chunkIndex, easyRead);
        setChunk(res.data);

        // Auto-save progress if authenticated
        if (isAuthenticated) {
          saveUserProgress(chunkIndex, easyRead);
        }
      } catch (err) {
        console.error('Error fetching chunk:', err);
      } finally {
        setLoading(false);
      }
    };
    loadChunk();
  }, [bookId, chunkIndex, easyRead, book]);

  const saveUserProgress = async (idx, ez) => {
    setSavingProgress(true);
    try {
      await saveProgress(bookId, idx, ez);
    } catch (err) {
      console.warn('Failed to save progress:', err);
    } finally {
      setSavingProgress(false);
    }
  };

  const handleNext = () => {
    if (book && chunkIndex < book.totalChunks - 1) {
      setChunkIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (chunkIndex > 0) {
      setChunkIndex(prev => prev - 1);
    }
  };

  const increaseFontSize = () => setFontSize(f => Math.min(f + 2, 32));
  const decreaseFontSize = () => setFontSize(f => Math.max(f - 2, 14));

  if (!book || !chunk) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Loader2 size={36} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
      </div>
    );
  }

  return (
    <div className="page" style={{ 
      paddingTop: 0, 
      minHeight: '100vh',
      backgroundColor: currentTheme.bg,
      color: currentTheme.text,
      transition: 'background-color 0.3s, color 0.3s'
    }}>
      {/* Header Sticky Component */}
      <ReaderHeader
        title={book.title}
        chunkIndex={chunkIndex}
        totalChunks={book.totalChunks}
        savingProgress={savingProgress}
        isAuthenticated={isAuthenticated}
        onBack={() => navigate('/')}
      />

      {/* Reading Content Pane */}
      <ReadingContent
        loading={loading}
        content={chunk.content}
        currentFont={currentFont}
        fontSize={fontSize}
        currentTheme={currentTheme}
      />

      {/* Bottom Navigation Controls */}
      <ReaderNavigation
        chunkIndex={chunkIndex}
        totalChunks={book.totalChunks}
        loading={loading}
        onPrev={handlePrev}
        onNext={handleNext}
      />

      {/* Floating Settings Popover & Activation Button */}
      <ReadingSettings
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        easyRead={easyRead}
        setEasyRead={setEasyRead}
        theme={theme}
        setTheme={setTheme}
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
        fontSize={fontSize}
        increaseFontSize={increaseFontSize}
        decreaseFontSize={decreaseFontSize}
      />

      {/* Floating Chatbot Activation Trigger */}
      {isAuthenticated && (
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="btn btn-primary"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '3.5rem',
            height: '3.5rem',
            borderRadius: 'var(--radius-full)',
            boxShadow: 'var(--shadow-xl)',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100
          }}
        >
          <MessageSquare size={24} />
        </button>
      )}

      {/* Draggable context-aware chatbot */}
      <ChatPanel
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        bookId={bookId}
        currentChunk={chunkIndex}
        bookTitle={book.title}
      />
    </div>
  );
}
