import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, Compass, FileText } from 'lucide-react';
import { fetchBooks } from '../api/books';
import BookCard from '../components/BookCard';

export default function Explore() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';

  const loadBooks = async (searchQuery) => {
    try {
      setLoading(true);
      const res = await fetchBooks(searchQuery);
      setBooks(res.data.content || []);
      setError('');
    } catch (err) {
      console.error('Error loading explore books:', err);
      setError('Failed to load books. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadBooks(query);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center">
            <Compass size={24} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-outfit font-bold">Explore Books</h1>
            <p className="text-surface-500">Discover new books uploaded by the community.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 rounded-xl bg-danger/10 text-danger text-center">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary-500 mb-4" size={48} />
          <p className="text-surface-500">Searching library...</p>
        </div>
      ) : books.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 px-4 glass rounded-3xl border border-dashed border-surface-300 dark:border-surface-700">
          <div className="w-20 h-20 bg-surface-100 dark:bg-surface-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="text-surface-400" size={32} />
          </div>
          <h3 className="text-2xl font-bold font-outfit mb-3">No books found</h3>
          <p className="text-surface-500 max-w-md mx-auto">
            {query 
              ? `We couldn't find any books matching "${query}".` 
              : "There are no public books available yet."}
          </p>
        </div>
      )}
    </div>
  );
}
