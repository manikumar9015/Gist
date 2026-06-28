import { useRef, useEffect } from 'react';
import { Settings, X, AArrowDown, AArrowUp } from 'lucide-react';

export default function ReadingSettings({
  showSettings,
  setShowSettings,
  easyRead,
  setEasyRead,
  theme,
  setTheme,
  fontFamily,
  setFontFamily,
  fontSize,
  increaseFontSize,
  decreaseFontSize
}) {
  const settingsRef = useRef(null);

  useEffect(() => {
    if (!showSettings) return;

    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        // Skip closing if the click was on the trigger button itself
        if (event.target.closest('button[style*="left: 24px"]') || event.target.closest('.btn-secondary.glass')) {
          return;
        }
        setShowSettings(false);
      }
    };

    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, [showSettings, setShowSettings]);

  return (
    <>
      {/* Floating Settings Popover */}
      {showSettings && (
        <div ref={settingsRef} className="glass animate-fade-in" style={{
          position: 'fixed',
          bottom: '92px',
          left: '24px',
          width: '280px',
          padding: '1.25rem',
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-2xl)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          zIndex: 100
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Reading Settings</span>
            <button 
              onClick={() => setShowSettings(false)} 
              className="btn btn-ghost btn-icon" 
              style={{ width: '1.5rem', height: '1.5rem', minWidth: 'auto', padding: 0 }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Easy Read Mode */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Easy Read (AI)</span>
            <button
              onClick={() => setEasyRead(!easyRead)}
              className="btn"
              style={{
                height: '1.875rem',
                padding: '0 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: easyRead ? 'var(--accent-gradient)' : 'var(--bg-secondary)',
                color: easyRead ? 'white' : 'var(--text-secondary)',
                border: '1px solid ' + (easyRead ? 'var(--accent-primary)' : 'var(--border-color)'),
                boxShadow: easyRead ? 'var(--shadow-glow)' : 'none',
              }}
            >
              {easyRead ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Theme */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Theme</span>
            <select 
              value={theme} 
              onChange={(e) => setTheme(e.target.value)}
              style={{ 
                padding: '0.25rem 0.5rem', 
                borderRadius: '6px', 
                border: '1px solid var(--border-color)', 
                background: 'var(--bg-secondary)', 
                color: 'var(--text-primary)',
                fontSize: '0.75rem',
                outline: 'none'
              }}
            >
              <option value="light">Light</option>
              <option value="sepia">Sepia</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          {/* Font */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Font Family</span>
            <select 
              value={fontFamily} 
              onChange={(e) => setFontFamily(e.target.value)}
              style={{ 
                padding: '0.25rem 0.5rem', 
                borderRadius: '6px', 
                border: '1px solid var(--border-color)', 
                background: 'var(--bg-secondary)', 
                color: 'var(--text-primary)',
                fontSize: '0.75rem',
                outline: 'none'
              }}
            >
              <option value="serif">Serif</option>
              <option value="sans">Sans-serif</option>
              <option value="mono">Monospace</option>
            </select>
          </div>

          {/* Font Size */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Font Size</span>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              height: '1.875rem'
            }}>
              <button onClick={decreaseFontSize} className="btn btn-ghost btn-icon" style={{ height: '100%', width: '1.75rem', padding: 0 }}>
                <AArrowDown size={12} />
              </button>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0 0.5rem', color: 'var(--text-secondary)' }}>
                {fontSize}px
              </span>
              <button onClick={increaseFontSize} className="btn btn-ghost btn-icon" style={{ height: '100%', width: '1.75rem', padding: 0 }}>
                <AArrowUp size={12} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Settings Activation Trigger */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="btn btn-secondary glass"
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
          width: '3.5rem',
          height: '3.5rem',
          borderRadius: 'var(--radius-full)',
          boxShadow: 'var(--shadow-xl)',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          border: '1px solid var(--border-color)',
          background: 'var(--bg-tertiary)',
          color: 'var(--text-primary)'
        }}
      >
        <Settings size={24} />
      </button>
    </>
  );
}
