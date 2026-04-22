# Spike API Documentation

## Overview

Spike transforms browser-based AI services (ChatGPT, Google Gemini) into standard OpenAI-compatible REST APIs that you can use in your projects. No API keys required - just your browser session tokens.

## Why Use Spike?

- **Free AI Access**: Use ChatGPT and Gemini without paying for API access
- **Standard API Format**: OpenAI-compatible endpoints work with existing tools
- **Local & Private**: Everything runs on your machine
- **Multiple Providers**: Switch between AI providers seamlessly
- **Perfect for Projects**: Ideal for student projects, prototypes, and personal applications

---

## Quick Model Reference

### Gemini Models
```
gemini-3-flash      → Fastest, general use
gemini-2.0-flash    → Balanced speed/quality
gemini-3.1-flash    → Enhanced performance
gemini-3.1-pro      → Best quality, complex tasks
```

### ChatGPT Models
```
gpt-4o              → Latest, most capable
gpt-4o-mini         → Fast, cost-effective
gpt-4-turbo         → High performance
gpt-4               → Complex reasoning
gpt-3.5-turbo       → Fast, general use
o1                  → Advanced reasoning
o1-mini             → Efficient reasoning
o1-pro              → Professional tasks
o3-mini             → Latest mini model
o3-mini-high        → Enhanced mini model
```

---

## How It Works

### Automatic Provider Routing

Spike's Unified Proxy automatically routes your requests to the correct AI provider based on the model name. **You don't need to specify the provider** - just use the model name!

```python
# This automatically goes to ChatGPT
response = requests.post('http://localhost:8000/v1/chat/completions', json={
    "model": "gpt-4o",  # Starts with "gpt-" → routes to ChatGPT
    "messages": [{"role": "user", "content": "Hello!"}]
})

# This automatically goes to Gemini
response = requests.post('http://localhost:8000/v1/chat/completions', json={
    "model": "gemini-3-flash",  # Starts with "gemini" → routes to Gemini
    "messages": [{"role": "user", "content": "Hello!"}]
})
```

### Routing Rules

The proxy uses these simple rules:

| Model Name Pattern | Routes To | Examples |
|-------------------|-----------|----------|
| Starts with `gpt-` | ChatGPT | `gpt-4o`, `gpt-4`, `gpt-3.5-turbo` |
| Starts with `o1` or `o3` | ChatGPT | `o1`, `o1-mini`, `o3-mini` |
| Starts with `gemini` | Gemini | `gemini-3-flash`, `gemini-2.0-flash` |

**That's it!** No need to configure endpoints or specify providers. The model name tells Spike everything it needs to know.

---

### 1. Start Spike Services

