import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function Documents({ documents, onSelectDoc }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="editorial-card" style={{ padding: '20px' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '4px' }}>
          Document Provenance Library
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          {documents.length} source PDF documents currently indexed in the Fact Knowledge Layer
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '14px'
      }}>
        {documents.map((doc, idx) => (
          <div key={doc._id || idx} className="editorial-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="stamp stamp-neutral" style={{ textTransform: 'uppercase' }}>
                  {doc.dataset}
                </span>

                <span className="stamp stamp-neutral">
                  {doc.status || 'indexed'}
                </span>
              </div>

              <h3 className="font-serif" style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                {doc.title || doc.originalName}
              </h3>

              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '10px' }}>
                {doc.filename}
              </div>

              {doc.metadata && (
                <div style={{
                  fontSize: '0.76rem',
                  color: 'var(--text-muted)',
                  background: 'var(--bg-surface-secondary)',
                  padding: '8px 10px',
                  borderRadius: '3px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px'
                }}>
                  {doc.metadata.period && (
                    <div>Period: <strong style={{ color: 'var(--text-main)' }}>{doc.metadata.period}</strong></div>
                  )}
                  {doc.metadata.publisher && (
                    <div>Publisher: <strong style={{ color: 'var(--text-main)' }}>{doc.metadata.publisher}</strong></div>
                  )}
                  {doc.metadata.sections && (
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Sections: {doc.metadata.sections}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '10px',
              borderTop: '1px solid var(--border-hairline)',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)'
            }}>
              <span>{doc.totalPages || 0} pgs · {doc.extractedFactsCount || 0} facts</span>

              <button
                onClick={() => onSelectDoc(doc._id)}
                className="btn-outline"
                style={{ padding: '3px 8px', fontSize: '0.74rem' }}
              >
                <span>View Facts</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
