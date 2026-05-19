# 🍪 Cookie Extraction Guide - Step by Step

## Why You're Getting "Free Version" / No History

If Spike Lite shows "Gemini 3 Flash free version" and your chats don't appear in gemini.google.com/app, it means **your cookies are wrong or incomplete**.

## The Right Way to Get Cookies

### Step 1: Open Gemini (CRITICAL!)

Open your browser and go to:
```
https://gemini.google.com
```

**⚠ MUST BE HTTPS!** Not `http://` or just `gemini.google.com`

### Step 2: Make Sure You're Logged In

- You should see your Google account profile picture
- You should be able to chat with Gemini
- If not logged in, log in now

### Step 3: Open DevTools

Press **F12** on your keyboard

OR

Right-click anywhere → Select "Inspect"

### Step 4: Navigate to Cookies

In DevTools:
1. Click the **"Application"** tab (at the top)
2. In the left sidebar, expand **"Cookies"**
3. Click on **"https://gemini.google.com"**

**⚠ CRITICAL**: Make sure it says `https://gemini.google.com`, NOT:
- ❌ `https://google.com`
- ❌ `https://accounts.google.com`
- ❌ `http://gemini.google.com`

### Step 5: Find the Cookies

In the cookies list, find these TWO cookies:
1. `__Secure-1PSID`
2. `__Secure-1PSIDTS`

### Step 6: Copy the COMPLETE Value

**THIS IS WHERE MOST PEOPLE FAIL!**

For each cookie:
1. Click on the cookie name in the list
2. Look at the "Value" field at the bottom
3. **Double-click** the value field
4. Press **Ctrl+A** (select all)
5. Press **Ctrl+C** (copy)

**⚠ CRITICAL CHECKS**:
- The value should be **200-500+ characters long**
- It should look like random letters and numbers
- `__Secure-1PSID` typically starts with `g.`
- If your copied value is short (< 100 chars), **YOU DIDN'T COPY IT ALL!**

### Step 7: Paste into Spike Lite

1. Open Spike Lite dashboard (http://localhost:6969)
2. Go to "Token Settings" tab
3. Paste `__Secure-1PSID` value into the first field
4. Paste `__Secure-1PSIDTS` value into the second field
5. Click "Save Tokens"

### Step 8: Initialize Client

1. Click "Initialize Client" button
2. Wait 10-30 seconds (it's connecting to Gemini)
3. You should see "Client initialized successfully!"

### Step 9: VERIFY IT WORKED

**This is the most important step!**

1. Go to "Chat Test" tab in Spike Lite
2. Send a test message: "Hello, what's your name?"
3. Wait for response
4. Open a new browser tab and go to: https://gemini.google.com/app
5. **Check if your test message appears in the chat history**

**✅ If it appears**: SUCCESS! You're authenticated!
**❌ If it doesn't appear**: Your cookies are still wrong. Go back to Step 1.

## Visual Guide

```
Browser DevTools:
┌─────────────────────────────────────────────────┐
│ Elements  Console  Sources  Network  [Application] │
├─────────────────────────────────────────────────┤
│ ▼ Storage                                       │
│   ▼ Cookies                                     │
│     ► https://accounts.google.com               │
│     ▼ https://gemini.google.com  ← CLICK THIS! │
│     ► https://google.com                        │
│                                                 │
│ Name                    Value                   │
│ __Secure-1PSID         g.a32f...  ← COPY THIS! │
│ __Secure-1PSIDTS       sidts-...  ← AND THIS!  │
└─────────────────────────────────────────────────┘
```

## Common Mistakes

### ❌ Mistake 1: Wrong Domain
Copying cookies from `google.com` instead of `gemini.google.com`

### ❌ Mistake 2: Incomplete Copy
Not copying the entire value (should be 200-500+ characters)

### ❌ Mistake 3: Wrong Cookie
Copying the cookie NAME instead of the VALUE

### ❌ Mistake 4: Expired Cookies
Using cookies that are > 30 days old

### ❌ Mistake 5: Not Logged In
Getting cookies while not logged in to Gemini

## How to Know If It's Working

### ✅ Signs of SUCCESS:
- Client initializes without errors
- Chat history appears in gemini.google.com/app
- Responses are personalized
- Can access your Gemini Pro features (if you have them)

### ❌ Signs of FAILURE:
- Shows "Gemini 3 Flash free version"
- Chat history doesn't appear in gemini.google.com/app
- Responses seem generic
- Can't access Pro features even though you have them

## Quick Test

After setting up cookies, run this test:

1. In Spike Lite Chat Test, send: "What's my name?" or "What did I ask you yesterday?"
2. If Gemini knows your name or remembers previous chats → ✅ Authenticated!
3. If Gemini says it doesn't know → ❌ Not authenticated (wrong cookies)

## Cookie Lifespan

- **Fresh cookies**: Last ~30 days
- **Auto-refresh**: Spike Lite automatically refreshes cookies in the background
- **When to update**: Only if you restart the app or cookies fail to refresh

## Still Not Working?

If you followed ALL steps correctly and it still doesn't work:

1. **Try incognito/private mode**: Get cookies from a fresh login
2. **Try different browser**: Chrome vs Edge
3. **Check account restrictions**: Some regions/accounts have limited Gemini access
4. **Wait and retry**: Sometimes Google's servers are slow

## Need Help?

Check the full troubleshooting guide: `TROUBLESHOOTING.md`

---

**Remember**: 99% of authentication issues are caused by incomplete or wrong cookies. Always copy the ENTIRE value!
