import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Search, Loader2, BookOpen, AlertCircle, FileText } from 'lucide-react';
import { fetchBooks, uploadBook } from '../api/books';
import { useAuth } from '../context/AuthContext';
import BookCard from '../components/BookCard';
import { motion, AnimatePresence } from 'framer-motion';

export default function Library() {
  const { isAdmin } = useAuth();
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [pendingFile, setPendingFile] = useState(null);
  const [uploadMetadata, setUploadMetadata] = useState({ title: '', author: '', genre: '', thumbnail: null });

  const loadBooks = async (query = '') => {
    try {
      setLoading(true);
      const res = await fetchBooks(query);
      setBooks(res.data.content || []);
      setError('');
    } catch (err) {
      console.error('Error loading books:', err);
      setError('Failed to load your library. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search
    const timeoutId = setTimeout(() => {
      loadBooks(search);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [search]);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be under 50MB.');
      return;
    }

    setPendingFile(file);
    setUploadMetadata({ title: file.name.replace('.pdf', ''), author: '', genre: '', thumbnail: null });
    setError('');
  }, []);

  const handleConfirmUpload = async () => {
    if (!pendingFile) return;

    try {
      setUploading(true);
      const fileToUpload = pendingFile;
      setPendingFile(null); // Close modal
      setError('');
      
      const progressInterval = setInterval(() => {
        setUploadProgress(p => p < 90 ? p + 5 : p);
      }, 500);

      await uploadBook(fileToUpload, uploadMetadata.thumbnail, uploadMetadata.title, uploadMetadata.author, uploadMetadata.genre);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        loadBooks();
      }, 1000);
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Failed to upload book. Please try again.');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    multiple: false
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-outfit font-bold mb-2">Your Library</h1>
          <p className="text-surface-500">Upload, manage, and read your books</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-surface-400" size={20} />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-full outline-none shadow-sm transition-shadow"
            placeholder="Search books by title, author, or genre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger flex items-start gap-3">
          <AlertCircle className="shrink-0 mt-0.5" size={20} />
          <p>{error}</p>
        </div>
      )}

      {/* Upload Zone */}
      <div 
        {...getRootProps()} 
        className={`mb-12 relative overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300 ${
          isDragActive 
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 scale-[1.02]' 
            : 'border-surface-300 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 hover:border-primary-400 hover:bg-surface-100 dark:hover:bg-surface-800'
        }`}
      >
        <input {...getInputProps()} />
        <div className="px-6 py-12 flex flex-col items-center justify-center text-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
            isDragActive ? 'bg-primary-600 text-white' : 'bg-primary-100 dark:bg-surface-800 text-primary-600 dark:text-primary-400'
          }`}>
            <Upload size={32} />
          </div>
          <h3 className="text-xl font-bold font-outfit mb-2">Upload a new book</h3>
          <p className="text-surface-500 mb-6 max-w-sm">
            Drag and drop your PDF here, or click to select a file. Maximum size is 50MB.
          </p>
          <button className="btn btn-primary" disabled={uploading}>
            Select PDF File
          </button>
        </div>
        
        {/* Upload Progress Overlay */}
        <AnimatePresence>
          {uploading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 glass flex flex-col items-center justify-center p-6"
            >
              <Loader2 className="animate-spin text-primary-600 mb-4" size={48} />
              <h3 className="text-xl font-bold font-outfit mb-2 text-primary-700 dark:text-primary-400">Processing Book...</h3>
              <p className="text-surface-600 dark:text-surface-300 mb-4 max-w-sm text-center">
                We're extracting text, generating pages, and preparing your AI reading experience. This might take a minute.
              </p>
              <div className="w-full max-w-md bg-surface-200 dark:bg-surface-700 rounded-full h-3 overflow-hidden shadow-inner">
                <motion.div 
                  className="bg-linear-to-r from-primary-500 to-purple-500 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="mt-2 text-sm font-medium text-surface-500">{uploadProgress}%</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Metadata Modal */}
      <AnimatePresence>
        {pendingFile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-surface-900 rounded-2xl shadow-xl max-w-md w-full p-6"
            >
              <h2 className="text-2xl font-bold font-outfit mb-4">Book Details</h2>
              <p className="text-surface-500 mb-6">Tell us more about the book to enhance your reading experience.</p>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                    value={uploadMetadata.title}
                    onChange={(e) => setUploadMetadata({...uploadMetadata, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Author</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                    value={uploadMetadata.author}
                    onChange={(e) => setUploadMetadata({...uploadMetadata, author: e.target.value})}
                    placeholder="e.g. J.K. Rowling"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Genre</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                    value={uploadMetadata.genre}
                    onChange={(e) => setUploadMetadata({...uploadMetadata, genre: e.target.value})}
                    placeholder="e.g. Fantasy, Science"
                  />
                </div>
                {isAdmin && (
                  <div>
                    <label className="block text-sm font-medium mb-1 text-primary-500">Thumbnail Cover (Admin Only)</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      className="w-full px-3 py-2 bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900/20 dark:file:text-primary-400"
                      onChange={(e) => setUploadMetadata({...uploadMetadata, thumbnail: e.target.files[0]})}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setPendingFile(null)}
                  className="flex-1 py-3 font-semibold rounded-xl text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmUpload}
                  className="flex-1 btn btn-primary"
                >
                  Start Upload
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Library Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary-500 mb-4" size={48} />
          <p className="text-surface-500">Loading your library...</p>
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
          <h3 className="text-2xl font-bold font-outfit mb-3">Your library is empty</h3>
          <p className="text-surface-500 max-w-md mx-auto mb-8">
            {search 
              ? "We couldn't find any books matching your search. Try different keywords." 
              : "Upload your first PDF book above to start reading with your AI companion."}
          </p>
        </div>
      )}
    </div>
  );
}