1. Launch Spike application
2. Go to **Services** tab
3. Configure your tokens (see [Token Setup](#token-setup))
4. Click **Start Services** on the Dashboard

### 2. Verify Services are Running

Check that services show **green status** in the Dashboard:
- ✅ Unified Proxy (Port 8000)
- ✅ Gemini Bridge (Port 6969) or Chat2API (Port 5005)

### 3. Make Your First API Call

```bash
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-2.0-flash",
    "messages": [
      {"role": "user", "content": "Hello! How are you?"}
    ]
  }'
```

### 4. Switch Providers Instantly

Want to try ChatGPT instead? Just change the model name:

```bash
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [
      {"role": "user", "content": "Hello! How are you?"}
    ]
  }'
```

**That's it!** Same endpoint, different model = different provider. No configuration needed.

---

## API Endpoints

### Base URL

```
http://localhost:8000
```

All requests go through the Unified Proxy, which routes to the appropriate AI provider.

### Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/chat/completions` | POST | Send chat messages and get AI responses |
| `/v1/models` | GET | List available AI models |

---

## Chat Completions API

### Endpoint

```
POST http://localhost:8000/v1/chat/completions
```

### Request Format

```json
{
  "model": "gemini-2.0-flash",
  "messages": [
    {
      "role": "user",
      "content": "Your message here"
    }
  ],
  "stream": false,
  "temperature": 0.7,
  "max_tokens": 2000
}
```

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | string | Yes | AI model to use (see [Available Models](#available-models)) |
| `messages` | array | Yes | Array of message objects with `role` and `content` |
| `stream` | boolean | No | Enable streaming responses (default: false) |
| `temperature` | number | No | Randomness (0.0-2.0, default: 0.7) |
| `max_tokens` | number | No | Maximum response length (default: 2000) |

### Message Roles

- `system`: System instructions (optional)
- `user`: User messages
- `assistant`: AI responses (for conversation history)

### Response Format

```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "gemini-2.0-flash",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! I'm doing well, thank you for asking. How can I help you today?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 20,
    "total_tokens": 30
  }
}
```

---

## Available Models

### Google Gemini Models

| Model ID | Description | Best For |
|----------|-------------|----------|
| `gemini-3-flash` | Latest Gemini Flash model | Fast responses, general use |
| `gemini-2.0-flash` | Gemini 2.0 Flash | Balanced speed and quality |
| `gemini-3.1-flash` | Gemini 3.1 Flash | Enhanced performance |
| `gemini-3.1-pro` | Gemini 3.1 Pro | Most capable, complex tasks |

**Example:**
```json
{
  "model": "gemini-3-flash",
  "messages": [{"role": "user", "content": "Hello!"}]
}
```

### ChatGPT Models

| Model ID | Description | Best For |
|----------|-------------|----------|
| `gpt-4o` | GPT-4 Optimized | Latest, most capable |
| `gpt-4o-mini` | GPT-4o Mini | Fast, cost-effective |
| `gpt-4-turbo` | GPT-4 Turbo | High performance |
| `gpt-4` | GPT-4 | Complex reasoning |
| `gpt-3.5-turbo` | GPT-3.5 Turbo | Fast, general use |
| `o1` | O1 | Advanced reasoning |
| `o1-mini` | O1 Mini | Efficient reasoning |
| `o1-pro` | O1 Pro | Professional tasks |
| `o3-mini` | O3 Mini | Latest mini model |
| `o3-mini-high` | O3 Mini High | Enhanced mini model |

**Example:**
```json
{
  "model": "gpt-4o",
  "messages": [{"role": "user", "content": "Explain quantum computing"}]
}
```

### Choosing the Right Model

**For Speed:**
- `gemini-3-flash` - Fastest Gemini
- `gpt-4o-mini` - Fastest GPT

**For Quality:**
- `gemini-3.1-pro` - Best Gemini
- `gpt-4o` - Best GPT

**For Reasoning:**
- `o1` or `o1-pro` - Advanced reasoning tasks
- `gemini-3.1-pro` - Complex analysis

**For General Use:**
- `gemini-2.0-flash` - Good balance
- `gpt-3.5-turbo` - Fast and reliable

---

## Model-Specific Examples

### Using Different Gemini Models

```python
import requests

url = "http://localhost:8000/v1/chat/completions"

# Fast responses with Gemini 3 Flash
response = requests.post(url, json={
    "model": "gemini-3-flash",
    "messages": [{"role": "user", "content": "Quick question: What's 2+2?"}]
})

# Balanced performance with Gemini 2.0 Flash
response = requests.post(url, json={
    "model": "gemini-2.0-flash",
    "messages": [{"role": "user", "content": "Explain machine learning"}]
})

# Best quality with Gemini 3.1 Pro
response = requests.post(url, json={
    "model": "gemini-3.1-pro",
    "messages": [{"role": "user", "content": "Write a detailed analysis of climate change"}],
    "max_tokens": 3000
})
```

### Using Different ChatGPT Models

```python
# Latest and most capable - GPT-4o
response = requests.post(url, json={
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Explain quantum entanglement"}]
})

# Fast and efficient - GPT-4o Mini
response = requests.post(url, json={
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Summarize this text"}]
})

# Advanced reasoning - O1
response = requests.post(url, json={
    "model": "o1",
    "messages": [{"role": "user", "content": "Solve this complex math problem"}]
})

# Cost-effective - GPT-3.5 Turbo
response = requests.post(url, json={
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "What's the weather like?"}]
})
```

### Switching Models Dynamically

```python
def chat_with_model(message, model="gemini-3-flash"):
    """Chat with any available model - provider is auto-detected!"""
    response = requests.post(
        "http://localhost:8000/v1/chat/completions",
        json={
            "model": model,  # Just change the model name
            "messages": [{"role": "user", "content": message}]
        }
    )
    return response.json()['choices'][0]['message']['content']

# Use Gemini - no provider specification needed
gemini_answer = chat_with_model("What is Python?", model="gemini-3-flash")

# Use ChatGPT - just change the model name
chatgpt_answer = chat_with_model("What is Python?", model="gpt-4o")

# Compare responses from both providers
print("Gemini says:", gemini_answer)
print("ChatGPT says:", chatgpt_answer)
```

### Easy Provider Comparison

```python
def compare_providers(question):
    """Compare the same question across providers"""
    
    # Ask Gemini
    gemini_response = requests.post(
        "http://localhost:8000/v1/chat/completions",
        json={
            "model": "gemini-3-flash",  # Auto-routes to Gemini
            "messages": [{"role": "user", "content": question}]
        }
    )
    
    # Ask ChatGPT - same endpoint, different model
    chatgpt_response = requests.post(
        "http://localhost:8000/v1/chat/completions",
        json={
            "model": "gpt-4o",  # Auto-routes to ChatGPT
            "messages": [{"role": "user", "content": question}]
        }
    )
    
    return {
        "gemini": gemini_response.json()['choices'][0]['message']['content'],
        "chatgpt": chatgpt_response.json()['choices'][0]['message']['content']
    }

# Usage
results = compare_providers("Explain quantum computing")
print("Gemini:", results["gemini"])
print("\nChatGPT:", results["chatgpt"])
```

### Model Comparison Example

```python
def compare_models(question):
    """Compare responses from different models"""
    models = ["gemini-3-flash", "gpt-4o-mini", "gpt-4o"]
    
    for model in models:
        response = requests.post(
            "http://localhost:8000/v1/chat/completions",
            json={
                "model": model,
                "messages": [{"role": "user", "content": question}]
            }
        )
        answer = response.json()['choices'][0]['message']['content']
        print(f"\n{model}:")
        print(answer)
        print("-" * 50)

# Usage
compare_models("What is artificial intelligence?")
```

---

## Integration Examples

### Python

#### Basic Request

```python
import requests
import json

url = "http://localhost:8000/v1/chat/completions"

payload = {
    "model": "gemini-2.0-flash",
    "messages": [
        {"role": "user", "content": "Explain quantum computing in simple terms"}
    ]
}

headers = {
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)
result = response.json()

print(result['choices'][0]['message']['content'])
```

#### With Conversation History

```python
import requests

url = "http://localhost:8000/v1/chat/completions"

# Maintain conversation context
messages = [
    {"role": "system", "content": "You are a helpful coding assistant."},
    {"role": "user", "content": "How do I read a file in Python?"},
]

response = requests.post(url, json={"model": "gemini-2.0-flash", "messages": messages})
assistant_message = response.json()['choices'][0]['message']

# Add assistant response to history
messages.append(assistant_message)

# Continue conversation
messages.append({"role": "user", "content": "Can you show me an example?"})
response = requests.post(url, json={"model": "gemini-2.0-flash", "messages": messages})

print(response.json()['choices'][0]['message']['content'])
```

#### Using OpenAI Python Library

```python
from openai import OpenAI

# Point to your local Spike instance
client = OpenAI(
    base_url="http://localhost:8000/v1",
    api_key="not-needed"  # Spike doesn't require API keys
)

response = client.chat.completions.create(
    model="gemini-2.0-flash",
    messages=[
        {"role": "user", "content": "Write a haiku about programming"}
    ]
)

print(response.choices[0].message.content)
```

### JavaScript/Node.js

#### Using Fetch

```javascript
const response = await fetch('http://localhost:8000/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gemini-2.0-flash',
    messages: [
      { role: 'user', content: 'What is the capital of France?' }
    ]
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);
```

#### Using Axios

```javascript
const axios = require('axios');

async function chat(message) {
  const response = await axios.post('http://localhost:8000/v1/chat/completions', {
    model: 'gemini-2.0-flash',
    messages: [
      { role: 'user', content: message }
    ]
  });
  
  return response.data.choices[0].message.content;
}

// Usage
chat('Explain async/await in JavaScript').then(console.log);
```

#### React Integration

```jsx
import { useState } from 'react';

function ChatComponent() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    setLoading(true);
    
    const res = await fetch('http://localhost:8000/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemini-2.0-flash',
        messages: [{ role: 'user', content: message }]
      })
    });
    
    const data = await res.json();
    setResponse(data.choices[0].message.content);
    setLoading(false);
  };

  return (
    <div>
      <input 
        value={message} 
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask anything..."
      />
      <button onClick={sendMessage} disabled={loading}>
        {loading ? 'Thinking...' : 'Send'}
      </button>
      {response && <div>{response}</div>}
    </div>
  );
}
```

### cURL

#### Simple Request

```bash
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-2.0-flash",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

#### With Streaming

```bash
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-2.0-flash",
    "messages": [{"role": "user", "content": "Write a story"}],
    "stream": true
  }'
```

### Java

```java
import java.net.http.*;
import java.net.URI;
import org.json.*;

public class SpikeClient {
    public static void main(String[] args) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        
        JSONObject payload = new JSONObject()
            .put("model", "gemini-2.0-flash")
            .put("messages", new JSONArray()
                .put(new JSONObject()
                    .put("role", "user")
                    .put("content", "Explain inheritance in Java")));
        
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("http://localhost:8000/v1/chat/completions"))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(payload.toString()))
            .build();
        
        HttpResponse<String> response = client.send(request, 
            HttpResponse.BodyHandlers.ofString());
        
        JSONObject result = new JSONObject(response.body());
        String answer = result.getJSONArray("choices")
            .getJSONObject(0)
            .getJSONObject("message")
            .getString("content");
        
        System.out.println(answer);
    }
}
```

### C#

```csharp
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

