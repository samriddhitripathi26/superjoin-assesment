import { callLLM } from './llmService.js';

/**
 * Extracts facts from PDF pages
 * @param {Array<{ pageNumber: number, text: string }>} pages
 * @param {string} documentName
 * @param {string} dataset
 * @returns {Promise<Array<Object>>}
 */
export async function extractFactsFromPages(pages, documentName, dataset = 'custom') {
  const allFacts = [];

  // 1. Check if LLM is available for intelligent extraction
  const samplePages = pages.slice(0, Math.min(pages.length, 12)); // process representative pages or full for custom docs
  
  for (const page of samplePages) {
    if (!page.text || page.text.length < 50) continue;

    const pageSnippet = page.text.slice(0, 3000);
    const llmPrompt = `Analyze the following page from document "${documentName}".
Extract 2 to 4 notable numerical or semantic facts.
For EVERY fact, include:
- entity: subject/company/institution/metric target (e.g., "Company Name", "Indian Economy")
- attribute: the property/metric being described (e.g., "Pin code reach", "Revenue", "GDP growth rate", "CEO")
- value: the factual claim or figure
- numericValue: numerical magnitude if applicable (or null)
- unit: unit of measurement (e.g. "%", "INR Cr", "pin codes", "USD", "people")
- timePeriod: fiscal year, calendar date, or reporting period (e.g. "FY24", "Q4 FY24", "2022")
- scope: scope (e.g. "Consolidated", "Standalone", "Headline", "Segment")
- category: one of ["Financial", "Operational", "Macroeconomic", "Leadership", "General"]
- evidenceQuote: verbatim short sentence or phrase from the text providing undeniable proof
- confidence: between 0.8 and 1.0

Return JSON in format:
{
  "facts": [
    {
      "entity": "...",
      "attribute": "...",
      "value": "...",
      "numericValue": 0,
      "unit": "...",
      "timePeriod": "...",
      "scope": "...",
      "category": "...",
      "evidenceQuote": "...",
      "confidence": 0.95
    }
  ]
}

Page Content:
"""${pageSnippet}"""`;

    let extractedFromPage = null;
    try {
      const llmResult = await callLLM(llmPrompt);
      if (llmResult && Array.isArray(llmResult.facts) && llmResult.facts.length > 0) {
        extractedFromPage = llmResult.facts.map(f => ({
          ...f,
          documentName,
          dataset,
          pageNumber: page.pageNumber,
          method: 'llm'
        }));
      }
    } catch (e) {
      // fallback
    }

    // 2. If LLM did not return facts, use deterministic grounded heuristic extractor
    if (!extractedFromPage || extractedFromPage.length === 0) {
      extractedFromPage = extractFactsHeuristically(page.text, page.pageNumber, documentName, dataset);
    }

    allFacts.push(...extractedFromPage);
  }

  // Deduplicate facts with identical entity, attribute, timePeriod, and pageNumber
  const uniqueFacts = [];
  const seen = new Set();

  for (const fact of allFacts) {
    const key = `${fact.entity.toLowerCase()}_${fact.attribute.toLowerCase()}_${fact.timePeriod}_${fact.pageNumber}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueFacts.push(fact);
    }
  }

  return uniqueFacts;
}

/**
 * Robust heuristic pattern extractor that generalizes across arbitrary uploaded documents
 */
function extractFactsHeuristically(text, pageNumber, documentName, dataset) {
  const facts = [];
  
  // Dynamic entity inference from document name and content
  let entityHint = documentName.replace(/[-_]/g, ' ').replace(/\.pdf$/i, '').trim();
  entityHint = entityHint.replace(/^\d+\s*/, '');
  if (entityHint.toLowerCase().includes('delhivery')) entityHint = 'Delhivery Limited';
  else if (entityHint.toLowerCase().includes('rbi')) entityHint = 'Reserve Bank of India';
  else if (entityHint.toLowerCase().includes('economic survey')) entityHint = 'Indian Economy';
  else if (entityHint.toLowerCase().includes('imf')) entityHint = 'IMF / Indian Economy';

  // Specific high-precision domain patterns (bidirectional)
  const specificPatterns = [
    {
      regex: /(?:pin[\s-]?codes?|pin-code reach|network reach)\s*(?:\([^\)]*\))?\s*(?:covered|reached|of)?\s*[:\-–]?\s*([>~]?\s*[\d,]+(?:\s+[\d,]+)*)/i,
      attribute: 'PIN Code Reach',
      unit: 'PIN codes',
      category: 'Operational',
      extractVal: (m) => {
        const nums = m[1].match(/[\d,]+/g);
        return nums ? nums[nums.length - 1] : m[1]; // take latest if table series
      }
    },
    {
      regex: /(?:revenue from operations|total revenue|revenue from services|revenue)\s*(?:of|stood at|reached|was)?\s*[:\-–]?\s*([$€£₹]?\s*[\d,.]+\s*(?:Cr|Crores?|Mn|Millions?|Bn|Billions?))/i,
      attribute: 'Revenue from Operations',
      unit: 'Currency',
      category: 'Financial'
    },
    // Inverted slide callout: [VALUE] [ATTRIBUTE] (e.g., "₹8,142 Cr FY24 revenue from services")
    {
      regex: /([$€£₹]\s*[\d,.]+\s*(?:Cr|Crores?|Mn|Millions?|Bn|Billions?))\s+(?:FY\d\d\s+)?(?:revenue from operations|total revenue|revenue from services|revenue)\b/i,
      attribute: 'Revenue from Operations',
      unit: 'Currency',
      category: 'Financial'
    },
    {
      regex: /(?:adjusted EBITDA|EBITDA|Adj\.\s*EBITDA)\s*(?:margin|of|stood at|was)?\s*[:\-–]?\s*([$€£₹]?\s*[\(\-]?[\d,.]+\s*(?:Cr|Crores?|Mn|Millions?|%)?)/i,
      attribute: 'Adjusted EBITDA',
      unit: 'Financial Metric',
      category: 'Financial'
    },
    // Inverted slide callout: [VALUE] [ADJ EBITDA] (e.g., "₹76Cr / 0.9 % Adj. EBITDA")
    {
      regex: /([$€£₹]\s*[\(\-]?[\d,.]+\s*(?:Cr|Crores?|Mn|Millions?))\s*(?:\/\s*[\d.]+\s*%)?\s+(?:Adj\.\s*EBITDA|Adjusted EBITDA|EBITDA)\b/i,
      attribute: 'Adjusted EBITDA',
      unit: 'Financial Metric',
      category: 'Financial'
    },
    // Express Parcel Volume (e.g., "740 Mn Express parcel shipments in FY24")
    {
      regex: /([>~]?\s*[\d,.]+\s*(?:Mn|Millions?|Bn|Billions?))\s+(?:Express parcel shipments|shipments delivered)\b/i,
      attribute: 'Express Parcel Shipments',
      unit: 'shipments',
      category: 'Operational'
    },
    {
      regex: /(?:real GDP growth|GDP growth|growth rate)\s*(?:for\s*[\w\d/-]+)?\s*(?:is projected at|projected at|stood at|reached)?\s*[:\-–]?\s*([\d.]+\s*(?:-|to)?\s*[\d.]*%\s*(?:per cent)?)/i,
      attribute: 'Real GDP Growth',
      unit: '%',
      category: 'Macroeconomic'
    },
    {
      regex: /(?:current account deficit|CAD)\s*(?:of|stood at|narrowed to|widened to)?\s*[:\-–]?\s*([\d.]+\s*(?:per cent|%)\s*(?:of GDP)?)/i,
      attribute: 'Current Account Deficit (CAD)',
      unit: '% of GDP',
      category: 'Macroeconomic'
    },
    {
      regex: /(?:headline inflation|CPI inflation|retail inflation)\s*(?:moderated to|stood at|was)?\s*[:\-–]?\s*([\d.]+\s*(?:per cent|%))/i,
      attribute: 'Headline CPI Inflation',
      unit: '%',
      category: 'Macroeconomic'
    },
    {
      regex: /(?:Managing Director & CEO|MD & CEO|Chief Executive Officer)\s*[:\-–]?\s*([A-Z][a-z]+ [A-Z][a-z]+)/i,
      attribute: 'Chief Executive Officer & MD',
      unit: 'Person',
      category: 'Leadership'
    }
  ];

  // Generalized fallback patterns for arbitrary PDFs
  const generalizedPatterns = [
    {
      regex: /\b([A-Z][A-Za-z\s]{2,25}?)\s*(?:of|stood at|reached|was|reported|totaled)\s*[:\-–]?\s*([$€£₹]\s*[\d,]+(?:\.\d+)?\s*(?:billion|million|trillion|crore|crores|lakh|lakhs|bn|mn|cr)?)\b/i,
      unit: 'Currency',
      category: 'Financial'
    },
    {
      regex: /\b([A-Z][A-Za-z\s]{2,25}?)\s*(?:increased|decreased|grew|fell|was|stood at|of|is)\s*(?:by|to|at)?\s*[:\-–]?\s*([+-]?\d+(?:\.\d+)?\s*%(?:\s*(?:per cent|YoY|QoQ))?)\b/i,
      unit: '%',
      category: 'Financial'
    },
    {
      regex: /\b([A-Z][A-Za-z\s]{2,25}?)\s*(?:delivered|fulfilled|reached|surpassed|totaled)\s*[:\-–]?\s*([>~]?\s*[\d,]+(?:\.\d+)?\s*(?:shipments|orders|users|customers|employees|units|subscribers|clients))\b/i,
      unit: 'Count',
      category: 'Operational'
    }
  ];

  const timeRegex = /(FY\s*20?\d\d|Q[1-4]\s*FY\s*20?\d\d|202\d-2\d|December \d{1,2}, \d{4}|March 31, \d{4}|January \d{1,2}, \d{4}|\b20\d\d\b)/i;

  // Build multi-line candidate search chunks to handle table headers & slide callouts
  const rawLines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const searchChunks = [];

  for (let i = 0; i < rawLines.length; i++) {
    // 1-line
    searchChunks.push(rawLines[i]);
    // 2-line sliding window
    if (i + 1 < rawLines.length) {
      searchChunks.push(rawLines[i] + ' ' + rawLines[i + 1]);
    }
    // 3-line sliding window
    if (i + 2 < rawLines.length) {
      searchChunks.push(rawLines[i] + ' ' + rawLines[i + 1] + ' ' + rawLines[i + 2]);
    }
  }

  const seenAttributes = new Set();

  for (const chunk of searchChunks) {
    let matched = false;

    // 1. Try domain-specific patterns
    for (const pat of specificPatterns) {
      if (seenAttributes.has(pat.attribute)) continue;

      const match = chunk.match(pat.regex);
      if (match) {
        const extractedValue = pat.extractVal ? pat.extractVal(match) : match[1].trim();
        const timeMatch = chunk.match(timeRegex);
        const timePeriod = timeMatch ? timeMatch[0] : 'Current Period';
        const evidenceQuote = chunk.slice(0, 220);
        const cleanNum = parseFloat(extractedValue.replace(/[^\d.-]/g, ''));

        facts.push({
          documentName,
          dataset,
          entity: entityHint,
          attribute: pat.attribute,
          value: extractedValue,
          numericValue: isNaN(cleanNum) ? null : cleanNum,
          unit: pat.unit,
          timePeriod,
          scope: 'General Disclosure',
          category: pat.category,
          evidenceQuote,
          pageNumber,
          confidence: 0.94,
          method: 'grounded-heuristic'
        });

        seenAttributes.add(pat.attribute);
        matched = true;
        break;
      }
    }

    // 2. Try generalized patterns
    if (!matched && chunk.length > 25) {
      for (const pat of generalizedPatterns) {
        const match = chunk.match(pat.regex);
        if (match && match[1] && match[2]) {
          const rawAttr = match[1].trim();
          if (rawAttr.length < 3 || /^(this|that|there|it|which|we|our|they|in|on|as|for)\b/i.test(rawAttr)) continue;
          if (seenAttributes.has(rawAttr)) continue;

          const extractedValue = match[2].trim();
          const timeMatch = chunk.match(timeRegex);
          const timePeriod = timeMatch ? timeMatch[0] : 'Unspecified';
          const cleanNum = parseFloat(extractedValue.replace(/[^\d.-]/g, ''));

          facts.push({
            documentName,
            dataset,
            entity: entityHint,
            attribute: rawAttr,
            value: extractedValue,
            numericValue: isNaN(cleanNum) ? null : cleanNum,
            unit: pat.unit,
            timePeriod,
            scope: 'General Disclosure',
            category: pat.category,
            evidenceQuote: chunk.slice(0, 220),
            pageNumber,
            confidence: 0.88,
            method: 'generalized-extractor'
          });

          seenAttributes.add(rawAttr);
          break;
        }
      }
    }
  }

  return facts;
}
