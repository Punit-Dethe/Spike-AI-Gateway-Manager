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
}

const ChatInterface = ({ 
  proxyUrl = 'http://localhost:8000',
  messages,
  setMessages,
  chatStarted,
  setChatStarted,
  selectedProvider,
  setSelectedProvider,
  selectedModel,
  setSelectedModel
}: ChatInterfaceProps) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [providerDropdownOpen, setProviderDropdownOpen] = useState(false);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const providerDropdownRef = useRef<HTMLDivElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);

  const providers = [
    {
      id: 'gemini',
      name: 'Gemini',
      models: [
        { id: 'gemini-3-flash', name: 'Gemini 3 Flash' },
        { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
        { id: 'gemini-3.1-flash', name: 'Gemini 3.1 Flash' },
        { id: 'gemini-3.1-pro', name: 'Gemini 3.1 Pro' },
      ],
    },
    {
      id: 'chatgpt',
      name: 'ChatGPT',
      models: [
        { id: 'gpt-4o', name: 'GPT-4o' },
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
        { id: 'gpt-4', name: 'GPT-4' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
        { id: 'o1', name: 'O1' },
        { id: 'o1-mini', name: 'O1 Mini' },
        { id: 'o1-pro', name: 'O1 Pro' },
        { id: 'o3-mini', name: 'O3 Mini' },
        { id: 'o3-mini-high', name: 'O3 Mini High' },
      ],
    },
  ];

  const currentProvider = providers.find(p => p.id === selectedProvider);
  const currentModels = currentProvider?.models || [];

  useEffect(() => {
    // Update selected model when provider changes
    if (currentModels.length > 0 && !currentModels.find(m => m.id === selectedModel)) {
      setSelectedModel(currentModels[0].id);
    }
  }, [selectedProvider, currentModels, selectedModel]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (providerDropdownRef.current && !providerDropdownRef.current.contains(event.target as Node)) {
        setProviderDropdownOpen(false);
      }
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
        setModelDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
      console.log('Sending request to:', `${proxyUrl}/v1/chat/completions`);
      console.log('Model:', selectedModel);
      console.log('Messages:', [...messages.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: userMessage.content }]);

      const response = await fetch(`${proxyUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer nexusai-default-auth-key',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage.content },
          ],
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.choices[0].message.content,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please make sure the services are running.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
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
    // Focus input after animation completes
    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area - Blends with background, takes full height */}
      <div className="flex-1 overflow-y-auto mb-6">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-900 font-serif text-4xl mb-2">
                What can I do for you?
              </div>
              <div className="text-gray-600 text-base">
                {chatStarted ? 'Start a conversation to test your AI gateway' : 'Select your model to begin'}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            <AnimatePresence>
              {messages.map((message) => (
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
                  
                  <div
                    className={`max-w-[75%] rounded-2xl px-5 py-3 ${
                      message.role === 'user'
                        ? 'bg-sand-300 text-gray-900'
                        : 'bg-sand-100 text-gray-900'
                    }`}
                  >
                    <div className="text-base leading-relaxed prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-900 prose-strong:text-gray-900 prose-code:text-gray-900 prose-pre:bg-sand-200 prose-pre:text-gray-900">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                      >
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
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
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

      {/* Bottom Area - Model Selection OR Input Bar */}
      <div className="max-w-4xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {!chatStarted ? (
            /* Model Selection Interface */
            <motion.div
              key="model-selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-sand-100 rounded-2xl p-6"
            >
              <div className="text-center mb-4">
                <h3 className="text-gray-900 font-semibold text-lg">
                  Select your model
                </h3>
              </div>

              <div className="flex items-center gap-3">
                {/* Provider Dropdown */}
                <div ref={providerDropdownRef} className="flex-1 relative">
                  <button
                    onClick={() => {
                      setProviderDropdownOpen(!providerDropdownOpen);
                      setModelDropdownOpen(false);
                    }}
                    className="w-full bg-sand-50 text-gray-900 text-lg font-medium px-5 py-4 rounded-xl border-2 border-transparent hover:border-sand-300 focus:border-sand-400 focus:outline-none transition-all cursor-pointer flex items-center justify-between"
                  >
                    <span>{providers.find(p => p.id === selectedProvider)?.name}</span>
                    <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${providerDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {providerDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-full left-0 right-0 mb-2 bg-sand-50 rounded-xl border-2 border-sand-300 shadow-lg overflow-hidden z-10"
                      >
                        {providers.map((provider) => (
                          <button
                            key={provider.id}
                            onClick={() => {
                              setSelectedProvider(provider.id);
                              setProviderDropdownOpen(false);
                            }}
                            className={`w-full text-left px-5 py-4 text-lg font-medium transition-colors ${
                              selectedProvider === provider.id
                                ? 'bg-sand-200 text-gray-900'
                                : 'text-gray-700 hover:bg-sand-100 hover:text-gray-900'
                            }`}
                          >
                            {provider.name}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Model Dropdown - Fades in after provider selected */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  ref={modelDropdownRef}
                  className="flex-1 relative"
                >
                  <button
                    onClick={() => {
                      setModelDropdownOpen(!modelDropdownOpen);
                      setProviderDropdownOpen(false);
                    }}
                    className="w-full bg-sand-50 text-gray-900 text-lg font-medium px-5 py-4 rounded-xl border-2 border-transparent hover:border-sand-300 focus:border-sand-400 focus:outline-none transition-all cursor-pointer flex items-center justify-between"
                  >
                    <span>{currentModels.find(m => m.id === selectedModel)?.name}</span>
                    <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${modelDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {modelDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-full left-0 right-0 mb-2 bg-sand-50 rounded-xl border-2 border-sand-300 shadow-lg overflow-hidden z-10 max-h-64 overflow-y-auto"
                      >
                        {currentModels.map((model) => (
                          <button
                            key={model.id}
                            onClick={() => {
                              setSelectedModel(model.id);
                              setModelDropdownOpen(false);
                            }}
                            className={`w-full text-left px-5 py-4 text-lg font-medium transition-colors ${
                              selectedModel === model.id
                                ? 'bg-sand-200 text-gray-900'
                                : 'text-gray-700 hover:bg-sand-100 hover:text-gray-900'
                            }`}
                          >
                            {model.name}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Enter Button */}
                <button
                  onClick={handleStartChat}
                  className="bg-accent hover:bg-accent-hover active:bg-accent-hover text-white p-4 rounded-xl transition-all duration-150 hover:shadow-sm active:scale-[0.98] flex-shrink-0"
                >
                  <Send className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          ) : (
            /* Chat Input Bar */
            <motion.div
              key="chat-input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-sand-100 rounded-2xl p-1 flex gap-2 items-end"
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
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
                className="bg-accent hover:bg-accent-hover active:bg-accent-hover disabled:bg-sand-300 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all duration-150 hover:shadow-sm active:scale-[0.98] disabled:active:scale-100 flex-shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChatInterface;