class Program
{
    static async Task Main()
    {
        using var client = new HttpClient();
        
        var payload = new
        {
            model = "gemini-2.0-flash",
            messages = new[]
            {
                new { role = "user", content = "What is LINQ in C#?" }
            }
        };
        
        var json = JsonSerializer.Serialize(payload);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        
        var response = await client.PostAsync(
            "http://localhost:8000/v1/chat/completions", 
            content
        );
        
        var result = await response.Content.ReadAsStringAsync();
        Console.WriteLine(result);
    }
}
```

---

## Token Setup

### Getting ChatGPT Tokens

1. **Open ChatGPT** in your browser: https://chatgpt.com
2. **Open Developer Tools** (F12)
3. **Go to Application tab** → Cookies → `https://chatgpt.com`
4. **Find and copy** the `accessToken` value
5. **In Spike**: Services → Chat2API → Configure Token → Paste token

**Alternative Method:**
1. Visit: `https://chatgpt.com/api/auth/session`
2. Copy the `accessToken` value from the JSON response
3. Paste in Spike's token management

### Getting Gemini Tokens

1. **Open Gemini** in your browser: https://gemini.google.com
2. **Open Developer Tools** (F12)
3. **Go to Application tab** → Cookies → `https://gemini.google.com`
4. **Find and copy** two values:
   - `__Secure-1PSID`
   - `__Secure-1PSIDTS`
