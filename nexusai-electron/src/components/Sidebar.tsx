import { Home, FileText, Activity, MessageSquare, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import hedgehogIcon from '../assets/hedgehog.png';
import hedgehogVideo from '../assets/icons8-hedgehog-ezgif_com-gif-to.webm?url';

type Tab = 'chat' | 'dashboard' | 'services' | 'logs';

interface SidebarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onNewChat: () => void;
  chatStarted: boolean;
}

// Animated Logo Component
const AnimatedLogo = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [useVideo, setUseVideo] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !useVideo) return;

    // Function to play animation
    const playAnimation = () => {
      if (isPlaying) return;
      
      setIsPlaying(true);
      video.currentTime = 0;
      video.play().catch(() => {
        // If video fails to play, fallback to static image
        setUseVideo(false);
      });
    };

    // Function to handle video end
    const handleVideoEnd = () => {
      setIsPlaying(false);
      // Pause on last frame
      video.pause();
    };

    // Add event listener
    video.addEventListener('ended', handleVideoEnd);

    // Play animation every 7 seconds
    intervalRef.current = setInterval(playAnimation, 7000);
    
    // Play once on mount after a short delay
    const initialTimeout = setTimeout(playAnimation, 500);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      clearTimeout(initialTimeout);
      video.removeEventListener('ended', handleVideoEnd);
    };
  }, [useVideo]);

  // Try to load video, fallback to image if it fails
  if (useVideo) {
    return (
      <video
        ref={videoRef}
        className="w-10 h-10"
        muted
        playsInline
        preload="auto"
        onError={() => setUseVideo(false)}
      >
        <source src={hedgehogVideo} type="video/webm" />
      </video>
    );
  }

  // Fallback to static image
  return <img src={hedgehogIcon} alt="Logo" className="w-10 h-10" />;
};

const Sidebar = ({ activeTab, onTabChange, onNewChat, chatStarted }: SidebarProps) => {
  const handleChatClick = () => {
    onTabChange('chat');
  };

  const handleNewChatClick = () => {
    onNewChat();
    onTabChange('chat');
  };

  return (
    <div className="w-56 bg-sand-200 flex flex-col" style={{ marginTop: '32px', height: 'calc(100vh - 32px)' }}>
      {/* Logo */}
      <div className="p-5">
        <div className="flex items-center justify-center gap-3">
          <AnimatedLogo />
          <span className="font-sans font-semibold text-xl text-gray-900">Spike</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <div className="space-y-1">
          {/* Chat Button with New Chat Option */}
          <div>
            <button
              onClick={handleChatClick}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-base font-medium rounded-2xl transition-all duration-150 ${
                activeTab === 'chat'
                  ? 'text-gray-900 bg-sand-100'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-sand-100/50 active:bg-sand-100'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Chat
            </button>

            {/* New Chat Option - Shows when chat is active and started */}
            <AnimatePresence>
              {activeTab === 'chat' && chatStarted && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  onClick={handleNewChatClick}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 pl-9 text-sm font-medium rounded-2xl text-gray-700 hover:text-accent transition-colors duration-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Chat
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          
          <button
            onClick={() => {
              onTabChange('dashboard');
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-base font-medium rounded-2xl transition-all duration-150 ${
              activeTab === 'dashboard'
                ? 'text-gray-900 bg-sand-100'
                : 'text-gray-700 hover:text-gray-900 hover:bg-sand-100/50 active:bg-sand-100'
            }`}
          >
            <Home className="w-4 h-4" />
            Dashboard
          </button>
          
          <button
            onClick={() => {
              onTabChange('services');
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-base font-medium rounded-2xl transition-all duration-150 ${
              activeTab === 'services'
                ? 'text-gray-900 bg-sand-100'
                : 'text-gray-700 hover:text-gray-900 hover:bg-sand-100/50 active:bg-sand-100'
            }`}
          >
            <Activity className="w-4 h-4" />
            Services
          </button>
          
          <button
            onClick={() => {
              onTabChange('logs');
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-base font-medium rounded-2xl transition-all duration-150 ${
              activeTab === 'logs'
                ? 'text-gray-900 bg-sand-100'
                : 'text-gray-700 hover:text-gray-900 hover:bg-sand-100/50 active:bg-sand-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            Logs
          </button>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4">
        <div className="text-xs text-gray-600">
          Version 1.0.0
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
