/**
 * Cross-Document Reconciliation Engine
 * Discovers relationships across facts: Corroboration, Contradiction, and Contextual Reconciliation
 */

export function reconcileFacts(facts) {
  const relationships = [];

  // Group facts by entity and attribute
  for (let i = 0; i < facts.length; i++) {
    for (let j = i + 1; j < facts.length; j++) {
      const a = facts[i];
      const b = facts[j];

      // Must be from different documents or distinct sections
      if (a.documentName === b.documentName && a.pageNumber === b.pageNumber) continue;

      // Check if entities and attributes align
      const similarity = calculateSemanticSimilarity(a, b);
      if (similarity < 0.6) continue;

      // Classify the relationship
      const rel = classifyRelationship(a, b, similarity);
      if (rel) {
        relationships.push({
          dataset: a.dataset || b.dataset || 'custom',
          factA: {
            entity: a.entity,
            attribute: a.attribute,
            value: a.value,
            unit: a.unit,
            timePeriod: a.timePeriod,
            scope: a.scope,
            documentName: a.documentName,
            pageNumber: a.pageNumber,
            evidenceQuote: a.evidenceQuote
          },
          factB: {
            entity: b.entity,
            attribute: b.attribute,
            value: b.value,
            unit: b.unit,
            timePeriod: b.timePeriod,
            scope: b.scope,
            documentName: b.documentName,
            pageNumber: b.pageNumber,
            evidenceQuote: b.evidenceQuote
          },
          ...rel
        });
      }
    }
  }

  return relationships;
}

/**
 * Calculates similarity between two facts
 */
function calculateSemanticSimilarity(a, b) {
  const aAttr = a.attribute.toLowerCase();
  const bAttr = b.attribute.toLowerCase();
  const aEnt = a.entity.toLowerCase();
  const bEnt = b.entity.toLowerCase();

  // Attribute match check
  let attrScore = 0;
  if (aAttr === bAttr) {
    attrScore = 1.0;
  } else if (aAttr.includes(bAttr) || bAttr.includes(aAttr)) {
    attrScore = 0.8;
  } else if (
    (aAttr.includes('revenue') && bAttr.includes('revenue')) ||
    (aAttr.includes('gdp') && bAttr.includes('gdp')) ||
    (aAttr.includes('pin') && bAttr.includes('pin')) ||
    (aAttr.includes('cad') && bAttr.includes('cad')) ||
    (aAttr.includes('inflation') && bAttr.includes('inflation')) ||
    (aAttr.includes('ceo') && bAttr.includes('ceo'))
  ) {
    attrScore = 0.75;
  } else {
    return 0;
  }

  // Entity match check
  let entScore = 0;
  if (aEnt === bEnt || aEnt.includes(bEnt) || bEnt.includes(aEnt)) {
    entScore = 1.0;
  } else if (
    (aEnt.includes('delhivery') && bEnt.includes('delhivery')) ||
    (aEnt.includes('india') && bEnt.includes('rbi')) ||
    (aEnt.includes('economy') && bEnt.includes('india'))
  ) {
    entScore = 0.8;
  } else {
    entScore = 0.5;
  }

  return (attrScore * 0.7) + (entScore * 0.3);
}

/**
 * Classifies relationship into CORROBORATION, CONTRADICTION, or RECONCILED
 */
