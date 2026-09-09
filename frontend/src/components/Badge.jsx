import React from 'react';

export const RelationBadge = ({ type }) => {
  switch (type) {
    case 'CORROBORATION':
      return (
        <span className="stamp stamp-corroboration">
          ✓ Corroborated
        </span>
      );
    case 'CONTRADICTION':
      return (
        <span className="stamp stamp-contradiction">
          ✕ Contradiction
        </span>
      );
    case 'RECONCILED':
      return (
        <span className="stamp stamp-reconciled">
          ⟷ Reconciled
        </span>
      );
    default:
      return (
        <span className="stamp stamp-neutral">
          {type || 'Relationship'}
        </span>
      );
  }
};

export const DimensionBadge = ({ dimension }) => {
  if (!dimension || dimension === 'NONE') return null;
  return (
    <span className="stamp stamp-neutral" title={`Reconciliation Context: ${dimension}`}>
      Context: {dimension.toLowerCase()}
    </span>
  );
};

export const CategoryBadge = ({ category }) => {
  return (
    <span className="stamp stamp-neutral">
      {category || 'General'}
    </span>
  );
};
