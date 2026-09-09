import React from 'react';
import { RotateCcw, Sun, Moon } from 'lucide-react';

export default function Navbar({ 
  activeDataset, 
  setActiveDataset, 
  status, 
  onReseed, 
  isReseeding,
  theme,
  setTheme
}) {
  const datasets = [
    { id: 'all', label: 'All Documents' },
    { id: 'delhivery', label: 'Delhivery Corp' },
    { id: 'india-macroeconomy', label: 'India Macro' },
    { id: 'custom', label: 'Uploads' }
  ];

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 28px',
      borderBottom: '1px solid var(--border-hairline)',
      background: 'var(--bg-surface)',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      {/* Editorial Masthead */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
        <span className="font-serif" style={{ fontSize: '1.28rem', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
          Fact Ledger
        </span>
        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          / Superjoin Assignment
        </span>
      </div>

      {/* Dataset Filter Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: 'var(--bg-surface-secondary)',
        border: '1px solid var(--border-hairline)',
        borderRadius: '4px',
        padding: '2px'
      }}>
        {datasets.map((d) => {
          const isActive = activeDataset === d.id;
          return (
            <button
              key={d.id}
              onClick={() => setActiveDataset(d.id)}
              style={{
                background: isActive ? 'var(--bg-surface)' : 'transparent',
                color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                border: isActive ? '1px solid var(--border-hairline)' : '1px solid transparent',
                boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                padding: '5px 12px',
                borderRadius: '3px',
                fontSize: '0.8rem',
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.1s ease'
              }}
            >
              {d.label}
            </button>
          );
        })}
      </div>

      {/* Actions & Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Store Indicator */}
        <span className="stamp stamp-neutral" title="Data Store">
          {status?.database?.connected ? 'MongoDB' : 'Memory Cache'}
        </span>

        {/* Engine Indicator */}
        <span className="stamp stamp-neutral" title="Extraction Engine">
          {status?.llm?.hasKey ? `${status.llm.provider}` : 'Heuristic Engine'}
        </span>

        {/* 2-Color Theme Switcher */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="btn-outline"
          style={{ padding: '5px 9px' }}
          title={theme === 'dark' ? 'Switch to Warm Parchment (Light)' : 'Switch to Carbon Slate (Dark)'}
        >
          {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
          <span style={{ fontSize: '0.74rem' }}>{theme === 'dark' ? 'Parchment' : 'Carbon'}</span>
        </button>

        {/* Reset / Re-seed */}
        <button
          onClick={onReseed}
          disabled={isReseeding}
          className="btn-outline"
          style={{ padding: '5px 9px', fontSize: '0.74rem' }}
          title="Reset starter test datasets"
        >
          <RotateCcw size={12} className={isReseeding ? 'animate-spin' : ''} />
          <span>{isReseeding ? 'Resetting...' : 'Reset'}</span>
        </button>
      </div>
    </header>
  );
}
