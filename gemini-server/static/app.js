// Spike - Web UI JavaScript

const API_BASE = 'http://localhost:6969';

// DOM Elements
const psidInput = document.getElementById('psid');
const psidtsInput = document.getElementById('psidts');
const saveTokensBtn = document.getElementById('save-tokens');
const checkStatusBtn = document.getElementById('check-status');
const clearTokensBtn = document.getElementById('clear-tokens');
const initClientBtn = document.getElementById('init-client');
const stopClientBtn = document.getElementById('stop-client');
const tokenMessage = document.getElementById('token-message');
const clientMessage = document.getElementById('client-message');

const serverIndicator = document.getElementById('server-indicator');
const tokensIndicator = document.getElementById('tokens-indicator');
const clientIndicator = document.getElementById('client-indicator');

const serverStatus = document.getElementById('server-status');
const tokensStatus = document.getElementById('tokens-status');
const clientStatus = document.getElementById('client-status');

const clientStatusIcon = document.getElementById('client-status-icon');
const clientStatusTitle = document.getElementById('client-status-title');
const clientStatusDesc = document.getElementById('client-status-desc');

const copyEndpointBtn = document.getElementById('copy-endpoint');
const testRequestBtn = document.getElementById('test-request');
const testPrompt = document.getElementById('test-prompt');
const testModel = document.getElementById('test-model');
const testResponse = document.getElementById('test-response');
const responseCard = document.getElementById('response-card');

// Show/Hide password toggles
const toggleBtns = document.querySelectorAll('.btn-toggle');
toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const input = document.getElementById(targetId);
        const eyeIcon = btn.querySelector('.eye-icon');
        const eyeOffIcon = btn.querySelector('.eye-off-icon');
        
        if (input.type === 'password') {
            input.type = 'text';
            eyeIcon.style.display = 'none';
            eyeOffIcon.style.display = 'block';
        } else {
            input.type = 'password';
            eyeIcon.style.display = 'block';
            eyeOffIcon.style.display = 'none';
        }
    });
});

// Sidebar Navigation
const sidebarBtns = document.querySelectorAll('.sidebar-btn');
const contentSections = document.querySelectorAll('.content-section');

sidebarBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const sectionId = btn.dataset.section;
        
        // Update active button
        sidebarBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update active section
        contentSections.forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${sectionId}-section`).classList.add('active');
    });
});

// Utility Functions
function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `message ${type} show`;
    setTimeout(() => {
        element.classList.remove('show');
    }, 5000);
}

function updateStatusIndicators(status) {
    // Server status (always running if we can fetch)
    serverIndicator.className = 'status-indicator active';
    serverStatus.textContent = 'Server Running';
    
    // Tokens status
    if (status.tokens_configured) {
        tokensIndicator.className = 'status-indicator active';
        tokensStatus.textContent = 'Tokens Configured';
    } else {
        tokensIndicator.className = 'status-indicator warning';
        tokensStatus.textContent = 'Tokens Not Configured';
    }
    
    // Client status
    if (status.client_initialized) {
        clientIndicator.className = 'status-indicator active';
        clientStatus.textContent = 'Client Ready';
    } else {
        clientIndicator.className = 'status-indicator error';
        clientStatus.textContent = 'Client Not Ready';
    }
    
    // Update client control section
    updateClientControlUI(status.client_initialized);
    
    // Update current mode display in Chat Test
    const modeDisplay = document.getElementById('current-mode-display');
    if (modeDisplay) {
        modeDisplay.textContent = status.temporary_mode 
            ? 'Temporary (no history)' 
            : 'History (saves chats)';
        modeDisplay.style.fontWeight = '600';
        modeDisplay.style.color = status.temporary_mode ? '#7d6b52' : '#5a8a5a';
    }
}

function updateClientControlUI(isInitialized) {
    if (isInitialized) {
        // Client is running
        clientStatusIcon.className = 'status-icon active';
        clientStatusIcon.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        `;
        clientStatusTitle.textContent = 'Client Running';
        clientStatusDesc.textContent = 'Connected to Gemini API and ready to use';
        
        initClientBtn.disabled = true;
        stopClientBtn.disabled = false;
    } else {
        // Client is stopped
        clientStatusIcon.className = 'status-icon error';
        clientStatusIcon.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
        `;
        clientStatusTitle.textContent = 'Client Not Initialized';
        clientStatusDesc.textContent = 'Initialize the client to start using the API';
        
        initClientBtn.disabled = false;
        stopClientBtn.disabled = true;
    }
}

async function fetchStatus() {
    try {
        const response = await fetch(`${API_BASE}/api/status`);
        const status = await response.json();
        updateStatusIndicators(status);
    } catch (error) {
        console.error('Failed to fetch status:', error);
        serverIndicator.className = 'status-indicator error';
        serverStatus.textContent = 'Server Error';
    }
}

// Event Handlers - Token Management
saveTokensBtn.addEventListener('click', async () => {
    const psid = psidInput.value.trim();
    const psidts = psidtsInput.value.trim();
    
    if (!psid || !psidts) {
        showMessage(tokenMessage, 'Please enter both tokens', 'error');
        return;
    }
    
    try {
        saveTokensBtn.disabled = true;
        saveTokensBtn.textContent = 'Saving...';
        
        const response = await fetch(`${API_BASE}/api/tokens`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ psid, psidts })
        });
        
        if (response.ok) {
            showMessage(tokenMessage, 'Tokens saved successfully!', 'success');
            await fetchStatus();
        } else {
            showMessage(tokenMessage, 'Failed to save tokens', 'error');
        }
    } catch (error) {
        showMessage(tokenMessage, `Error: ${error.message}`, 'error');
    } finally {
        saveTokensBtn.disabled = false;
        saveTokensBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            Save Tokens
        `;
    }
});

