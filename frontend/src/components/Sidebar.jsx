import React from 'react';
import { 
  Compass, 
  Bookmark, 
  ListTree, 
  Split, 
  FileStack, 
  Upload, 
  Sliders 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, counts }) {
  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Overview & Ledger', 
      icon: Compass,
      badge: null
    },
    { 
      id: 'cases', 
      label: 'The 4 Showcase Cases', 
      icon: Bookmark,
      badge: 'Core Spec',
      highlight: true
    },
    { 
      id: 'facts', 
      label: 'Grounded Fact Index', 
      icon: ListTree,
      badge: counts?.facts || null
    },
    { 
      id: 'relationships', 
      label: 'Cross-Doc Reconciliation', 
      icon: Split,
      badge: counts?.relationships || null
    },
    { 
      id: 'documents', 
      label: 'Source Provenance', 
      icon: FileStack,
      badge: counts?.documents || null
    },
    { 
      id: 'upload', 
      label: 'Upload & Ground PDF', 
      icon: Upload,
      badge: null
    },
    { 
      id: 'settings', 
      label: 'Engine Settings', 
      icon: Sliders,
      badge: null
    }
  ];

  return (
    <aside style={{
      width: '240px',
      minWidth: '240px',
      borderRight: '1px solid var(--border-hairline)',
      background: 'var(--bg-surface)',
      height: 'calc(100vh - 57px)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '20px 12px',
      position: 'sticky',
      top: '57px'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <div style={{
          fontSize: '0.68rem',
          fontWeight: 600,
          color: 'var(--text-faint)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          padding: '4px 10px 8px 10px',
          fontFamily: 'var(--font-mono)'
        }}>
          Dossier Sections
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '3px',
                border: 'none',
                borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                background: isActive ? 'var(--bg-surface-secondary)' : 'transparent',
                color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                fontSize: '0.84rem',
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.1s ease',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = 'var(--bg-surface-hover)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <Icon size={16} color={isActive ? 'var(--accent)' : 'var(--text-faint)'} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span style={{
                  fontSize: '0.7rem',
                  padding: '1px 6px',
                  borderRadius: '3px',
                  background: item.highlight ? 'var(--accent-light)' : 'var(--bg-surface-secondary)',
                  color: item.highlight ? 'var(--accent)' : 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 500
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Human Editorial Note */}
      <div style={{
        padding: '12px',
        border: '1px solid var(--border-hairline)',
        background: 'var(--bg-surface-secondary)',
        borderRadius: '3px',
        fontSize: '0.74rem',
        color: 'var(--text-muted)',
        lineHeight: '1.4'
      }}>
        <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '3px' }}>
          Verification Rule
        </div>
        No assertion is entered into this ledger without an explicit page citation and verbatim excerpt.
      </div>
    </aside>
  );
}
