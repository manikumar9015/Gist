import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchBooks } from '../api/books';
import { useDebounce } from '../hooks/useDebounce';
import { Search, BookOpen, User, BookOpenCheck, Loader2 } from 'lucide-react';

const GENRES = ['All', 'Classics', 'Fiction', 'Non-Fiction', 'Science', 'History', 'Mystery', 'Uploaded'];

export default function HomePage() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const debouncedSearch = useDebounce(search, 300);
  const navigate = useNavigate();

  useEffect(() => {
    loadBooks();
  }, [debouncedSearch, selectedGenre, page]);

  // Reset page when search or genre changes
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, selectedGenre]);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const genreFilter = selectedGenre === 'All' ? '' : selectedGenre;
      const res = await fetchBooks(debouncedSearch, genreFilter, page, 12);
      setBooks(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page container animate-fade-in">
      {/* Hero section */}
      <div className="text-center py-16 flex flex-col items-center gap-3">
        <h1 className="font-outfit text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-primary-600 to-purple-600 leading-tight">
          Read Complex Books with Ease
        </h1>
        <p className="text-surface-600 dark:text-surface-400 max-w-xl text-lg leading-relaxed">
          Gist simplifies complex literature and PDFs on-the-fly using AI. Search our library or upload your own books.
        </p>
      </div>

      {/* Controls Container (Search + Genre Filter) */}
      <div className="card glass p-6 mb-10 flex flex-col gap-6">
        {/* Search Bar */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="Search books by title, author, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-12"
          />
        </div>

        {/* Genre Chips */}
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`btn px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedGenre === genre
                  ? 'bg-primary-600 text-white border-primary-600 shadow-sm shadow-primary-500/20'
                  : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 border-surface-200 dark:border-surface-700 hover:bg-surface-200 dark:hover:bg-surface-700'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Books Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={36} className="animate-spin text-primary-600 dark:text-primary-400" />
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-20 text-surface-600 dark:text-surface-400 flex flex-col items-center gap-5">
          <BookOpen size={48} className="text-surface-400" />
          <h3 className="text-xl font-bold font-outfit">No books found</h3>
          <p className="text-sm">Try refining your search query or upload a new PDF.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <div
                key={book.id}
                onClick={() => navigate(`/reader/${book.id}`)}
                className="card flex flex-col gap-5 h-full relative cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                {/* Book Cover Placeholder / Thumbnail */}
                <div className="h-40 rounded-xl bg-linear-to-br from-surface-100 to-surface-200 dark:from-surface-800 dark:to-surface-900 flex items-center justify-center overflow-hidden relative">
                  {book.thumbnailUrl ? (
                    <img
                      src={book.thumbnailUrl}
                      alt={book.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <BookOpenCheck size={48} className="text-surface-400" />
                  )}
                  {book.fileSource === 'UPLOAD' && (
                    <span className="absolute top-2.5 right-2.5 text-xs font-semibold bg-primary-600/90 text-white px-2.5 py-0.5 rounded-full">
                      User PDF
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="flex flex-col gap-1.5 flex-1">
                  <h3 className="font-outfit text-md font-bold leading-snug line-clamp-2">
                    {book.title}
                  </h3>
                  {book.author && (
                    <span className="inline-flex items-center gap-1 text-xs text-surface-500">
                      <User size={12} className="shrink-0" /> {book.author}
                    </span>
                  )}
                  {book.description && (
                    <p className="text-xs text-surface-400 line-clamp-3 mt-1 leading-relaxed">
                      {book.description}
                    </p>
                  )}
                </div>

                {/* Footer stats */}
                <div className="flex justify-between items-center border-t border-surface-200 dark:border-surface-700 pt-4 text-xs text-surface-500">
                  <span>{book.genre || 'General'}</span>
                  <span>{book.totalChunks} pages</span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-5 mt-12">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="btn btn-secondary px-4 py-2"
              >
                Previous
              </button>
              <span className="text-sm text-surface-500">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="btn btn-secondary px-4 py-2"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
