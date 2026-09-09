import React, { useState, useMemo } from 'react';
import RelationshipCard from '../components/RelationshipCard.jsx';

export default function Relationships({ relationships, activeDataset }) {
  const [filterType, setFilterType] = useState('all');

  const filteredRels = useMemo(() => {
    if (filterType === 'all') return relationships;
    return relationships.filter((r) => r.relationType === filterType);
  }, [relationships, filterType]);

  const corroborationCount = relationships.filter((r) => r.relationType === 'CORROBORATION').length;
  const contradictionCount = relationships.filter((r) => r.relationType === 'CONTRADICTION').length;
  const reconciledCount = relationships.filter((r) => r.relationType === 'RECONCILED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Bar */}
      <div className="editorial-card" style={{ padding: '20px' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '4px' }}>
          Cross-Document Reconciliation
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          {relationships.length} cross-document relationships discovered {activeDataset !== 'all' ? `in ${activeDataset}` : 'across all documents'}
        </p>

        {/* Filter Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <button
            onClick={() => setFilterType('all')}
            className={filterType === 'all' ? 'btn-solid' : 'btn-outline'}
            style={{ padding: '4px 12px', fontSize: '0.78rem' }}
          >
            All Relationships ({relationships.length})
          </button>

          <button
            onClick={() => setFilterType('CORROBORATION')}
            style={{
              padding: '4px 12px',
              borderRadius: '3px',
              fontSize: '0.78rem',
              fontWeight: 500,
              cursor: 'pointer',
              background: filterType === 'CORROBORATION' ? 'var(--status-corroborate-bg)' : 'transparent',
              color: 'var(--status-corroborate-text)',
              border: '1px solid var(--status-corroborate-border)'
            }}
          >
            ✓ Corroboration ({corroborationCount})
          </button>

          <button
            onClick={() => setFilterType('CONTRADICTION')}
            style={{
              padding: '4px 12px',
              borderRadius: '3px',
              fontSize: '0.78rem',
              fontWeight: 500,
              cursor: 'pointer',
              background: filterType === 'CONTRADICTION' ? 'var(--status-contradict-bg)' : 'transparent',
              color: 'var(--status-contradict-text)',
              border: '1px solid var(--status-contradict-border)'
            }}
          >
            ✕ Contradiction ({contradictionCount})
          </button>

          <button
            onClick={() => setFilterType('RECONCILED')}
            style={{
              padding: '4px 12px',
              borderRadius: '3px',
              fontSize: '0.78rem',
              fontWeight: 500,
              cursor: 'pointer',
              background: filterType === 'RECONCILED' ? 'var(--status-reconciled-bg)' : 'transparent',
              color: 'var(--status-reconciled-text)',
              border: '1px solid var(--status-reconciled-border)'
            }}
          >
            ⟷ Reconciled by Context ({reconciledCount})
          </button>
        </div>
      </div>

      {/* Relationships List */}
      <div>
        {filteredRels.length > 0 ? (
          filteredRels.map((rel, idx) => (
            <RelationshipCard key={rel._id || idx} rel={rel} />
          ))
        ) : (
          <div className="editorial-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No relationships found matching this filter.
          </div>
        )}
      </div>
    </div>
  );
}
