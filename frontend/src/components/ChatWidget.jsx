import { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, MessageSquare, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { askChat } from '../api/books';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatWidget({ bookId, currentPosition = 0 }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I am your AI reading companion. Ask me anything about the book to simplify complex ideas.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const widgetRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target)) {
        if (event.target.closest('.fixed.bottom-6.right-6.w-14.h-14')) {
          return;
        }
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await askChat({
        bookId,
        query: userMessage,
        currentPosition
      });
      
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.answer }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try asking again.',
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-primary-600 text-white rounded-full shadow-2xl flex items-center justify-center z-40 transition-transform ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <Sparkles size={24} />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={widgetRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-80 sm:w-96 h-128 max-h-[80vh] glass rounded-2xl shadow-2xl z-50 flex flex-col border border-white/20 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-linear-to-r from-primary-600 to-primary-500 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Bot size={20} />
                <span className="font-outfit font-semibold">AI Assistant</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-50 dark:bg-surface-900/50">
              {messages.map((msg, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-2xl p-3 ${
                      msg.role === 'user' 
                        ? 'bg-primary-600 text-white rounded-tr-sm' 
                        : msg.isError
                          ? 'bg-danger/10 text-danger rounded-tl-sm'
                          : 'bg-white dark:bg-surface-800 shadow-sm rounded-tl-sm'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm">{msg.content}</p>
                    )}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-surface-800 shadow-sm rounded-2xl rounded-tl-sm p-4 flex items-center gap-2">
                    <Loader2 className="animate-spin text-primary-500" size={16} />
                    <span className="text-sm text-surface-500">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-3 bg-white dark:bg-surface-900 border-t border-surface-200 dark:border-surface-800 shrink-0">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="w-full pl-4 pr-12 py-3 bg-surface-100 dark:bg-surface-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm transition-all"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
