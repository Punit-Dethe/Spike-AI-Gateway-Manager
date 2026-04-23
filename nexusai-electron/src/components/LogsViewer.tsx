import { useState, useEffect, useRef } from 'react';
import { Download, Copy, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ParsedLogLine {
  type: 'separator' | 'header' | 'log' | 'detail' | 'plain';
  timestamp?: string;
  service?: string;
  level?: string;
  symbol?: string;
  message?: string;
  key?: string;
  value?: string;
  raw?: string;
}

const LogsViewer = () => {
  const [logs, setLogs] = useState<string>('Loading logs...');
  const [copySuccess, setCopySuccess] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    // Load initial logs
    loadLogs();

    // Reload logs every 2 seconds for updates
    const interval = setInterval(() => {
      loadLogs();
    }, 2000);

    return () => {
      clearInterval(interval);
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

  // Parse log lines into structured format
  const parseLogLine = (line: string): ParsedLogLine => {
    // Check for separator line
    if (line.trim().match(/^━+$/)) {
      return { type: 'separator' };
    }

    // Check for header line (has timestamp and service but no level)
    const headerMatch = line.match(/^\[([^\]]+)\]\s+([A-Z\s]+)\s+\|\s+(.+)$/);
    if (headerMatch && !headerMatch[3].includes('│') && !headerMatch[3].match(/^(SUCCESS|ERROR|WARNING|INFO)/)) {
      return {
        type: 'header',
        timestamp: headerMatch[1],
        service: headerMatch[2].trim(),
        message: headerMatch[3]
      };
    }

    // Check for standard log line with level and symbol
    const logMatch = line.match(/^\[([^\]]+)\]\s+([A-Z\s]+)\s+\|\s+([A-Z\s]+)\s+([✓✗⚠→])\s+(.+)$/);
    if (logMatch) {
      return {
        type: 'log',
        timestamp: logMatch[1],
        service: logMatch[2].trim(),
        level: logMatch[3].trim(),
        symbol: logMatch[4],
        message: logMatch[5]
      };
    }

    // Check for log line without symbol (Chat2API format with extra timestamp)
    // Format: [timestamp] SERVICE | LEVEL → timestamp | LEVEL | message
    const chat2apiLogMatch = line.match(/^\[([^\]]+)\]\s+([A-Z\s]+)\s+\|\s+([A-Z\s]+)\s+→\s+[\d\-:\s,]+\s+\|\s+([A-Z]+)\s+\|\s+(.+)$/);
    if (chat2apiLogMatch) {
      return {
        type: 'log',
        timestamp: chat2apiLogMatch[1],
        service: chat2apiLogMatch[2].trim(),
        level: chat2apiLogMatch[4], // Use the second level indicator (from Chat2API itself)
        symbol: '→',
        message: chat2apiLogMatch[5]
      };
    }

    // Check for log line without symbol (simple format)
    const simpleLogMatch = line.match(/^\[([^\]]+)\]\s+([A-Z\s]+)\s+\|\s+([A-Z\s]+)\s+→\s+(.+)$/);
    if (simpleLogMatch) {
      return {
        type: 'log',
        timestamp: simpleLogMatch[1],
        service: simpleLogMatch[2].trim(),
        level: simpleLogMatch[3].trim(),
        symbol: '→',
        message: simpleLogMatch[4]
      };
    }

    // Check for detail line (indented with arrow)
    const detailMatch = line.match(/^\s+→\s+([^:]+):\s+(.+)$/);
    if (detailMatch) {
      return {
        type: 'detail',
        key: detailMatch[1],
        value: detailMatch[2]
      };
    }

    // Plain text line
    return { type: 'plain', raw: line };
  };

  // Render a single parsed log line with colors
  const renderLogLine = (parsed: ParsedLogLine, index: number) => {
    switch (parsed.type) {
      case 'separator':
        return (
          <div key={index} className="text-gray-400 my-1">
            {'━'.repeat(80)}
          </div>
        );

      case 'header':
        return (
          <div key={index} className="font-bold text-blue-700 my-2">
            <span className="text-gray-500">[{parsed.timestamp}]</span>{' '}
            <span className="text-amber-900">{parsed.service}</span> | {parsed.message}
          </div>
        );

      case 'log':
        let levelColor = 'text-blue-600';
        let symbolColor = 'text-blue-600';
        
        if (parsed.level === 'SUCCESS') {
          levelColor = 'text-green-600 font-semibold';
          symbolColor = 'text-green-600';
        } else if (parsed.level === 'ERROR') {
          levelColor = 'text-red-600 font-semibold';
          symbolColor = 'text-red-600';
        } else if (parsed.level === 'WARNING') {
          levelColor = 'text-yellow-600 font-semibold';
          symbolColor = 'text-yellow-600';
        }

        return (
          <div key={index} className="my-0.5">
            <span className="text-gray-500">[{parsed.timestamp}]</span>{' '}
            <span className="text-amber-900">{parsed.service}</span> |{' '}
            <span className={levelColor}>{parsed.level}</span>{' '}
            <span className={symbolColor}>{parsed.symbol}</span>{' '}
            <span className="text-gray-900">{parsed.message}</span>
          </div>
        );

      case 'detail':
        return (
          <div key={index} className="ml-4 text-gray-700">
            <span className="text-blue-500">→</span>{' '}
            <span className="text-gray-600 font-medium">{parsed.key}:</span>{' '}
            <span className="text-gray-800">{parsed.value}</span>
          </div>
        );

      case 'plain':
      default:
        return (
          <div key={index} className="text-gray-800">
            {parsed.raw}
          </div>
        );
    }
  };

  // Parse and render all logs
  const renderLogs = () => {
    const lines = logs.split('\n');
    return lines.map((line, index) => {
      const parsed = parseLogLine(line);
      return renderLogLine(parsed, index);
    });
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
        className="flex-1 bg-sand-200 rounded-2xl p-4 overflow-y-auto font-mono text-sm whitespace-pre-wrap break-words"
        style={{ minHeight: '400px' }}
      >
        {renderLogs()}
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
