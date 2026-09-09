import React from 'react';
import { RelationBadge, DimensionBadge } from './Badge.jsx';

export default function RelationshipCard({ rel }) {
  const isCorroboration = rel.relationType === 'CORROBORATION';
  const isContradiction = rel.relationType === 'CONTRADICTION';

  return (
    <div className="editorial-card" style={{
      padding: '20px',
      marginBottom: '14px',
      borderLeft: isCorroboration 
        ? '3px solid var(--status-corroborate-text)' 
        : isContradiction 
          ? '3px solid var(--status-contradict-text)' 
          : '3px solid var(--status-reconciled-text)'
    }}>
      {/* Badges & Meta */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RelationBadge type={rel.relationType} />
          <DimensionBadge dimension={rel.contextDimension} />
          {rel.isKeyShowcase && (
            <span className="stamp stamp-accent">
              Showcase 0{rel.showcaseCase}
            </span>
          )}
        </div>

        <span style={{ fontSize: '0.74rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
          score: {Math.round((rel.similarityScore || 0.9) * 100)}%
        </span>
      </div>

      {/* Side-by-Side Comparison */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '12px',
        marginBottom: '14px'
      }}>
        {/* Fact A */}
        <div style={{
          padding: '12px 14px',
          background: 'var(--bg-surface-secondary)',
          border: '1px solid var(--border-hairline)',
          borderRadius: '3px'
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {rel.factA?.documentName}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
              p. {rel.factA?.pageNumber}
            </span>
          </div>

          <div style={{ fontSize: '0.94rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
            {rel.factA?.attribute}: <strong>{rel.factA?.value}</strong>
          </div>

          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
            {rel.factA?.timePeriod} {rel.factA?.scope ? `· ${rel.factA.scope}` : ''}
          </div>

          {rel.factA?.evidenceQuote && (
            <div className="excerpt-box" style={{ fontSize: '0.84rem', padding: '6px 10px' }}>
              "{rel.factA.evidenceQuote}"
            </div>
          )}
        </div>

        {/* Fact B */}
        <div style={{
          padding: '12px 14px',
          background: 'var(--bg-surface-secondary)',
          border: '1px solid var(--border-hairline)',
          borderRadius: '3px'
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {rel.factB?.documentName}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
              p. {rel.factB?.pageNumber}
            </span>
          </div>

          <div style={{ fontSize: '0.94rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
            {rel.factB?.attribute}: <strong>{rel.factB?.value}</strong>
          </div>

          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
            {rel.factB?.timePeriod} {rel.factB?.scope ? `· ${rel.factB.scope}` : ''}
          </div>

          {rel.factB?.evidenceQuote && (
            <div className="excerpt-box" style={{ fontSize: '0.84rem', padding: '6px 10px' }}>
              "{rel.factB.evidenceQuote}"
            </div>
          )}
        </div>
      </div>

      {/* Analytical Reasoning */}
      <div style={{
        padding: '10px 14px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-hairline)',
        borderRadius: '3px',
        fontSize: '0.84rem',
        lineHeight: '1.5',
        color: 'var(--text-main)'
      }}>
        <strong style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
          {isCorroboration ? 'Corroboration: ' : isContradiction ? 'Contradiction Analysis: ' : 'Reconciliation Note: '}
        </strong>
        {rel.explanation}
      </div>
    </div>
  );
}
