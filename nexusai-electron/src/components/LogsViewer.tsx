import { useState, useEffect, useRef } from 'react';
import { Download, Copy, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const LogsViewer = () => {
  const [logs, setLogs] = useState<string>('Loading logs...');
  const [copySuccess, setCopySuccess] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    // Load initial logs
    loadLogs();

    // Listen for new log entries
    window.electron.onServiceLog((data: any) => {
      setLogs(prev => {
        const newLog = `[${data.timestamp}] [${data.service}] ${data.message}`;
        return prev + '\n' + newLog;
      });
    });

    return () => {
      window.electron.removeServiceLogListener();
    };
  }, []);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  // Detect manual scroll
  const handleScroll = () => {
    if (logsContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = logsContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setAutoScroll(isAtBottom);
    }
  };

  const loadLogs = async () => {
    try {
      const result = await window.electron.getLogs();
      if (result.success) {
        setLogs(result.logs || 'No logs available');
      } else {
        setLogs('Failed to load logs: ' + result.message);
      }
    } catch (error) {
      setLogs('Error loading logs: ' + error);
    }
  };

  const handleCopyLogs = async () => {
    try {
      await navigator.clipboard.writeText(logs);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy logs:', error);
    }
  };

  const handleExportLogs = async () => {
    try {
      const result = await window.electron.exportLogs();
      if (result.success) {
        alert(`Logs exported successfully to:\n${result.path}`);
      } else {
        alert('Failed to export logs: ' + result.message);
      }
    } catch (error) {
      alert('Error exporting logs: ' + error);
    }
  };

  const handleClearLogs = async () => {
    if (confirm('Are you sure you want to clear all logs? This action cannot be undone.')) {
      try {
        const result = await window.electron.clearLogs();
        if (result.success) {
          setLogs('Logs cleared');
          loadLogs();
        } else {
          alert('Failed to clear logs: ' + result.message);
        }
      } catch (error) {
        alert('Error clearing logs: ' + error);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col"
    >
      {/* Action Buttons */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={handleCopyLogs}
          className="flex items-center gap-2 bg-sand-300 hover:bg-sand-400 text-gray-900 font-medium px-4 py-2 rounded-xl transition-all duration-150 hover:shadow-sm active:scale-[0.98]"
        >
          <Copy className="w-4 h-4" />
          {copySuccess ? 'Copied!' : 'Copy to Clipboard'}
        </button>

        <button
          onClick={handleExportLogs}
          className="flex items-center gap-2 bg-sand-300 hover:bg-sand-400 text-gray-900 font-medium px-4 py-2 rounded-xl transition-all duration-150 hover:shadow-sm active:scale-[0.98]"
        >
          <Download className="w-4 h-4" />
          Export Logs
        </button>

        <button
          onClick={handleClearLogs}
          className="flex items-center gap-2 bg-sand-300 hover:bg-sand-400 text-gray-900 font-medium px-4 py-2 rounded-xl transition-all duration-150 hover:shadow-sm active:scale-[0.98]"
        >
          <Trash2 className="w-4 h-4" />
          Clear Logs
        </button>
      </div>

      {/* Logs Display */}
      <div 
        ref={logsContainerRef}
        onScroll={handleScroll}
        className="flex-1 bg-sand-200 rounded-2xl p-4 overflow-y-auto font-mono text-sm text-gray-900 whitespace-pre-wrap break-words"
        style={{ minHeight: '400px' }}
      >
        {logs}
        <div ref={logsEndRef} />
      </div>

      {/* Auto-scroll indicator */}
      {!autoScroll && (
        <div className="mt-2 text-center">
          <button
            onClick={() => {
              setAutoScroll(true);
              logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            Scroll to bottom
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default LogsViewer;
