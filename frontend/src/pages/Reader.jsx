import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Share2, Bookmark, Settings } from 'lucide-react';
import { fetchBook } from '../api/books';
import PDFViewer from '../components/PDFViewer';
import ChatWidget from '../components/ChatWidget';

export default function Reader() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBookInfo = async () => {
      try {
        const res = await fetchBook(id);
        setBook(res.data);
      } catch (err) {
        console.error('Failed to load book metadata:', err);
        // If 404 or error, go back to library
        navigate('/library');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadBookInfo();
    }
  }, [id, navigate]);

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!book) return null;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-surface-50 dark:bg-surface-900">
      {/* Reader Toolbar */}
      <div className="h-16 glass border-b border-surface-200 dark:border-surface-800 flex items-center justify-between px-4 shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <Link 
            to="/library" 
            className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <ChevronLeft size={24} />
          </Link>
          <div>
            <h1 className="font-outfit font-bold text-lg leading-tight line-clamp-1">{book.title}</h1>
            <p className="text-xs text-surface-500 line-clamp-1">{book.author || 'Unknown Author'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors hidden sm:block">
            <Share2 size={20} />
          </button>
          <button className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <Bookmark size={20} />
          </button>
          <button className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Reader Area */}
      <div className="flex-1 relative flex">
        <PDFViewer 
          bookId={book.id} 
          onPositionChange={setCurrentPosition}
        />
        
        <ChatWidget 
          bookId={book.id}
          currentPosition={currentPosition}
        />
      </div>
      
      {/* Reading Progress Bar */}
      <div className="h-1 bg-surface-200 dark:bg-surface-800 shrink-0 w-full">
        <div 
          className="h-full bg-primary-500 transition-all duration-300" 
          style={{ width: '45%' }} // Mock progress for now
        />
      </div>
    </div>
  );
}
