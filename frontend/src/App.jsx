import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ShowcaseCases from './pages/ShowcaseCases.jsx';
import Facts from './pages/Facts.jsx';
import Relationships from './pages/Relationships.jsx';
import Documents from './pages/Documents.jsx';
import Upload from './pages/Upload.jsx';
import LLMConfig from './pages/LLMConfig.jsx';

import {
  fetchStatus,
  fetchDocuments,
  fetchFacts,
  fetchRelationships,
  fetchCases,
  seedData
} from './api.js';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeDataset, setActiveDataset] = useState('all');
  const [theme, setTheme] = useState('light'); // 'light' (Warm Parchment) or 'dark' (Carbon Slate)

  const [status, setStatus] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [facts, setFacts] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [cases, setCases] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isReseeding, setIsReseeding] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const loadData = useCallback(async () => {
    try {
      const [statusRes, docsRes, factsRes, relsRes, casesRes] = await Promise.all([
        fetchStatus(),
        fetchDocuments(activeDataset),
        fetchFacts({ dataset: activeDataset, documentId: selectedDocId }),
        fetchRelationships({ dataset: activeDataset }),
        fetchCases()
      ]);

      setStatus(statusRes);
      setDocuments(docsRes);
      setFacts(factsRes);
      setRelationships(relsRes);
      setCases(casesRes);
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeDataset, selectedDocId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleReseed = async () => {
    if (!window.confirm('Reset and re-populate the starter knowledge datasets?')) return;
    setIsReseeding(true);
    try {
      await seedData('all');
      await loadData();
    } catch (err) {
      console.error('Error reseeding:', err);
      alert('Failed to reseed database: ' + err.message);
    } finally {
      setIsReseeding(false);
    }
  };

  const handleSelectDoc = (docId) => {
    setSelectedDocId(docId);
    setActiveTab('facts');
  };

  const handleNavigate = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-page)' }}>
      <Navbar
        activeDataset={activeDataset}
        setActiveDataset={(ds) => {
          setSelectedDocId(null);
          setActiveDataset(ds);
        }}
        status={status}
        onReseed={handleReseed}
        isReseeding={isReseeding}
        theme={theme}
        setTheme={setTheme}
      />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (tab !== 'facts') setSelectedDocId(null);
            setActiveTab(tab);
          }}
          counts={status?.counts}
        />

        <main style={{
          flex: 1,
          padding: '32px 40px',
          maxWidth: '1280px',
          margin: '0 auto',
          width: '100%'
        }}>
          {isLoading ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '50vh',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-serif)',
              fontSize: '1.1rem',
              fontStyle: 'italic'
            }}>
              Opening ledger and verifying records...
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <Dashboard
                  status={status}
                  counts={status?.counts}
                  onNavigate={handleNavigate}
                />
              )}

              {activeTab === 'cases' && (
                <ShowcaseCases cases={cases} />
              )}

              {activeTab === 'facts' && (
                <Facts
                  facts={facts}
                  activeDataset={activeDataset}
                />
              )}

              {activeTab === 'relationships' && (
                <Relationships
                  relationships={relationships}
                  activeDataset={activeDataset}
                />
              )}

              {activeTab === 'documents' && (
                <Documents
                  documents={documents}
                  onSelectDoc={handleSelectDoc}
                />
              )}

              {activeTab === 'upload' && (
                <Upload
                  onUploadSuccess={loadData}
                  onNavigate={handleNavigate}
                />
              )}

              {activeTab === 'settings' && (
                <LLMConfig
                  currentConfig={status?.llm}
                  onConfigUpdated={loadData}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
