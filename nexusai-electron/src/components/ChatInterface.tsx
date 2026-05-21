import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, User, Bot, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export type ChatEndpointId = 'local' | 'public' | 'gemini' | 'chatgpt';

interface ChatInterfaceProps {
  proxyUrl?: string;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  chatStarted: boolean;
  setChatStarted: React.Dispatch<React.SetStateAction<boolean>>;
  selectedProvider: string;
  setSelectedProvider: React.Dispatch<React.SetStateAction<string>>;
  selectedModel: string;
  setSelectedModel: React.Dispatch<React.SetStateAction<string>>;
  selectedEndpoint: ChatEndpointId;
  setSelectedEndpoint: React.Dispatch<React.SetStateAction<ChatEndpointId>>;
  tunnelUrl: string | null;
  // Service status for the indicator strip
  geminiRunning?: boolean;
  chatgptRunning?: boolean;
  proxyRunning?: boolean;
}

// ─── Model catalogue ─────────────────────────────────────────────────────────

interface ModelEntry {
  id: string;
  name: string;
  desc: string;
  provider: 'gemini' | 'chatgpt';
}

const ALL_MODELS: ModelEntry[] = [
  // Gemini
  { id: 'gemini-2.0-flash',  name: 'Gemini 2.0 Flash',  desc: 'Fast and capable — best for most tasks',   provider: 'gemini' },
  { id: 'gemini-3-flash',    name: 'Gemini 3 Flash',    desc: 'Latest generation, quick responses',        provider: 'gemini' },
  { id: 'gemini-3.1-flash',  name: 'Gemini 3.1 Flash',  desc: 'Smarter and faster, great all-rounder',    provider: 'gemini' },
  { id: 'gemini-3.1-pro',    name: 'Gemini 3.1 Pro',    desc: 'Most capable Gemini — complex reasoning',  provider: 'gemini' },
  // ChatGPT
  { id: 'gpt-4o-mini',       name: 'GPT-4o Mini',       desc: 'Fast and cheap — ideal for simple tasks',  provider: 'chatgpt' },
  { id: 'gpt-3.5-turbo',     name: 'GPT-3.5 Turbo',     desc: 'Fastest ChatGPT model',                    provider: 'chatgpt' },
  { id: 'gpt-4o',            name: 'GPT-4o',             desc: 'Latest flagship — smart and multimodal',   provider: 'chatgpt' },
  { id: 'gpt-4-turbo',       name: 'GPT-4 Turbo',       desc: 'High capability with large context',       provider: 'chatgpt' },
  { id: 'gpt-4',             name: 'GPT-4',              desc: 'Reliable and thorough',                    provider: 'chatgpt' },
  { id: 'o1',                name: 'O1',                 desc: 'Deep reasoning — slower but thorough',     provider: 'chatgpt' },
  { id: 'o1-mini',           name: 'O1 Mini',            desc: 'Compact reasoning model',                  provider: 'chatgpt' },
  { id: 'o3-mini',           name: 'O3 Mini',            desc: 'Latest reasoning — fast and smart',        provider: 'chatgpt' },
];

const GEMINI_MODELS  = ALL_MODELS.filter(m => m.provider === 'gemini');
const CHATGPT_MODELS = ALL_MODELS.filter(m => m.provider === 'chatgpt');

// ─── Endpoint catalogue ───────────────────────────────────────────────────────

interface EndpointEntry {
  id: ChatEndpointId;
  name: string;
  desc: string;
  forProvider?: 'gemini' | 'chatgpt';
}

// ─── Shared dropdown item ─────────────────────────────────────────────────────
// (used as a reference — rendering is now inline in GroupedModelList)

