import { Link } from 'react-router-dom';
import { Book, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BookCard({ book, className = '' }) {
  // Use book cover if available, otherwise fallback to a generic gradient based on title
  const coverUrl = book.coverUrl || book.thumbnailUrl || null;
  
  // Generate a random gradient based on book ID or title for fallback covers
  const gradients = [
    'from-blue-500 to-purple-600',
    'from-emerald-400 to-cyan-500',
    'from-orange-400 to-rose-500',
    'from-indigo-500 to-blue-500',
    'from-fuchsia-500 to-pink-500'
  ];
  
  const bgGradient = gradients[(book.id || 0) % gradients.length];

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`card p-0! flex flex-col h-full overflow-hidden group cursor-pointer min-w-0 ${className}`}
    >
      <Link to={`/reader/${book.id}`} className="flex flex-col h-full">
        <div className="relative aspect-2/3 w-full overflow-hidden bg-black/5 dark:bg-white/5">
          {coverUrl ? (
            <img 
              src={coverUrl} 
              alt={book.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className={`w-full h-full bg-linear-to-br ${bgGradient} flex items-center justify-center p-6 text-center shadow-inner`}>
              <span className="font-merriweather font-bold text-white text-xl shadow-sm line-clamp-3">
                {book.title}
              </span>
            </div>
          )}
          
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <span className="btn-primary w-full text-center py-2 bg-white/20 backdrop-blur-md border border-white/30 text-white">
              Read Now
            </span>
          </div>
        </div>

        <div className="p-4 flex flex-col grow">
          <h3 className="font-outfit font-bold text-lg mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors">
            {book.title}
          </h3>
          <p className="text-sm text-surface-500 mb-3 line-clamp-1">
            {book.author || 'Unknown Author'}
          </p>
          
          <div className="mt-auto flex items-center justify-between text-xs text-surface-400 font-medium">
            <span className="flex items-center gap-1">
              <Book size={14} />
              {book.genre || 'General'}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              Added recently
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
