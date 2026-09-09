import React, { useState } from 'react';
import { uploadPDF } from '../api.js';
import FactCard from '../components/FactCard.jsx';
import { Upload, ArrowRight, Loader2 } from 'lucide-react';

export default function UploadPage({ onUploadSuccess, onNavigate }) {
  const [file, setFile] = useState(null);
  const [dataset, setDataset] = useState('custom');
  const [title, setTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.toLowerCase().endsWith('.pdf')) {
        setError('Please select a PDF document.');
        setFile(null);
        return;
      }
      setFile(selected);
      setError(null);
      if (!title) {
        setTitle(selected.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' '));
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      if (!selected.name.toLowerCase().endsWith('.pdf')) {
        setError('Please select a PDF document.');
        return;
      }
      setFile(selected);
      setError(null);
      if (!title) {
        setTitle(selected.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' '));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please choose a PDF file to process.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      const result = await uploadPDF(file, dataset, title);
      setUploadResult(result);
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.response?.data?.error || err.message || 'Failed to process and extract facts from PDF.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px' }}>
      {/* Header */}
      <div className="editorial-card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '4px' }}>
          Upload PDF & Expand Knowledge Layer
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
          Upload any corporate report or economic publication. The engine extracts verifiable numerical 
          and semantic facts, binds each to its exact page quote, and incrementally links newly discovered 
          assertions against all existing facts in the ledger.
        </p>
      </div>

      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="editorial-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '5px' }}>
              Target Dataset / Filing Category
            </label>
            <select
              value={dataset}
              onChange={(e) => setDataset(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '3px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-muted)',
                color: 'var(--text-main)',
                fontSize: '0.84rem',
                outline: 'none'
              }}
            >
              <option value="custom">Custom Uploads</option>
              <option value="delhivery">Delhivery Corporate Dataset</option>
              <option value="india-macroeconomy">India Macroeconomy Dataset</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '5px' }}>
              Document Title
            </label>
            <input
              type="text"
              placeholder="e.g. Q3 Investor Report"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '3px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-muted)',
                color: 'var(--text-main)',
                fontSize: '0.84rem',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Dropzone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => document.getElementById('pdf-file-input').click()}
          style={{
            border: '1px dashed var(--border-muted)',
            borderRadius: '4px',
            padding: '36px 20px',
            textAlign: 'center',
            background: 'var(--bg-surface-secondary)',
            cursor: 'pointer'
          }}
        >
          <input
            id="pdf-file-input"
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          <Upload size={32} color="var(--text-muted)" style={{ margin: '0 auto 10px auto' }} />

          {file ? (
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{file.name}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                {(file.size / (1024 * 1024)).toFixed(2)} MB · Selected
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>
                Select or drop a PDF file to process
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                Annual reports, quarterly disclosures, macro reviews (up to 25 MB)
              </p>
            </div>
          )}
        </div>

        {error && (
          <div style={{
            padding: '10px 14px',
            background: 'var(--status-contradict-bg)',
            border: '1px solid var(--status-contradict-border)',
            color: 'var(--status-contradict-text)',
            borderRadius: '3px',
            fontSize: '0.84rem'
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!file || isUploading}
          className="btn-solid"
          style={{ padding: '10px 20px', alignSelf: 'flex-start' }}
        >
          {isUploading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Parsing PDF & Grounding Facts...</span>
            </>
          ) : (
            <>
              <Upload size={16} />
              <span>Process PDF Document</span>
            </>
          )}
        </button>
      </form>

      {/* Results Box */}
      {uploadResult && (
        <div className="editorial-card" style={{ padding: '24px', borderLeft: '3px solid var(--status-corroborate-text)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>
              Extraction Complete
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => onNavigate('facts')}
                className="btn-solid"
                style={{ fontSize: '0.78rem', padding: '4px 10px' }}
              >
                Inspect Extracted Facts ({uploadResult.factsExtracted})
              </button>
              <button
                onClick={() => onNavigate('relationships')}
                className="btn-outline"
                style={{ fontSize: '0.78rem', padding: '4px 10px' }}
              >
                View Relationships ({uploadResult.relationshipsDiscovered})
              </button>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '10px',
            marginBottom: '18px'
          }}>
            <div style={{ padding: '10px', background: 'var(--bg-surface-secondary)', borderRadius: '3px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Document</div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{uploadResult.document?.title}</div>
            </div>
            <div style={{ padding: '10px', background: 'var(--bg-surface-secondary)', borderRadius: '3px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Pages</div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', fontFamily: 'var(--font-mono)' }}>{uploadResult.document?.totalPages}</div>
            </div>
            <div style={{ padding: '10px', background: 'var(--bg-surface-secondary)', borderRadius: '3px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Facts Extracted</div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', fontFamily: 'var(--font-mono)' }}>{uploadResult.factsExtracted}</div>
            </div>
            <div style={{ padding: '10px', background: 'var(--bg-surface-secondary)', borderRadius: '3px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Discovered Relationships</div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', fontFamily: 'var(--font-mono)' }}>{uploadResult.relationshipsDiscovered}</div>
            </div>
          </div>

          {uploadResult.facts && uploadResult.facts.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '10px'
            }}>
              {uploadResult.facts.slice(0, 4).map((f, i) => (
                <FactCard key={i} fact={f} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