clearTokensBtn.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to clear all tokens? This will stop the client if running.')) {
        return;
    }
    
    try {
        clearTokensBtn.disabled = true;
        clearTokensBtn.textContent = 'Clearing...';
        
        const response = await fetch(`${API_BASE}/api/tokens`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showMessage(tokenMessage, 'Tokens cleared successfully!', 'success');
            psidInput.value = '';
            psidtsInput.value = '';
            await fetchStatus();
        } else {
            const errorData = await response.json();
            showMessage(tokenMessage, `Failed: ${errorData.detail || 'Unknown error'}`, 'error');
        }
    } catch (error) {
        showMessage(tokenMessage, `Error: ${error.message}`, 'error');
    } finally {
        clearTokensBtn.disabled = false;
        clearTokensBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Clear Tokens
        `;
    }
});

// Event Handlers - Client Control
initClientBtn.addEventListener('click', async () => {
    const temporaryMode = document.getElementById('server-temporary-mode').checked;
    
    try {
        initClientBtn.disabled = true;
        initClientBtn.textContent = 'Initializing...';
        
        const response = await fetch(`${API_BASE}/api/initialize?temporary_mode=${temporaryMode}`, {
            method: 'POST'
        });
        
        if (response.ok) {
            const data = await response.json();
            const modeText = temporaryMode ? 'TEMPORARY (no history)' : 'HISTORY (saves chats)';
            showMessage(clientMessage, `Client initialized in ${modeText} mode!`, 'success');
            await fetchStatus();
        } else {
            const error = await response.json();
            showMessage(clientMessage, `Failed: ${error.detail}`, 'error');
            initClientBtn.disabled = false;
        }
    } catch (error) {
        showMessage(clientMessage, `Error: ${error.message}`, 'error');
        initClientBtn.disabled = false;
    } finally {
        initClientBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            Initialize Client
        `;
    }
});

