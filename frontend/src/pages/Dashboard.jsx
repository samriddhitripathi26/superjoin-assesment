import React from 'react';
import { ArrowRight, CheckCircle, AlertTriangle, ArrowLeftRight, HelpCircle } from 'lucide-react';

export default function Dashboard({ status, counts, onNavigate }) {
  const stats = [
    { label: 'Source Filings', value: counts?.documents || 0, sub: 'Prospectus, Annual Reports, Surveys' },
    { label: 'Grounded Facts', value: counts?.facts || 0, sub: 'Linked to page citations & verbatim quotes' },
    { label: 'Cross-Doc Links', value: counts?.relationships || 0, sub: 'Corroborations, conflicts, and reconciliations' },
    { label: 'Showcase Cases', value: 4, sub: 'Core evaluation demonstrations' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Editorial Masthead / Header */}
      <div className="editorial-card" style={{ padding: '30px', borderLeft: '4px solid var(--accent)' }}>
        <div style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
          Superjoin Engineering Assignment · VIT 2026
        </div>

        <h1 style={{ fontSize: '2.4rem', lineHeight: '1.2', marginBottom: '14px' }}>
          Fact Knowledge Layer & Cross-Document Grounding
        </h1>

        <p style={{ fontSize: '1.02rem', color: 'var(--text-muted)', lineHeight: '1.65', maxWidth: '820px', marginBottom: '22px' }}>
          Corporate disclosures, statutory filings, and institutional reports frequently present 
          overlapping facts using divergent units, temporal periods, or reporting conventions. 
          This system extracts grounded numerical and semantic facts, anchors them to exact text 
          citations, and reconciles apparent discrepancies across context dimensions.
        </p>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => onNavigate('cases')}
            className="btn-solid"
          >
            <span>Examine The 4 Showcase Cases</span>
            <ArrowRight size={14} />
          </button>

          <button 
            onClick={() => onNavigate('upload')}
            className="btn-outline"
          >
            <span>Upload New PDF</span>
          </button>
        </div>
      </div>

      {/* Numerical Ledger Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '14px'
      }}>
        {stats.map((s, i) => (
          <div key={i} className="editorial-card" style={{ padding: '18px' }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
              {s.label}
            </div>
            <div style={{ fontSize: '2.1rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
              {s.value}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-faint)', marginTop: '4px' }}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* The 4 Assignment Cases Section */}
      <div className="editorial-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem' }}>
              The Four Required Cases
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Direct demonstrations requested by the hiring assignment specification
            </p>
          </div>
          <button 
            onClick={() => onNavigate('cases')}
            className="btn-outline"
            style={{ fontSize: '0.78rem', padding: '5px 10px' }}
          >
            Review Evidence & Citations →
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '12px'
        }}>
          {/* Case 1 */}
          <div 
            onClick={() => onNavigate('cases')}
            className="editorial-card-interactive" 
            style={{ padding: '16px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <span className="stamp stamp-corroboration">Case 01</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>Corroboration</span>
            </div>
            <h4 style={{ fontSize: '0.96rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
              Independent Corroboration
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.45' }}>
              Delhivery PIN reach (18,793) corroborated across Annual Report FY24 and investor deck.
            </p>
          </div>

          {/* Case 2 */}
          <div 
            onClick={() => onNavigate('cases')}
            className="editorial-card-interactive" 
            style={{ padding: '16px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <span className="stamp stamp-contradiction">Case 02</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>Contradiction</span>
            </div>
            <h4 style={{ fontSize: '0.96rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
              Institutional Disagreement
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.45' }}>
              RBI 7.2% vs Economic Survey 6.5–7.0% FY25 GDP growth forecast divergence.
            </p>
          </div>

          {/* Case 3 */}
          <div 
            onClick={() => onNavigate('cases')}
            className="editorial-card-interactive" 
            style={{ padding: '16px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <span className="stamp stamp-reconciled">Case 03</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>Reconciled</span>
            </div>
            <h4 style={{ fontSize: '0.96rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
              Contextual Reconciliation
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.45' }}>
              10x revenue clash (₹8,142 Cr vs ₹81,416.5 Mn) resolved via unit conversion (1 Cr = 10 Mn).
            </p>
          </div>

          {/* Case 4 */}
          <div 
            onClick={() => onNavigate('cases')}
            className="editorial-card-interactive" 
            style={{ padding: '16px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <span className="stamp stamp-accent">Case 04</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>Safeguard</span>
            </div>
            <h4 style={{ fontSize: '0.96rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
              Failure Mode & Fix
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.45' }}>
              PDF multi-column table coordinate stream collapse mitigated by sliding-window anchoring.
            </p>
          </div>
        </div>
      </div>

      {/* Editorial Methodology Principles */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '16px'
      }}>
        <div className="editorial-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px', fontFamily: 'var(--font-mono)' }}>
            Core Principle I
          </div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>
            Strict Grounding Mandate
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            No metric is allowed to float as an isolated number. Every assertion records its exact source document, page number, and verbatim sentence excerpt for auditability.
          </p>
        </div>

        <div className="editorial-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px', fontFamily: 'var(--font-mono)' }}>
            Core Principle II
          </div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>
            Multi-Dimensional Context Resolution
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Before declaring a conflict, the engine checks unit denomination scales, reporting vintages, and accounting scopes (standalone vs consolidated) to avoid naive false positives.
          </p>
        </div>
      </div>
    </div>
  );
}