function classifyRelationship(a, b, similarityScore) {
  const normTimeA = normalizeTime(a.timePeriod);
  const normTimeB = normalizeTime(b.timePeriod);
  const sameTime = normTimeA && normTimeB && (normTimeA === normTimeB);

  const scopeA = (a.scope || '').toLowerCase();
  const scopeB = (b.scope || '').toLowerCase();
  const sameScope = scopeA === scopeB || scopeA === 'general' || scopeB === 'general';

  // 1. Check for Unit Reconciliation (e.g. Crores vs Millions)
  const unitReconciliation = checkUnitReconciliation(a, b);
  if (unitReconciliation) {
    return {
      relationType: 'RECONCILED',
      contextDimension: 'UNIT',
      explanation: unitReconciliation,
      similarityScore: Math.round(similarityScore * 100) / 100
    };
  }

  // 2. Check for Time Reconciliation (different periods)
  if (!sameTime && normTimeA && normTimeB) {
    return {
      relationType: 'RECONCILED',
      contextDimension: 'TIME',
      explanation: `Apparent numerical divergence between ${a.value} and ${b.value} is resolved across time: ${a.documentName} reports for period ${a.timePeriod}, whereas ${b.documentName} reports for period ${b.timePeriod}.`,
      similarityScore: Math.round(similarityScore * 100) / 100
    };
  }

  // 3. Check for Scope Reconciliation (e.g., segment vs consolidated)
  if (!sameScope && (scopeA.includes('segment') || scopeB.includes('segment') || scopeA.includes('standalone') || scopeB.includes('standalone'))) {
    return {
      relationType: 'RECONCILED',
      contextDimension: 'SCOPE',
      explanation: `Value difference (${a.value} vs ${b.value}) is explained by scope: one claim measures '${a.scope}' while the other measures '${b.scope}'.`,
      similarityScore: Math.round(similarityScore * 100) / 100
    };
  }

  // 4. Value comparison
  const cleanValA = cleanValue(a.value);
  const cleanValB = cleanValue(b.value);

  // Exact or close match under same time & scope => CORROBORATION
  if (cleanValA === cleanValB || (a.numericValue && b.numericValue && Math.abs(a.numericValue - b.numericValue) < 0.01)) {
    return {
      relationType: 'CORROBORATION',
      contextDimension: 'NONE',
      explanation: `Both documents independently corroborate the metric '${a.attribute}': '${a.value}' (in ${a.documentName}, p. ${a.pageNumber}) and '${b.value}' (in ${b.documentName}, p. ${b.pageNumber}).`,
      similarityScore: Math.round(similarityScore * 100) / 100
    };
  }

  // 5. Significant divergence under same time & scope => CONTRADICTION
  return {
    relationType: 'CONTRADICTION',
    contextDimension: 'METHODOLOGY',
    explanation: `Direct conflict for ${a.attribute} during ${a.timePeriod}: ${a.documentName} reports '${a.value}' while ${b.documentName} reports '${b.value}'. Differences stem from diverging institutional forecasting, accounting adjustments, or definitions.`,
    similarityScore: Math.round(similarityScore * 100) / 100
  };
}

/**
 * Checks for Indian financial unit conversions: 1 Crore = 10 Million
 */
function checkUnitReconciliation(a, b) {
  if (!a.numericValue || !b.numericValue) return null;

  const valA = a.numericValue;
  const valB = b.numericValue;

  // Crore (8142) vs Million (81416.5) -> ratio of ~10
  const ratio = valA > valB ? valA / valB : valB / valA;
  if (ratio >= 9.8 && ratio <= 10.2) {
    return `Reconciled via currency denomination scaling: 1 Crore INR equals 10 Million INR. Converting between units aligns the values (${valA} and ${valB}) within rounding margin.`;
  }

  // Crore vs Lakh (ratio of 100)
  if (ratio >= 98 && ratio <= 102) {
    return `Reconciled via currency denomination scaling: 1 Crore INR equals 100 Lakhs INR.`;
  }

  return null;
}

function cleanValue(val) {
  if (!val) return '';
  return String(val).toLowerCase().replace(/[^\w\d]/g, '');
}

function normalizeTime(time) {
  if (!time) return '';
  const str = String(time).toUpperCase();
  if (str.includes('FY24') || str.includes('2023-24') || str.includes('2024')) return 'FY24';
  if (str.includes('FY25') || str.includes('2024-25') || str.includes('2025')) return 'FY25';
  if (str.includes('FY23') || str.includes('2022-23') || str.includes('2023')) return 'FY23';
  if (str.includes('FY22') || str.includes('2021-22') || str.includes('2022') || str.includes('2021')) return 'FY22';
  return str.trim();
}
