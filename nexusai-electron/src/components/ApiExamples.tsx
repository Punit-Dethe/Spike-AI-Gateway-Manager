import { motion } from 'framer-motion';
import { useState } from 'react';

const ApiExamples = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<'python' | 'javascript' | 'curl' | 'openai'>('python');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3-flash');
  const [copied, setCopied] = useState(false);

  // All available models (from API documentation)
  const allModels = [
    // Gemini models
    { value: 'gemini-3-flash', label: 'Gemini 3 Flash', provider: 'Gemini' },
    { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', provider: 'Gemini' },
    { value: 'gemini-3.1-flash', label: 'Gemini 3.1 Flash', provider: 'Gemini' },
    { value: 'gemini-3.1-pro', label: 'Gemini 3.1 Pro', provider: 'Gemini' },
    // ChatGPT models
    { value: 'gpt-4o', label: 'GPT-4o', provider: 'ChatGPT' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini', provider: 'ChatGPT' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', provider: 'ChatGPT' },
    { value: 'gpt-4', label: 'GPT-4', provider: 'ChatGPT' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', provider: 'ChatGPT' },
    { value: 'o1', label: 'O1', provider: 'ChatGPT' },
    { value: 'o1-mini', label: 'O1 Mini', provider: 'ChatGPT' },
    { value: 'o1-pro', label: 'O1 Pro', provider: 'ChatGPT' },
    { value: 'o3-mini', label: 'O3 Mini', provider: 'ChatGPT' },
    { value: 'o3-mini-high', label: 'O3 Mini High', provider: 'ChatGPT' },
  ];

  // Generate code based on selections
  const generateCode = () => {
    if (selectedLanguage === 'python') {
      return `import requests

def chat(message, model="${selectedModel}"):
    response = requests.post(
        'http://localhost:8000/v1/chat/completions',
        json={
            "model": model,
            "messages": [{"role": "user", "content": message}]
        }
    )
    return response.json()['choices'][0]['message']['content']`;
    } else if (selectedLanguage === 'javascript') {
      return `async function chat(message, model = '${selectedModel}') {
  const response = await fetch('http://localhost:8000/v1/chat/completions', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      model: model,
      messages: [{role: 'user', content: message}]
    })
  });
  
  const data = await response.json();
  return data.choices[0].message.content;
}`;
    } else if (selectedLanguage === 'openai') {
      return `from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:8000/v1",
    api_key="not-needed"
)

response = client.chat.completions.create(
    model="${selectedModel}",
    messages=[{"role": "user", "content": "Hello"}]
)

print(response.choices[0].message.content)`;
    } else {
      return `curl http://localhost:8000/v1/chat/completions \\
-H "Content-Type: application/json" \\
-d '{"model": "${selectedModel}","messages": [{"role": "user", "content": "Hello"}]}'`;
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generateCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-sand-100 rounded-2xl p-8"
    >
      <div>
        <h3 className="text-gray-900 text-xl font-sans font-semibold mb-2">
          API Usage Examples
        </h3>
        <p className="text-gray-700 text-base mb-6">
          Copy and paste these examples to start using Spike in your applications
        </p>

        {/* Code block with controls */}
        <div className="bg-sand-200 rounded-2xl overflow-hidden border border-sand-300">
          {/* Header with dropdowns */}
          <div className="bg-sand-300 px-5 py-4 flex items-center justify-between gap-4 border-b border-sand-400">
            <div className="flex items-center gap-4">
              {/* Model selector */}
              <div className="relative min-w-[200px]">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-sand-100 hover:bg-sand-50 text-gray-900 text-sm font-medium px-4 py-2.5 pr-10 rounded-2xl border border-sand-400 focus:outline-none cursor-pointer transition-colors appearance-none"
                  style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23111827'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '1rem 1rem'
                  }}
                >
                  <optgroup label="Gemini Models">
                    {allModels.filter(m => m.provider === 'Gemini').map((model) => (
                      <option key={model.value} value={model.value}>
                        {model.label}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="ChatGPT Models">
                    {allModels.filter(m => m.provider === 'ChatGPT').map((model) => (
                      <option key={model.value} value={model.value}>
                        {model.label}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Language selector */}
              <div className="relative">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value as 'python' | 'javascript' | 'curl' | 'openai')}
                  className="bg-sand-100 hover:bg-sand-50 text-gray-900 text-sm font-medium px-4 py-2.5 pr-10 rounded-2xl border border-sand-400 focus:outline-none cursor-pointer transition-colors appearance-none"
                  style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23111827'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '1rem 1rem'
                  }}
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="openai">OpenAI Library</option>
                  <option value="curl">cURL</option>
                </select>
              </div>
            </div>

            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="bg-sand-100 hover:bg-sand-50 text-gray-900 text-sm font-medium px-4 py-2.5 rounded-2xl border border-sand-400 transition-colors"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* Code content */}
          <div className="p-5 overflow-x-auto bg-sand-50">
            <pre className="text-sm text-gray-900 font-mono leading-relaxed">
              <code>{generateCode()}</code>
            </pre>
          </div>
        </div>

        {/* Additional info */}
        <div className="mt-4 p-4 bg-sand-200 rounded-2xl border border-sand-300">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Note:</span> All requests go through the{' '}
            <span className="font-mono bg-sand-300 px-2 py-0.5 rounded">
              Unified Proxy (Port 8000)
            </span>{' '}
            which automatically routes to the correct AI provider based on the model name. No need to specify the provider!
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ApiExamples;
