import React from 'react';
import { CategoryBadge } from './Badge.jsx';

export default function FactCard({ fact }) {
  return (
    <div className="editorial-card" style={{
      padding: '18px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: '12px',
      height: '100%'
    }}>
      <div>
        {/* Top: Category + Page Reference */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <CategoryBadge category={fact.category} />
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Page {fact.pageNumber}
          </span>
        </div>

        {/* Entity & Attribute */}
        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: 'var(--font-mono)' }}>
          {fact.entity}
        </div>
        <h4 className="font-serif" style={{ fontSize: '1.15rem', lineHeight: '1.3', margin: '3px 0 10px 0' }}>
          {fact.attribute}
        </h4>

        {/* Value Display */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'baseline',
          gap: '6px',
          padding: '4px 10px',
          background: 'var(--bg-surface-secondary)',
          border: '1px solid var(--border-hairline)',
          borderRadius: '3px',
          marginBottom: '12px'
        }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
            {fact.value}
          </span>
          {fact.unit && fact.unit !== 'Currency' && fact.unit !== '%' && (
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              ({fact.unit})
            </span>
          )}
        </div>

        {/* Verbatim Excerpt */}
        <div>
          <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
            Verified Source Excerpt
          </div>
          <div className="excerpt-box" style={{ fontSize: '0.88rem' }}>
            "{fact.evidenceQuote}"
          </div>
        </div>
      </div>

      {/* Metadata Footer */}
      <div style={{
        paddingTop: '10px',
        borderTop: '1px solid var(--border-hairline)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.74rem',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)'
      }}>
        <span>{fact.timePeriod || 'Current'}</span>
        {fact.scope && fact.scope !== 'General' && (
          <span>{fact.scope}</span>
        )}
        {fact.confidence && (
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>
            {Math.round(fact.confidence * 100)}% conf
          </span>
        )}
      </div>
    </div>
  );
}
