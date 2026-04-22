const TitleBar = () => {
  const handleMinimize = () => {
    window.electron.windowMinimize();
  };

  const handleMaximize = () => {
    window.electron.windowMaximize();
  };

  const handleClose = () => {
    window.electron.windowClose();
  };

  return (
    <div 
      className="h-8 bg-sand-200 flex items-center justify-end px-3 select-none"
      style={{ 
        WebkitAppRegion: 'drag',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999
      } as React.CSSProperties}
    >
      {/* macOS-style window controls - positioned on the right */}
      <div 
        className="flex items-center gap-2"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {/* Minimize button - Muted amber/gold on hover */}
        <button
          onClick={handleMinimize}
          className="w-3 h-3 rounded-full bg-sand-300 transition-colors duration-150"
          style={{
            backgroundColor: 'var(--btn-bg, #D4CFC1)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.setProperty('--btn-bg', '#D97706')}
          onMouseLeave={(e) => e.currentTarget.style.setProperty('--btn-bg', '#D4CFC1')}
          aria-label="Minimize"
        />
        
        {/* Maximize button - Muted emerald on hover */}
        <button
          onClick={handleMaximize}
          className="w-3 h-3 rounded-full bg-sand-300 transition-colors duration-150"
          style={{
            backgroundColor: 'var(--btn-bg, #D4CFC1)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.setProperty('--btn-bg', '#059669')}
          onMouseLeave={(e) => e.currentTarget.style.setProperty('--btn-bg', '#D4CFC1')}
          aria-label="Maximize"
        />
        
        {/* Close button - Muted rose/red on hover */}
        <button
          onClick={handleClose}
          className="w-3 h-3 rounded-full bg-sand-300 transition-colors duration-150"
          style={{
            backgroundColor: 'var(--btn-bg, #D4CFC1)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.setProperty('--btn-bg', '#DC2626')}
          onMouseLeave={(e) => e.currentTarget.style.setProperty('--btn-bg', '#D4CFC1')}
          aria-label="Close"
        />
      </div>
    </div>
  );
};

export default TitleBar;
