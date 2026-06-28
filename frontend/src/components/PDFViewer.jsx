import { useState, useEffect } from 'react';
import { fetchChunks } from '../api/books';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function PDFViewer({ bookId, onPositionChange }) {
  const [chunks, setChunks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // We'll load the first few chunks initially, then load more as user scrolls
  useEffect(() => {
    const loadInitialChunks = async () => {
      try {
        setLoading(true);
        // Load chunks roughly covering the start of the book (chunks 0-20)
        const res = await fetchChunks(bookId, 0, 20);
        setChunks(res.data.content || []);
      } catch (err) {
        console.error('Error loading book chunks:', err);
        setError('Failed to load book content.');
      } finally {
        setLoading(false);
      }
    };
    
    if (bookId) {
      loadInitialChunks();
    }
  }, [bookId]);

  // Track scrolling to report position to ChatWidget
  const handleScroll = (e) => {
    const el = e.target;
    // Calculate approximate position ratio (0 to 1)
    const scrollRatio = el.scrollTop / (el.scrollHeight - el.clientHeight);
    // Rough estimate of chunk index
    const estimatedChunkIndex = Math.floor(scrollRatio * chunks.length);
    if (chunks[estimatedChunkIndex]) {
      onPositionChange(chunks[estimatedChunkIndex].chunkIndex);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary-500 mb-4" size={48} />
        <p className="text-surface-500 animate-pulse">Loading book content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh] text-danger">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div 
      className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto px-4 sm:px-8 py-8 md:py-12 pb-32"
      onScroll={handleScroll}
    >
      <div className="prose prose-lg sm:prose-xl dark:prose-invert max-w-none font-merriweather leading-relaxed">
        {chunks.length === 0 ? (
          <p className="text-center italic text-surface-500">No content available for this book.</p>
        ) : (
          chunks.map((chunk) => (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={chunk.id} 
              className="mb-8"
              data-chunk-index={chunk.chunkIndex}
            >
              {chunk.content.split('\n\n').map((paragraph, i) => (
                <p key={i} className="mb-4 text-surface-800 dark:text-surface-200">
                  {paragraph}
                </p>
              ))}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
