import React, { useState, useMemo } from 'react';
import FactCard from '../components/FactCard.jsx';
import { Search } from 'lucide-react';

export default function Facts({ facts, activeDataset }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'Financial', label: 'Financial' },
    { id: 'Operational', label: 'Operational' },
    { id: 'Macroeconomic', label: 'Macroeconomic' },
    { id: 'Leadership', label: 'Leadership' }
  ];

  const filteredFacts = useMemo(() => {
    return facts.filter((f) => {
      if (selectedCategory !== 'all' && f.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inEntity = (f.entity || '').toLowerCase().includes(q);
        const inAttr = (f.attribute || '').toLowerCase().includes(q);
        const inVal = (f.value || '').toLowerCase().includes(q);
        const inQuote = (f.evidenceQuote || '').toLowerCase().includes(q);
        const inDoc = (f.documentName || '').toLowerCase().includes(q);
        return inEntity || inAttr || inVal || inQuote || inDoc;
      }
      return true;
    });
  }, [facts, selectedCategory, searchQuery]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header & Filter Controls */}
      <div className="editorial-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem' }}>
              Grounded Fact Index
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {filteredFacts.length} grounded factual assertions {activeDataset !== 'all' ? `in ${activeDataset}` : 'across all documents'}
            </p>
          </div>

          {/* Search Box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-muted)',
            borderRadius: '3px',
            padding: '5px 10px',
            width: '280px'
          }}>
            <Search size={14} color="var(--text-faint)" />
            <input
              type="text"
              placeholder="Search facts, quotes, entities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                fontSize: '0.82rem',
                outline: 'none',
                width: '100%'
              }}
            />
          </div>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  background: isActive ? 'var(--text-main)' : 'var(--bg-surface-secondary)',
                  color: isActive ? 'var(--bg-page)' : 'var(--text-muted)',
                  border: '1px solid var(--border-hairline)',
                  padding: '4px 10px',
                  borderRadius: '3px',
                  fontSize: '0.76rem',
                  fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.1s ease'
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Facts Cards Grid */}
      {filteredFacts.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '14px'
        }}>
          {filteredFacts.map((fact, idx) => (
            <FactCard key={fact._id || idx} fact={fact} />
          ))}
        </div>
      ) : (
        <div className="editorial-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No facts matched your search criteria.
        </div>
      )}
    </div>
  );
}
