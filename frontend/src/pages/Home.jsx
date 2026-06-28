import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Sparkles, Zap, Brain, ArrowRight, MessageSquare, Loader2, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { fetchTopBooks } from '../api/books';
import BookCard from '../components/BookCard';

export default function Home() {
  const { user } = useAuth();
  const [topBooks, setTopBooks] = useState([]);
  const [loadingTop, setLoadingTop] = useState(true);

  useEffect(() => {
    fetchTopBooks(10)
      .then(res => {
        setTopBooks(res.data);
      })
      .catch(console.error)
      .finally(() => setLoadingTop(false));
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-28 pt-20 pb-32 overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-linear-to-b from-primary-500/10 via-primary-500/5 to-transparent -z-10 pointer-events-none" />
      <div className="absolute top-40 -left-64 w-96 h-96 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob -z-10" />
      <div className="absolute top-40 -right-64 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 -z-10" />

      <motion.div 
        className="max-w-4xl mx-auto px-4 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary-500/20 text-primary-600 dark:text-primary-400 font-medium text-sm mb-8 shadow-sm">
          <Sparkles size={16} />
          <span>Read Smarter, Not Harder</span>
        </motion.div>

        <motion.h1 
          variants={itemVariants} 
          className="text-5xl md:text-7xl font-outfit font-extrabold tracking-tight mb-8 leading-tight text-center"
          style={{ textAlign: 'center' }}
        >
          Understand any book with <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-primary-600 to-purple-600">
            AI-powered reading
          </span>
        </motion.h1>

        <motion.p 
          variants={itemVariants} 
          className="text-xl text-surface-600 dark:text-surface-400 mb-12 max-w-2xl mx-auto leading-relaxed text-center"
          style={{ textAlign: 'center' }}
        >
          Upload any PDF book and let our AI companion simplify complex concepts, explain difficult passages, and answer your questions in real-time while you read.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to={user ? "/library" : "/register"} className="btn btn-primary btn-lg w-full sm:w-auto flex items-center justify-center gap-2 group">
            <BookOpen size={22} className="group-hover:scale-110 transition-transform" />
            {user ? "Go to Library" : "Start Reading Now"}
          </Link>
          {!user && (
            <Link to="/login" className="btn btn-secondary btn-lg w-full sm:w-auto flex items-center justify-center gap-2">
              Sign In <ArrowRight size={22} />
            </Link>
          )}
        </motion.div>
      </motion.div>

      {/* Top 10 Books Section */}
      <motion.div
        className="max-w-7xl mx-auto px-4 w-full"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        <motion.div variants={itemVariants} className="flex items-center gap-2 mb-8">
          <TrendingUp className="text-primary-500" size={28} />
          <h2 className="text-3xl font-bold font-outfit">Top 10 Most Viewed Books</h2>
        </motion.div>

        {loadingTop ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-primary-500" size={40} />
          </div>
        ) : topBooks.length > 0 ? (
          <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scrollbar-hide items-stretch" style={{ scrollbarWidth: 'none' }}>
            {topBooks.map(book => (
              <BookCard 
                key={book.id} 
                book={book} 
                className="w-[250px] md:w-[300px] shrink-0 snap-center" 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-surface-500 glass rounded-2xl">
            No books are currently trending.
          </div>
        )}
      </motion.div>

      {/* Features Section */}
      <motion.div 
        className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.div variants={itemVariants} className="card p-8 group">
          <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Brain size={28} />
          </div>
          <h3 className="text-xl font-bold font-outfit mb-3">Instant Explanations</h3>
          <p className="text-surface-600 dark:text-surface-400">
            Highlight any confusing paragraph and our AI will break it down into simple terms instantly.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="card p-8 group">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <MessageSquare size={28} />
          </div>
          <h3 className="text-xl font-bold font-outfit mb-3">Interactive Chat</h3>
          <p className="text-surface-600 dark:text-surface-400">
            Have a conversation with the book. Ask questions and get answers based on the context of what you're reading.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="card p-8 group">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Zap size={28} />
          </div>
          <h3 className="text-xl font-bold font-outfit mb-3">Multi-AI Fallback</h3>
          <p className="text-surface-600 dark:text-surface-400">
            Powered by Groq, Gemini, and Hugging Face. If one AI goes down, another instantly takes its place so you never stop reading.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
