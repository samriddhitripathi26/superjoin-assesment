import axios from 'axios';

let activeConfig = {
  provider: process.env.LLM_PROVIDER || 'gemini', // 'gemini', 'openai', 'groq', or 'offline'
  apiKey: process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || '',
  model: process.env.LLM_MODEL || 'gemini-1.5-flash'
};

export const updateLLMConfig = (newConfig) => {
  activeConfig = { ...activeConfig, ...newConfig };
  return activeConfig;
};

export const getLLMConfig = () => ({
  provider: activeConfig.provider,
  model: activeConfig.model,
  hasKey: Boolean(activeConfig.apiKey)
});

/**
 * Calls LLM with prompt and expects JSON back
 */
export async function callLLM(prompt, systemPrompt = 'You are an expert fact extraction and knowledge grounding AI.') {
  if (!activeConfig.apiKey || activeConfig.provider === 'offline') {
    return null; // Signals fallback to heuristic/semantic rule engine
  }

  try {
    if (activeConfig.provider === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${activeConfig.model}:generateContent?key=${activeConfig.apiKey}`;
      const response = await axios.post(url, {
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\n${prompt}` }]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1
        }
      }, { timeout: 30000 });

      const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return JSON.parse(reply);
    } else if (activeConfig.provider === 'openai' || activeConfig.provider === 'groq') {
      const baseURL = activeConfig.provider === 'groq' 
        ? 'https://api.groq.com/openai/v1/chat/completions' 
        : 'https://api.openai.com/v1/chat/completions';
      
      const response = await axios.post(baseURL, {
        model: activeConfig.model || (activeConfig.provider === 'groq' ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini'),
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1
      }, {
        headers: { Authorization: `Bearer ${activeConfig.apiKey}` },
        timeout: 30000
      });

      const reply = response.data?.choices?.[0]?.message?.content;
      return JSON.parse(reply);
    }
  } catch (err) {
    console.warn(`[LLM Service] Call failed: ${err.message}. Falling back to internal heuristic engine.`);
    return null;
  }
  return null;
}
