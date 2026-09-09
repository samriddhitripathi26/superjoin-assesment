import React, { useState } from 'react';
import { updateLLMConfig } from '../api.js';

export default function LLMConfig({ currentConfig, onConfigUpdated }) {
  const [provider, setProvider] = useState(currentConfig?.provider || 'offline');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState(currentConfig?.model || 'gemini-1.5-flash');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleProviderChange = (newProvider) => {
    setProvider(newProvider);
    if (newProvider === 'gemini') setModel('gemini-1.5-flash');
    else if (newProvider === 'openai') setModel('gpt-4o-mini');
    else if (newProvider === 'groq') setModel('llama-3.3-70b-versatile');
    else if (newProvider === 'offline') setModel('heuristic-rule-engine');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSavedSuccess(false);

    try {
      await updateLLMConfig({
        provider,
        apiKey: apiKey.trim(),
        model
      });
      setSavedSuccess(true);
      if (onConfigUpdated) onConfigUpdated();
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to update LLM configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '780px' }}>
      <div className="editorial-card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '4px' }}>
          Extraction & Reasoning Engine Configuration
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
          Configure the underlying engine for newly uploaded documents. 
          By default, the system operates in offline heuristic mode with zero external dependencies 
          or API costs.
        </p>
      </div>

      <form onSubmit={handleSave} className="editorial-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
            Provider Selection
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px' }}>
            {[
              { id: 'offline', name: 'Offline Engine', desc: 'Zero Cost (Heuristic & Regex)' },
              { id: 'gemini', name: 'Google Gemini', desc: 'gemini-1.5-flash' },
              { id: 'openai', name: 'OpenAI', desc: 'gpt-4o-mini' },
              { id: 'groq', name: 'Groq Cloud', desc: 'llama-3.3-70b' }
            ].map((p) => {
              const isSelected = provider === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleProviderChange(p.id)}
                  style={{
                    padding: '12px',
                    borderRadius: '3px',
                    border: isSelected ? '1px solid var(--border-strong)' : '1px solid var(--border-hairline)',
                    background: isSelected ? 'var(--bg-surface-secondary)' : 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {p.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {provider !== 'offline' && (
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '5px' }}>
              {provider.toUpperCase()} API Key
            </label>
            <input
              type="password"
              placeholder={currentConfig?.hasKey ? '•••••••••••••••• (Key saved in memory)' : `Enter your ${provider} API key`}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '3px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-muted)',
                color: 'var(--text-main)',
                fontSize: '0.84rem',
                fontFamily: 'var(--font-mono)',
                outline: 'none'
              }}
            />
          </div>
        )}

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '5px' }}>
            Model Identifier
          </label>
          <input
            type="text"
            value={model}
            disabled={provider === 'offline'}
            onChange={(e) => setModel(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: '3px',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-muted)',
              color: 'var(--text-main)',
              fontSize: '0.84rem',
              fontFamily: 'var(--font-mono)',
              outline: 'none'
            }}
          />
        </div>

        {savedSuccess && (
          <div style={{
            padding: '8px 12px',
            background: 'var(--status-corroborate-bg)',
            border: '1px solid var(--status-corroborate-border)',
            color: 'var(--status-corroborate-text)',
            borderRadius: '3px',
            fontSize: '0.82rem'
          }}>
            Configuration saved successfully.
          </div>
        )}

        {error && (
          <div style={{
            padding: '8px 12px',
            background: 'var(--status-contradict-bg)',
            border: '1px solid var(--status-contradict-border)',
            color: 'var(--status-contradict-text)',
            borderRadius: '3px',
            fontSize: '0.82rem'
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="btn-solid"
          style={{ alignSelf: 'flex-start' }}
        >
          {isSaving ? 'Saving...' : 'Save Configuration'}
        </button>
      </form>
    </div>
  );
}
