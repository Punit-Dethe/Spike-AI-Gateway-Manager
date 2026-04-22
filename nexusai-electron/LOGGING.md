# Logging System

Spike uses a structured, readable logging system designed to make debugging and troubleshooting easier for both developers and users.

## Log Format

Logs follow a consistent, hierarchical format with visual separators and color-coded levels:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[2026-04-22 10:30:45] SYSTEM          | Starting Application
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[2026-04-22 10:30:45] GEMINI          | INFO     → Server starting
  → Port: 6969
  → Working Directory: /path/to/services/gemini
[2026-04-22 10:30:46] GEMINI          | SUCCESS  ✓ Server started successfully
  → Endpoint: http://localhost:6969
```

## Log Levels

Each log entry includes a level indicator with a corresponding symbol:

- **INFO** (→): General information about operations
- **SUCCESS** (✓): Successful completion of operations
- **WARNING** (⚠): Potential issues that don't prevent operation
- **ERROR** (✗): Errors that prevent normal operation

## Color Coding

The Logs Viewer component displays logs with color coding for easy scanning:

- **Blue**: INFO messages and general information
- **Green**: SUCCESS messages
- **Yellow**: WARNING messages
- **Red**: ERROR messages
- **Purple**: Service names
- **Gray**: Timestamps and details

## Log Structure

### Headers
Headers mark the start of major operations:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[timestamp] SERVICE_NAME    | Operation Description
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Standard Log Lines
```
[timestamp] SERVICE_NAME    | LEVEL    SYMBOL Message
```

### Detail Lines
Additional context is provided with indented detail lines:
```
  → Key: Value
```

### Error Details
Errors include structured information:
```
[timestamp] SERVICE_NAME    | ERROR    ✗ Error description
  → Error Type: ModuleNotFoundError
  → Error Message: No module named 'fastapi'
  → Solution: Run: pip install -r requirements.txt
  Stack Trace:
    File "app.py", line 5, in <module>
    import fastapi
```

## Logging Functions

The main.js file provides several logging functions:

### `log(message, level, service)`
General-purpose logging function.
- `message`: The log message
- `level`: 'INFO', 'SUCCESS', 'WARNING', 'ERROR', 'HEADER', or 'SEPARATOR'
- `service`: Service name (defaults to 'SYSTEM')

### `logDetail(key, value, indent)`
Logs a key-value detail line.
- `key`: Detail name
- `value`: Detail value
- `indent`: Number of spaces to indent (default: 2)

### `logSuccess(message, service)`
Shorthand for success messages.

### `logError(message, service, error)`
Logs an error with optional error object for stack traces.
- `message`: Error description
- `service`: Service name
- `error`: Optional Error object

### `logWarning(message, service)`
Shorthand for warning messages.

## Log File Location

Logs are written to:
```
%APPDATA%/spike/logs/spike.log
```

On Windows, this typically resolves to:
```
C:\Users\<username>\AppData\Roaming\spike\logs\spike.log
```

## Viewing Logs

### In-App Logs Viewer
1. Click "Logs" in the sidebar
2. View color-coded, formatted logs
3. Use action buttons:
   - **Copy to Clipboard**: Copy all logs to clipboard
   - **Export Logs**: Save logs to a file
   - **Clear Logs**: Clear all logs (requires confirmation)

### Auto-Scroll
The logs viewer automatically scrolls to show new entries. If you scroll up to review older logs, auto-scroll is disabled. Click "Scroll to bottom" to re-enable it.

## Best Practices

### For Developers

1. **Use appropriate log levels**: Don't log errors as INFO
2. **Provide context**: Include relevant details with `logDetail()`
3. **Include solutions**: For errors, suggest how to fix them
4. **Use headers for major operations**: Makes logs easier to scan
5. **Log actionable information**: Users should understand what to do

### Example Usage

```javascript
// Starting a major operation
log('Starting Service', 'HEADER', 'GEMINI');
logDetail('Port', 6969);
logDetail('Working Directory', workingDir);

// Success
logSuccess('Service started successfully', 'GEMINI');
logDetail('Endpoint', 'http://localhost:6969');

// Warning
logWarning('Port already in use, attempting to kill process', 'GEMINI');

// Error with solution
logError('Missing Python module detected', 'GEMINI');
logDetail('Solution', 'Run: pip install -r requirements.txt');

// Error with exception
try {
  // operation
} catch (error) {
  logError('Failed to start service', 'GEMINI', error);
}
```

## Troubleshooting

### Logs Not Appearing
- Check that the logs directory exists and is writable
- Verify the log file path in the application settings
- Check console for any file system errors

### Logs Too Large
- Use the "Clear Logs" button to reset the log file
- Export logs before clearing if you need to keep them
- Consider implementing log rotation for production use

### Color Coding Not Working
- Ensure you're viewing logs in the in-app Logs Viewer
- Exported logs are plain text without color coding
- The log file itself contains plain text

## Future Enhancements

Potential improvements to the logging system:

- Log rotation (automatic archival of old logs)
- Log filtering by service or level
- Search functionality within logs
- Real-time log streaming with WebSocket
- Log level configuration (verbose, normal, quiet)
- Separate log files per service