// Grouped model list used in both the pre-chat picker and the inline picker
const GroupedModelList = ({
  models,
  selectedModel,
  onSelect,
  forProvider,
  geminiRunning,
  chatgptRunning,
}: {
  models: ModelEntry[];
  selectedModel: string;
  onSelect: (id: string) => void;
  forProvider?: 'gemini' | 'chatgpt';
  geminiRunning: boolean;
  chatgptRunning: boolean;
}) => {
  const isModelAvailable = (m: ModelEntry) =>
    m.provider === 'gemini' ? geminiRunning : chatgptRunning;

  if (forProvider) {
    return (
      <>
        {models.map(m => {
          const available = isModelAvailable(m);
          return (
            <button
              key={m.id}
              onClick={() => available && onSelect(m.id)}
              className={`w-full text-left px-4 py-2.5 transition-colors ${
                m.id === selectedModel ? 'bg-sand-200' : available ? 'hover:bg-sand-100' : ''
              } ${!available ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <div className={`text-sm font-semibold ${available ? 'text-gray-900' : 'text-gray-400'}`}>{m.name}</div>
              <div className="text-[11px] mt-0.5 text-gray-400 leading-snug">{m.desc}</div>
            </button>
          );
        })}
      </>
    );
  }

  return (
    <>
      {/* Gemini section */}
      <div className={`px-4 pt-3 pb-1.5 flex items-center gap-2 ${!geminiRunning ? 'opacity-40' : ''}`}>
        <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Gemini</span>
        <span className="flex-1 h-px bg-sand-300" />
      </div>
      {GEMINI_MODELS.map(m => (
        <button
          key={m.id}
          onClick={() => geminiRunning && onSelect(m.id)}
          className={`w-full text-left px-4 py-2.5 transition-colors ${
            m.id === selectedModel ? 'bg-sand-200' : geminiRunning ? 'hover:bg-sand-100' : ''
          } ${!geminiRunning ? 'opacity-40 cursor-not-allowed' : ''}`}
        >
          <div className={`text-sm font-semibold ${geminiRunning ? 'text-gray-900' : 'text-gray-400'}`}>{m.name}</div>
          <div className="text-[11px] mt-0.5 text-gray-400 leading-snug">{m.desc}</div>
        </button>
      ))}

      {/* ChatGPT section */}
      <div className={`px-4 pt-3 pb-1.5 flex items-center gap-2 ${!chatgptRunning ? 'opacity-40' : ''}`}>
        <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">ChatGPT</span>
        <span className="flex-1 h-px bg-sand-300" />
      </div>
      {CHATGPT_MODELS.map(m => (
        <button
          key={m.id}
          onClick={() => chatgptRunning && onSelect(m.id)}
          className={`w-full text-left px-4 py-2.5 transition-colors ${
            m.id === selectedModel ? 'bg-sand-200' : chatgptRunning ? 'hover:bg-sand-100' : ''
          } ${!chatgptRunning ? 'opacity-40 cursor-not-allowed' : ''}`}
        >
          <div className={`text-sm font-semibold ${chatgptRunning ? 'text-gray-900' : 'text-gray-400'}`}>{m.name}</div>
          <div className="text-[11px] mt-0.5 text-gray-400 leading-snug">{m.desc}</div>
        </button>
      ))}
    </>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const ChatInterface = ({
  proxyUrl = 'http://localhost:8000',
  messages,
  setMessages,
  chatStarted,
  setChatStarted,
  selectedProvider,
  setSelectedProvider,
  selectedModel,
  setSelectedModel,
  selectedEndpoint,
  setSelectedEndpoint,
  tunnelUrl,
  geminiRunning = false,
  chatgptRunning = false,
  proxyRunning = false,
}: ChatInterfaceProps) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [endpointDropdownOpen, setEndpointDropdownOpen] = useState(false);
  const [inlineModelDropdownOpen, setInlineModelDropdownOpen] = useState(false);

  const messagesEndRef       = useRef<HTMLDivElement>(null);
  const inputRef             = useRef<HTMLTextAreaElement>(null);
  const modelDropdownRef     = useRef<HTMLDivElement>(null);
  const endpointDropdownRef  = useRef<HTMLDivElement>(null);
  const inlineModelDropdownRef = useRef<HTMLDivElement>(null);

  // Endpoint options with descriptions
  const endpointOptions: Array<EndpointEntry & { available: boolean }> = [
    {
      id: 'local',
      name: 'Local Proxy',
      desc: 'Routes through your machine — fastest, no internet needed',
      available: true,
    },
    {
      id: 'public',
      name: 'Public Proxy',
      desc: tunnelUrl ? 'Accessible from anywhere via the public ngrok tunnel' : 'Start the tunnel to enable',
      available: !!tunnelUrl,
    },
    {
      id: 'gemini',
      name: 'Gemini Direct',
      desc: 'Hits the Gemini bridge directly on port 6969',
      forProvider: 'gemini',
      available: true,
    },
    {
      id: 'chatgpt',
      name: 'ChatGPT Direct',
      desc: 'Hits the Chat2API bridge directly on port 5005',
      forProvider: 'chatgpt',
      available: true,
    },
  ];

  const currentEndpoint = endpointOptions.find(e => e.id === selectedEndpoint) || endpointOptions[0];

  // Models available for the current endpoint
  const currentModels: ModelEntry[] = (() => {
    if (currentEndpoint.forProvider === 'gemini')  return GEMINI_MODELS;
    if (currentEndpoint.forProvider === 'chatgpt') return CHATGPT_MODELS;
    return ALL_MODELS;
  })();

  const currentModelEntry = ALL_MODELS.find(m => m.id === selectedModel);

  // Map each endpoint to its live status
  const endpointLive: Record<ChatEndpointId, boolean> = {
    local:   proxyRunning,
    public:  !!tunnelUrl,
    gemini:  geminiRunning,
    chatgpt: chatgptRunning,
  };

  const resolveBaseUrl = (id: ChatEndpointId): string => {
    switch (id) {
      case 'public':  return tunnelUrl || proxyUrl;
      case 'gemini':  return 'http://localhost:6969';
      case 'chatgpt': return 'http://localhost:5005';
      default:        return proxyUrl;
    }
  };

  // Keep provider in sync with endpoint
  useEffect(() => {
    if (currentEndpoint.forProvider && currentEndpoint.forProvider !== selectedProvider) {
      setSelectedProvider(currentEndpoint.forProvider);
    }
    if (selectedEndpoint === 'public' && !tunnelUrl) {
      setSelectedEndpoint('local');
    }
  }, [selectedEndpoint, tunnelUrl, currentEndpoint.forProvider, selectedProvider, setSelectedEndpoint, setSelectedProvider]);

  // If selected model isn't valid for current endpoint, reset to first available
  useEffect(() => {
    if (currentModels.length > 0 && !currentModels.find(m => m.id === selectedModel)) {
      setSelectedModel(currentModels[0].id);
    }
  }, [currentModels, selectedModel, setSelectedModel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target as Node))
        setModelDropdownOpen(false);
      if (endpointDropdownRef.current && !endpointDropdownRef.current.contains(e.target as Node))
        setEndpointDropdownOpen(false);
      if (inlineModelDropdownRef.current && !inlineModelDropdownRef.current.contains(e.target as Node))
        setInlineModelDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const baseUrl = resolveBaseUrl(selectedEndpoint);
      const result = await window.electron.chatComplete({
        url: `${baseUrl}/v1/chat/completions`,
        authHeader: 'Bearer nexusai-default-auth-key',
        body: {
          model: selectedModel,
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage.content },
          ],
        },
      });

      if (!result.success) {
        const detail = result.body
          ? `${result.error || 'Request failed'}: ${result.body.slice(0, 300)}`
          : result.error || 'Request failed';
        throw new Error(detail);
      }

      const data = JSON.parse(result.body || '{}');
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.choices[0].message.content,
        timestamp: new Date(),
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please make sure the services are running.`,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStartChat = () => {
    setChatStarted(true);
    setTimeout(() => inputRef.current?.focus(), 300);
  };

  // ── Shared dropdown trigger style ──────────────────────────────────────────
  const triggerCls = "w-full bg-sand-50 text-gray-900 text-base font-medium h-[58px] px-5 rounded-xl border-2 border-transparent hover:border-sand-300 focus:border-sand-400 focus:outline-none transition-all cursor-pointer flex items-center justify-between gap-2 min-w-0";

  return (
    <div className="flex flex-col h-full">

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto mb-6">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-900 font-serif text-4xl mb-2">What can I do for you?</div>
              <div className="text-gray-600 text-base">
                {chatStarted ? 'Start a conversation to test your AI gateway' : 'Select your model to begin'}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            <AnimatePresence>
              {messages.map(message => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-sand-200 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-gray-900" />
                    </div>
                  )}
                  <div className={`max-w-[75%] rounded-2xl px-5 py-3 ${
                    message.role === 'user' ? 'bg-sand-300 text-gray-900' : 'bg-sand-100 text-gray-900'
                  }`}>
                    <div className="text-base leading-relaxed prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-900 prose-strong:text-gray-900 prose-code:text-gray-900 prose-pre:bg-sand-200 prose-pre:text-gray-900">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-sand-200 flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-4 h-4 text-gray-900" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-sand-200 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-gray-900" />
                </div>
                <div className="bg-sand-100 rounded-2xl px-5 py-3">
                  <Loader2 className="w-5 h-5 text-gray-700 animate-spin" />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ── Bottom bar ── */}
      <div className="max-w-4xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {!chatStarted ? (

            /* ── Pre-chat: model + endpoint pickers ── */
            <motion.div
              key="model-selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-sand-100 rounded-2xl p-6"
            >
              <div className="text-center mb-4">
                <h3 className="text-gray-900 font-semibold text-lg">Select your model</h3>
              </div>

              <div className="flex items-center gap-3">

                {/* Model picker — shows all models grouped */}
                <div ref={modelDropdownRef} className="flex-1 relative">
                  <button
                    onClick={() => { setModelDropdownOpen(!modelDropdownOpen); setEndpointDropdownOpen(false); }}
                    className={triggerCls}
                  >
                    <span className="truncate font-semibold text-gray-900 text-sm">
                      {currentModelEntry?.name ?? selectedModel}
                    </span>
                    <ChevronDown className={`w-5 h-5 shrink-0 transition-transform duration-200 ${modelDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {modelDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-full left-0 right-0 mb-2 bg-sand-50 rounded-xl border-2 border-sand-300 shadow-lg overflow-hidden z-10 max-h-72 overflow-y-auto"
                      >
                        <GroupedModelList
                          models={currentModels}
                          selectedModel={selectedModel}
                          onSelect={id => { setSelectedModel(id); setModelDropdownOpen(false); }}
                          forProvider={currentEndpoint.forProvider}
                          geminiRunning={geminiRunning}
                          chatgptRunning={chatgptRunning}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Endpoint picker */}
                <div ref={endpointDropdownRef} className="flex-1 relative">
                  <button
                    onClick={() => { setEndpointDropdownOpen(!endpointDropdownOpen); setModelDropdownOpen(false); }}
                    className={triggerCls}
                  >
                    <span className="truncate font-semibold text-gray-900 text-sm">
                      {currentEndpoint.name}
                    </span>
                    <ChevronDown className={`w-5 h-5 shrink-0 transition-transform duration-200 ${endpointDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {endpointDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-full left-0 right-0 mb-2 bg-sand-50 rounded-xl border-2 border-sand-300 shadow-lg overflow-hidden z-10"
                      >
                        {endpointOptions.map(opt => {
                          const live = endpointLive[opt.id];
                          const off = !opt.available || !live;
                          return (
                            <button
                              key={opt.id}
                              disabled={!opt.available}
                              onClick={() => { if (!opt.available) return; setSelectedEndpoint(opt.id); setEndpointDropdownOpen(false); }}
                              className={`w-full text-left px-4 py-3 transition-colors ${
                                selectedEndpoint === opt.id
                                  ? 'bg-sand-200'
                                  : !opt.available
                                    ? 'cursor-not-allowed'
                                    : 'hover:bg-sand-100'
                              } ${off ? 'opacity-50' : ''}`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                  <div className={`text-sm font-semibold ${off ? 'text-gray-400' : 'text-gray-900'}`}>{opt.name}</div>
                                  <div className="text-[11px] mt-0.5 text-gray-400 leading-snug">{opt.desc}</div>
                                </div>
                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${live && opt.available ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                              </div>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Send */}
                <button
                  onClick={handleStartChat}
                  className="bg-accent hover:bg-accent-hover text-white p-4 rounded-xl transition-all duration-150 hover:shadow-sm active:scale-[0.98] flex-shrink-0"
                >
                  <Send className="w-6 h-6" />
                </button>
              </div>
            </motion.div>

          ) : (

            /* ── Active chat: input bar ── */
            <motion.div
              key="chat-input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Inline strip: endpoint + model switchers */}
              <div className="flex items-center justify-between gap-3 mb-2 px-2 text-xs text-gray-500">

                {/* Endpoint switcher */}
                <div className="flex items-center gap-2 min-w-0">
                  <span>Hitting</span>
                  <div ref={endpointDropdownRef} className="relative">
                    <button
                      onClick={() => { setEndpointDropdownOpen(!endpointDropdownOpen); setInlineModelDropdownOpen(false); }}
                      className="flex items-center gap-1.5 text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      <span className="font-semibold text-gray-900">{currentEndpoint.name}</span>
                      <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${endpointDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {endpointDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute bottom-full left-0 mb-2 min-w-[300px] bg-sand-50 rounded-xl border-2 border-sand-300 shadow-lg overflow-hidden z-20"
                        >
                          {endpointOptions.map(opt => {
                            const live = endpointLive[opt.id];
                            const off = !opt.available || !live;
                            return (
                              <button
                                key={opt.id}
                                disabled={!opt.available}
                                onClick={() => { if (!opt.available) return; setSelectedEndpoint(opt.id); setEndpointDropdownOpen(false); }}
                                className={`w-full text-left px-4 py-3 transition-colors ${
                                  selectedEndpoint === opt.id
                                    ? 'bg-sand-200'
                                    : !opt.available
                                      ? 'cursor-not-allowed'
                                      : 'hover:bg-sand-100'
                                } ${off ? 'opacity-50' : ''}`}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className={`text-sm font-semibold ${off ? 'text-gray-400' : 'text-gray-900'}`}>{opt.name}</div>
                                    <div className="text-[11px] mt-0.5 text-gray-400 leading-snug">{opt.desc}</div>
                                  </div>
                                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${live && opt.available ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                                </div>
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Inline model switcher */}
                <div ref={inlineModelDropdownRef} className="relative">
                  <button
                    onClick={() => { setInlineModelDropdownOpen(!inlineModelDropdownOpen); setEndpointDropdownOpen(false); }}
                    className="flex items-center gap-1 font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <span className="truncate max-w-[180px]">{currentModelEntry?.name ?? selectedModel}</span>
                    <ChevronDown className={`w-3 h-3 shrink-0 transition-transform duration-200 ${inlineModelDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {inlineModelDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-full right-0 mb-2 min-w-[280px] max-h-80 overflow-y-auto bg-sand-50 rounded-xl border-2 border-sand-300 shadow-lg z-20"
                      >
                        <GroupedModelList
                          models={currentModels}
                          selectedModel={selectedModel}
                          onSelect={id => { setSelectedModel(id); setInlineModelDropdownOpen(false); }}
                          forProvider={currentEndpoint.forProvider}
                          geminiRunning={geminiRunning}
                          chatgptRunning={chatgptRunning}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Text input */}
              <div className="bg-sand-100 rounded-2xl p-1 flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  rows={1}
                  className="flex-1 bg-transparent text-gray-900 text-base px-4 py-3 focus:outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="bg-accent hover:bg-accent-hover disabled:bg-sand-300 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all duration-150 hover:shadow-sm active:scale-[0.98] disabled:active:scale-100 flex-shrink-0"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChatInterface;
