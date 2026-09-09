import axios from 'axios';

const API_BASE = '/api';

export const fetchStatus = async () => {
  const res = await axios.get(`${API_BASE}/status`);
  return res.data;
};

export const fetchDocuments = async (dataset = 'all') => {
  const res = await axios.get(`${API_BASE}/documents`, { params: { dataset } });
  return res.data;
};

export const fetchFacts = async ({ dataset, documentId, category, query } = {}) => {
  const res = await axios.get(`${API_BASE}/facts`, {
    params: { dataset, documentId, category, query }
  });
  return res.data;
};

export const fetchRelationships = async ({ dataset, relationType } = {}) => {
  const res = await axios.get(`${API_BASE}/relationships`, {
    params: { dataset, relationType }
  });
  return res.data;
};

export const fetchCases = async () => {
  const res = await axios.get(`${API_BASE}/cases`);
  return res.data;
};

export const uploadPDF = async (file, dataset = 'custom', title = '') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('dataset', dataset);
  if (title) formData.append('title', title);

  const res = await axios.post(`${API_BASE}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const seedData = async (dataset = 'all') => {
  const res = await axios.post(`${API_BASE}/seed`, { dataset });
  return res.data;
};

export const updateLLMConfig = async (config) => {
  const res = await axios.post(`${API_BASE}/config/llm`, config);
  return res.data;
};
