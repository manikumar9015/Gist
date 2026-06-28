import { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../../api/books';
import { X, Send, Bot, User, Loader2, MessageSquare } from 'lucide-react';

export default function ChatPanel({ isOpen, onClose, bookId, currentChunk, bookTitle }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm your Gist assistant. Ask me anything about the passages you're reading right now, or get explanations for tricky words!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        // Skip closing if the click was on the trigger button itself
        if (event.target.closest('button[style*="right: 24px"]') || event.target.closest('.btn-primary')) {
          return;
        }
        onClose();
      }
    };

    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, [isOpen, onClose]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await sendChatMessage(bookId, userMessage.content, currentChunk);
      const botMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.data.answer
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I had trouble reaching the AI service. Make sure your API keys are configured correctly!"
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div ref={panelRef} className="card glass animate-slide-up" style={{
      position: 'fixed',
      bottom: '80px',
      right: '24px',
      width: '380px',
      height: '500px',
      zIndex: 99,
      display: 'flex',
      flexDirection: 'column',
      padding: 0,
      overflow: 'hidden',
      boxShadow: 'var(--shadow-xl)',
      borderRadius: 'var(--radius-lg)'
    }}>
      {/* Header */}
      <div style={{
        padding: 'var(--space-md)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(99, 102, 241, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <MessageSquare size={18} style={{ color: 'var(--accent-primary)' }} />
          <div>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.9375rem' }}>
              Reading Assistant
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Context: {bookTitle} (Chunk {currentChunk + 1})
            </span>
          </div>
        </div>
        <button onClick={onClose} className="btn btn-ghost btn-icon" style={{ width: '2rem', height: '2rem' }}>
          <X size={16} />
        </button>
      </div>

      {/* Message List */}
      <div style={{
        flexGrow: 1,
        overflowY: 'auto',
        padding: 'var(--space-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-md)'
      }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              gap: 'var(--space-sm)',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              alignItems: 'start'
            }}
          >
            {/* Avatar */}
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: msg.role === 'user' ? 'var(--bg-tertiary)' : 'var(--accent-primary)',
              color: msg.role === 'user' ? 'var(--text-primary)' : 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              border: '1px solid var(--border-color)'
            }}>
              {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>

            {/* Bubble */}
            <div style={{
              maxWidth: '80%',
              padding: '0.625rem 0.875rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              lineHeight: 1.4,
              backgroundColor: msg.role === 'user' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
              color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
              border: msg.role === 'user' ? 'none' : '1px solid var(--border-color)',
              borderTopRightRadius: msg.role === 'user' ? '2px' : 'var(--radius-md)',
              borderTopLeftRadius: msg.role === 'user' ? 'var(--radius-md)' : '2px',
              wordBreak: 'break-word'
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'start' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--accent-primary)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bot size={14} />
            </div>
            <div className="card glass" style={{
              padding: '0.5rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-sm)',
              borderRadius: 'var(--radius-md)',
              borderTopLeftRadius: '2px'
            }}>
              <Loader2 size={16} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Analyzing book text...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form onSubmit={handleSend} style={{
        padding: 'var(--space-sm) var(--space-md)',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        gap: 'var(--space-sm)',
        backgroundColor: 'var(--bg-secondary)'
      }}>
        <input
          type="text"
          placeholder="Ask a question about the book..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          style={{ height: '2.25rem', fontSize: '0.8125rem' }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="btn btn-primary btn-icon"
          style={{ width: '2.25rem', height: '2.25rem', flexShrink: 0 }}
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