5. **In Spike**: Services → Gemini Bridge → Configure Tokens → Paste both tokens

---

## Common Use Cases

### 1. Chatbot for Your Website

```javascript
// Simple chatbot backend (Node.js/Express)
app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;
  
  const response = await fetch('http://localhost:8000/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gemini-2.0-flash',
      messages: [
        { role: 'system', content: 'You are a helpful customer service assistant.' },
        { role: 'user', content: userMessage }
      ]
    })
  });
  
  const data = await response.json();
  res.json({ reply: data.choices[0].message.content });
});
```

### 2. Code Assistant

```python
def get_code_help(question, language="python"):
    """Get coding help from AI"""
    response = requests.post(
        "http://localhost:8000/v1/chat/completions",
        json={
            "model": "gemini-2.0-flash",
            "messages": [
                {
                    "role": "system",
                    "content": f"You are an expert {language} programmer. Provide clear, concise code examples."
                },
                {
                    "role": "user",
                    "content": question
                }
            ]
        }
    )
    return response.json()['choices'][0]['message']['content']

# Usage
help_text = get_code_help("How do I sort a dictionary by value in Python?")
print(help_text)
```

### 3. Content Generator

```python
def generate_content(topic, content_type="blog post"):
    """Generate content using AI"""
    prompt = f"Write a {content_type} about {topic}. Make it engaging and informative."
    
    response = requests.post(
        "http://localhost:8000/v1/chat/completions",
        json={
            "model": "gemini-1.5-pro",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.8,
            "max_tokens": 2000
        }
    )
    return response.json()['choices'][0]['message']['content']

# Usage
article = generate_content("artificial intelligence in education", "article")
print(article)
```