stopClientBtn.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to stop the client?')) {
        return;
    }
    
    try {
        stopClientBtn.disabled = true;
        stopClientBtn.textContent = 'Stopping...';
        
        // Call the stop endpoint
        const response = await fetch(`${API_BASE}/api/stop`, {
            method: 'POST'
        });
        
        if (response.ok) {
            showMessage(clientMessage, 'Client stopped successfully!', 'success');
            await fetchStatus();
        } else {
            const errorData = await response.json();
            showMessage(clientMessage, `Failed: ${errorData.detail || 'Unknown error'}`, 'error');
        }
    } catch (error) {
        showMessage(clientMessage, `Error: ${error.message}`, 'error');
    } finally {
        stopClientBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="6" y="6" width="12" height="12"></rect>
            </svg>
            Stop Client
        `;
    }
});

// Other Event Handlers
copyEndpointBtn.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText('http://localhost:6969/v1');
        
        // Visual feedback
        const originalHTML = copyEndpointBtn.innerHTML;
        copyEndpointBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        `;
        
        setTimeout(() => {
            copyEndpointBtn.innerHTML = originalHTML;
        }, 2000);
    } catch (error) {
        alert('Failed to copy to clipboard');
    }
});

testRequestBtn.addEventListener('click', async () => {
    const prompt = testPrompt.value.trim();
    const model = testModel.value;
    
    if (!prompt) {
        testResponse.textContent = 'Please enter a message';
        responseCard.style.display = 'block';
        return;
    }
    
    try {
        testRequestBtn.disabled = true;
        testRequestBtn.textContent = 'Sending...';
        testResponse.textContent = 'Waiting for response...';
        responseCard.style.display = 'block';

        const body = JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: prompt }]
        });

        // Retry the specific transient ngrok "failed to open private leg" 502.
        // It returns near-instantly, so a few quick retries cost almost nothing
        // and turn the intermittent failure into a non-event.
        const MAX_RETRIES = 3;
        const RETRY_DELAY_MS = 200;
        let response = null;
        let attempt = 0;

        while (true) {
            response = await fetch(`${API_BASE}/v1/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true',
                },
                body,
            });

            // Detect ngrok's "failed to open private leg" page so we only
            // retry that specific transient error, not real backend failures.
            const isTransient502 = response.status === 502;
            if (response.ok || !isTransient502 || attempt >= MAX_RETRIES) break;

            attempt += 1;
            testResponse.textContent = `Tunnel hiccup, retrying (${attempt}/${MAX_RETRIES})…`;
            await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
        }

        if (response.ok) {
            const data = await response.json();
            const content = data.choices[0].message.content;
            const temporaryMode = data.spike_metadata?.temporary_mode;
            const historyNote = temporaryMode 
                ? '\n\n💡 This chat was NOT saved to your Gemini history (server-wide temporary mode)'
                : '\n\n📝 This chat was saved to your Gemini history (server-wide history mode)';
            testResponse.textContent = `${content}\n\n---\nModel: ${data.model}\nTokens: ${data.usage.total_tokens}${historyNote}`;
        } else {
            // Try to parse error JSON; fall back to text for ngrok HTML pages.
            let detail;
            try {
                const error = await response.json();
                detail = error.detail || JSON.stringify(error);
            } catch {
                detail = `HTTP ${response.status}`;
            }
            testResponse.textContent = `Error: ${detail}`;
        }
    } catch (error) {
        testResponse.textContent = `Error: ${error.message}`;
    } finally {
        testRequestBtn.disabled = false;
        testRequestBtn.textContent = 'Send Message';
    }
});

// Initialize
async function loadSavedTokens() {
    try {
        const response = await fetch(`${API_BASE}/api/tokens`);
        const data = await response.json();
        
        // If tokens are configured, show a masked version in the fields
        if (data.configured) {
            // Show that tokens exist without revealing them
            psidInput.placeholder = `Token saved (${data.psid_length} characters)`;
            psidtsInput.placeholder = `Token saved (${data.psidts_length} characters)`;
            console.log('✓ Saved tokens detected');
        }
    } catch (error) {
        console.error('Failed to load saved tokens:', error);
    }
}

loadSavedTokens();
fetchStatus();
setInterval(fetchStatus, 5000); // Update status every 5 seconds

// Show welcome message on first load
if (!localStorage.getItem('spike_visited')) {
    localStorage.setItem('spike_visited', 'true');
    setTimeout(() => {
        // Switch to guide section
        sidebarBtns.forEach(btn => {
            if (btn.dataset.section === 'guide') {
                btn.click();
            }
        });
    }, 500);
}
