import React from 'react';
import { RelationBadge, DimensionBadge } from './Badge.jsx';
import { BookOpen, AlertCircle, Wrench, CheckCircle } from 'lucide-react';

export default function CaseStudyCard({ item }) {
  const isFailureCase = item.caseNumber === 4;

  return (
    <article className="editorial-card" style={{
      padding: '26px',
      marginBottom: '22px',
      borderLeft: isFailureCase ? '3px solid var(--accent)' : '3px solid var(--border-strong)'
    }}>
      {/* Case Header */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
          <span className="stamp stamp-neutral" style={{ fontWeight: 600, color: 'var(--text-main)' }}>
            CASE 0{item.caseNumber}
          </span>

          {item.category === 'corroboration' && <RelationBadge type="CORROBORATION" />}
          {item.category === 'contradiction' && <RelationBadge type="CONTRADICTION" />}
          {item.category === 'reconciled_context' && <RelationBadge type="RECONCILED" />}
          {item.category === 'extraction_failure' && (
            <span className="stamp stamp-accent">
              Extraction & Reasoning Failure Post-Mortem
            </span>
          )}

          <DimensionBadge dimension={item.contextDimension} />

          <span style={{ fontSize: '0.74rem', color: 'var(--text-faint)', marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}>
            dossier: {item.dataset}
          </span>
        </div>

        <h3 className="font-serif" style={{ fontSize: '1.45rem', lineHeight: '1.3', color: 'var(--text-main)' }}>
          {item.title}
        </h3>
      </div>

      {/* Summary Note */}
      <div style={{
        padding: '10px 14px',
        background: 'var(--bg-surface-secondary)',
        border: '1px solid var(--border-hairline)',
        borderRadius: '3px',
        fontSize: '0.86rem',
        color: 'var(--text-main)',
        marginBottom: '20px',
        lineHeight: '1.5'
      }}>
        <strong style={{ color: 'var(--accent)', fontWeight: 600 }}>Analytical Claim: </strong>
        {item.claimSummary}
      </div>

      {/* Comparative Excerpt Columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
        gap: '16px',
        marginBottom: '20px'
      }}>
        {/* Document A Excerpt */}
        <div style={{
          padding: '14px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-hairline)',
          borderRadius: '3px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)' }}>
              {item.factA?.label || 'Source Record A'}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Page {item.factA?.pageNumber}
            </span>
          </div>

          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Filing: <span style={{ color: 'var(--text-main)' }}>{item.factA?.documentName}</span>
          </div>

          <div className="excerpt-box">
            {item.factA?.quotedEvidence}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '6px',
            fontSize: '0.78rem',
            paddingTop: '8px',
            borderTop: '1px solid var(--border-hairline)'
          }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Claimed Value: </span>
              <strong style={{ color: 'var(--text-main)' }}>{item.factA?.extractedValue}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Period: </span>
              <span>{item.factA?.timePeriod}</span>
            </div>
            {item.factA?.unit && (
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Denomination: </span>
                <span>{item.factA.unit}</span>
              </div>
            )}
            {item.factA?.scope && (
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Scope: </span>
                <span>{item.factA.scope}</span>
              </div>
            )}
          </div>
        </div>

        {/* Document B Excerpt */}
        <div style={{
          padding: '14px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-hairline)',
          borderRadius: '3px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)' }}>
              {item.factB?.label || 'Source Record B'}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Page {item.factB?.pageNumber}
            </span>
          </div>

          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Filing: <span style={{ color: 'var(--text-main)' }}>{item.factB?.documentName}</span>
          </div>

          <div className="excerpt-box">
            {item.factB?.quotedEvidence}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '6px',
            fontSize: '0.78rem',
            paddingTop: '8px',
            borderTop: '1px solid var(--border-hairline)'
          }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Claimed Value: </span>
              <strong style={{ color: 'var(--text-main)' }}>{item.factB?.extractedValue}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Period: </span>
              <span>{item.factB?.timePeriod}</span>
            </div>
            {item.factB?.unit && (
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Denomination: </span>
                <span>{item.factB.unit}</span>
              </div>
            )}
            {item.factB?.scope && (
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Scope: </span>
                <span>{item.factB.scope}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Reconciliation & Analysis */}
      <div style={{
        padding: '14px 16px',
        background: 'var(--bg-surface-secondary)',
        border: '1px solid var(--border-hairline)',
        borderRadius: '3px',
        marginBottom: isFailureCase ? '14px' : '0'
      }}>
        <div style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
          Verification Analysis & Resolution
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
          {item.reasoning}
        </p>

        {item.technicalDetails && (
          <div style={{ marginTop: '10px', fontSize: '0.78rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-hairline)', paddingTop: '8px', fontFamily: 'var(--font-mono)' }}>
            Mechanism: {item.technicalDetails}
          </div>
        )}
      </div>

      {/* Case 4 Post-Mortem Diagnosis & Fix */}
      {isFailureCase && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '12px'
        }}>
          <div style={{
            padding: '14px',
            background: 'var(--status-contradict-bg)',
            border: '1px solid var(--status-contradict-border)',
            borderRadius: '3px',
            fontSize: '0.82rem'
          }}>
            <div style={{ fontWeight: 600, color: 'var(--status-contradict-text)', marginBottom: '4px' }}>
              Root Cause Failure Diagnosis
            </div>
            <p style={{ color: 'var(--text-main)', lineHeight: '1.5' }}>
              {item.failureDiagnosis}
            </p>
          </div>

          <div style={{
            padding: '14px',
            background: 'var(--status-corroborate-bg)',
            border: '1px solid var(--status-corroborate-border)',
            borderRadius: '3px',
            fontSize: '0.82rem'
          }}>
            <div style={{ fontWeight: 600, color: 'var(--status-corroborate-text)', marginBottom: '4px' }}>
              Implemented Engineering Safeguard
            </div>
            <p style={{ color: 'var(--text-main)', lineHeight: '1.5' }}>
              {item.mitigationStrategy}
            </p>
          </div>
        </div>
      )}
    </article>
  );
}