### 4. Data Analysis Assistant

```python
def analyze_data(data_description, question):
    """Get insights from data using AI"""
    prompt = f"""
    Data: {data_description}
    
    Question: {question}
    
    Provide a detailed analysis with insights and recommendations.
    """
    
    response = requests.post(
        "http://localhost:8000/v1/chat/completions",
        json={
            "model": "gemini-1.5-pro",
            "messages": [
                {
                    "role": "system",
                    "content": "You are a data analyst. Provide clear, actionable insights."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        }
    )
    return response.json()['choices'][0]['message']['content']
```

---

## Error Handling

### Common Errors

#### Service Not Running

```json
{
  "error": "Connection refused"
}
```

**Solution**: Start Spike services from the Dashboard

#### Invalid Model

```json
{
  "error": "Model not found"
}
```

**Solution**: Use a valid model ID from [Available Models](#available-models)

#### Token Expired

```json
{
  "error": "Authentication failed"
}
```

**Solution**: Update your tokens in Spike's Services tab

### Robust Error Handling Example

```python
import requests
from requests.exceptions import RequestException

def safe_chat(message, model="gemini-2.0-flash", max_retries=3):
    """Chat with error handling and retries"""
    url = "http://localhost:8000/v1/chat/completions"
    
    for attempt in range(max_retries):
        try:
            response = requests.post(
                url,
                json={
                    "model": model,
                    "messages": [{"role": "user", "content": message}]
                },
                timeout=30
            )
            response.raise_for_status()
            return response.json()['choices'][0]['message']['content']
            
        except RequestException as e:
            if attempt == max_retries - 1:
                return f"Error: Unable to get response after {max_retries} attempts"
            print(f"Attempt {attempt + 1} failed, retrying...")
            
    return "Error: Max retries exceeded"
```

---

## Best Practices

### 1. Connection Management

```python
# Reuse session for better performance
import requests

session = requests.Session()
session.headers.update({'Content-Type': 'application/json'})

def chat(message):
    response = session.post(
        'http://localhost:8000/v1/chat/completions',
        json={"model": "gemini-2.0-flash", "messages": [{"role": "user", "content": message}]}
    )
    return response.json()['choices'][0]['message']['content']
```

### 2. Rate Limiting

```python
import time
from functools import wraps

def rate_limit(calls_per_minute=10):
    min_interval = 60.0 / calls_per_minute
    last_called = [0.0]
    
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            elapsed = time.time() - last_called[0]
            left_to_wait = min_interval - elapsed
            if left_to_wait > 0:
                time.sleep(left_to_wait)
            ret = func(*args, **kwargs)
            last_called[0] = time.time()
            return ret
        return wrapper
    return decorator

@rate_limit(calls_per_minute=10)
def chat(message):
    # Your chat function here
    pass
```

### 3. Context Management

```python
class ChatSession:
    def __init__(self, model="gemini-2.0-flash", system_prompt=None):
        self.model = model
        self.messages = []
        if system_prompt:
            self.messages.append({"role": "system", "content": system_prompt})
    
    def send(self, message):
        self.messages.append({"role": "user", "content": message})
        
        response = requests.post(
            'http://localhost:8000/v1/chat/completions',
            json={"model": self.model, "messages": self.messages}
        )
        
        assistant_message = response.json()['choices'][0]['message']
        self.messages.append(assistant_message)
        
        return assistant_message['content']
    
    def clear(self):
        self.messages = []

# Usage
chat = ChatSession(system_prompt="You are a helpful coding assistant.")
print(chat.send("How do I use async/await?"))
print(chat.send("Can you show me an example?"))  # Maintains context
```

---

## Troubleshooting

### Check Service Status

```bash
# Test if Unified Proxy is running
curl http://localhost:8000/v1/models

# Test Gemini Bridge directly
curl http://localhost:6969/health

# Test Chat2API directly
curl http://localhost:5005/health
```

### View Logs

1. Open Spike application
2. Go to **Logs** tab
3. Check for error messages
4. Use **Copy to Clipboard** to share logs when reporting issues

### Common Issues

| Issue | Solution |
|-------|----------|
| Connection refused | Start services in Spike Dashboard |
| 401 Unauthorized | Update tokens in Services tab |
| 500 Internal Error | Check logs for details, restart service |
| Slow responses | Check internet connection, try different model |

---

## Advanced Features

### Streaming Responses

```python
import requests
import json

def stream_chat(message):
    response = requests.post(
        'http://localhost:8000/v1/chat/completions',
        json={
            "model": "gemini-2.0-flash",
            "messages": [{"role": "user", "content": message}],
            "stream": True
        },
        stream=True
    )
    
    for line in response.iter_lines():
        if line:
            data = json.loads(line.decode('utf-8'))
            if 'choices' in data:
                content = data['choices'][0]['delta'].get('content', '')
                if content:
                    print(content, end='', flush=True)

# Usage
stream_chat("Write a long story about space exploration")
```

### Custom Temperature and Max Tokens

```python
# More creative responses
creative_response = requests.post(
    'http://localhost:8000/v1/chat/completions',
    json={
        "model": "gemini-2.0-flash",
        "messages": [{"role": "user", "content": "Write a creative story"}],
        "temperature": 1.2,  # Higher = more creative
        "max_tokens": 3000
    }
)

# More focused responses
focused_response = requests.post(
    'http://localhost:8000/v1/chat/completions',
    json={
        "model": "gemini-2.0-flash",
        "messages": [{"role": "user", "content": "What is 2+2?"}],
        "temperature": 0.1,  # Lower = more deterministic
        "max_tokens": 100
    }
)
```

---

## Support

- **Documentation**: [User Guide](nexusai-electron/USER_GUIDE.md)
- **Issues**: [GitHub Issues](https://github.com/yourusername/spike/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/spike/discussions)

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
