import React from 'react';
import CaseStudyCard from '../components/CaseStudyCard.jsx';

export default function ShowcaseCases({ cases }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Editorial Header */}
      <div className="editorial-card" style={{ padding: '24px 28px', borderLeft: '4px solid var(--accent)' }}>
        <div style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>
          Superjoin Requirement · Core Demonstrations
        </div>
        <h2 style={{ fontSize: '1.8rem', lineHeight: '1.25', marginBottom: '10px' }}>
          The Four Required Showcase Cases
        </h2>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.6', maxWidth: '850px' }}>
          As specified in the assignment brief, this dossier presents verified examples of cross-document 
          corroboration, genuine institutional disagreement, apparent contradiction reconciled by context, 
          and an authentic extraction failure mode with its concrete mitigation safeguard.
        </p>
      </div>

      {/* Case Studies List */}
      <div>
        {cases && cases.length > 0 ? (
          cases.map((c, idx) => (
            <CaseStudyCard key={c.caseNumber || idx} item={c} />
          ))
        ) : (
          <div className="editorial-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading showcase cases...
          </div>
        )}
      </div>
    </div>
  );
}
