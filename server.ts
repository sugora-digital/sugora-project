/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini AI Client
let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    // We handle missing key gracefully to prevent container start failures
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
      throw new Error('GEMINI_API_KEY environment variable is missing or placeholder.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// ------------------------------------------------------------------
// API ENDPOINTS
// ------------------------------------------------------------------

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// AI Chat endpoint
app.post('/api/ai/chat', async (req, res) => {
  const { message, history, siteSettings } = req.body;

  if (!message) {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  // Determine provider and keys dynamically
  const provider = siteSettings?.ai_provider || 'gemini';
  const geminiKey = siteSettings?.gemini_api_key || process.env.GEMINI_API_KEY;
  const chatgptKey = siteSettings?.chatgpt_api_key || process.env.OPENAI_API_KEY;

  if (provider === 'mock') {
    const sandboxReplies = [
      "Hello! I am operating in Sandbox Mock mode. Real AI is idle. Go to **Admin Console > Settings** to configure active OpenAI or Gemini API connections.",
      "Indeed! I am an interactive mockup agent. To enable live neural completions, enter your credentials in the administrator dashboard.",
      "Sure! Once your credentials are saved in the admin settings panel, I will respond with full GPT or Google Gemini intelligence!"
    ];
    const reply = sandboxReplies[Math.floor(Math.random() * sandboxReplies.length)];
    res.json({ response: reply, isMock: true });
    return;
  }

  const systemInstruction = `You are Sugora AI, a brilliant multi-functional AI assistant embedded in the Sugora.com platform.
Sugora.com is a premium digital hub containing:
- Sugora Tree (Linktree-style microsites for users to showcase profiles, links, sell digital downloads and list affiliate products)
- Shop (An admin-supervised digital products & affiliate links marketplace with direct Razorpay checkouts)
- Chat (WhatsApp-style peer and support communication)
- Apps (Embedded browser portals for external services like Instagram, YouTube, X inside Sugora's canvas)
- Wallet System (UPI & bank withdrawals, referral payouts, sales commissions)

Keep responses concise, helpful, and beautifully formatted in markdown. Refuse illegal tasks.`;

  if (provider === 'chatgpt') {
    if (!chatgptKey || chatgptKey.trim() === '' || chatgptKey === 'sk-proj-YOUR_KEY') {
      res.json({
        response: "ChatGPT Provider selected but no valid OpenAI API Key is configured. Please save a key in your Admin Settings Console, or assign OPENAI_API_KEY inside the workspace environment variables first!",
        isConfigRequired: true
      });
      return;
    }

    try {
      const openaiMessages = [
        { role: 'system', content: systemInstruction },
        ...(history || []).map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        { role: 'user', content: message }
      ];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${chatgptKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: openaiMessages,
          temperature: 0.7
        })
      });

      const data: any = await response.json();
      if (data.error) {
        throw new Error(data.error.message || 'OpenAI API returned an error');
      }

      const reply = data.choices?.[0]?.message?.content || "No response generated.";
      res.json({ response: reply });
      return;
    } catch (err: any) {
      console.error('Error in ChatGPT chat API:', err);
      res.status(500).json({ error: err.message || 'Error communicating with OpenAI ChatGPT' });
      return;
    }
  }

  // Default provider is 'gemini'
  try {
    if (!geminiKey || geminiKey.trim() === '' || geminiKey === 'MY_GEMINI_API_KEY') {
      res.json({
        response: "Gemini Provider selected but no valid Google Gemini API Key is configured. Please save a key in your Admin Settings Console, or assign GEMINI_API_KEY inside the workspace environment secrets!",
        isConfigRequired: true
      });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey: geminiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const chatHistory = (history || []).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Start a chat using the recommended chats API
    const chat = ai.chats.create({
      model: 'gemini-3.5-flash',
      config: {
        systemInstruction,
      },
      history: chatHistory
    });

    const result = await chat.sendMessage({ message });
    res.json({ response: result.text || "I'm sorry, I couldn't generate a response." });

  } catch (error: any) {
    console.error('Error in Gemini API route:', error);
    res.status(500).json({ error: error.message || 'Error communicating with Google Gemini' });
  }
});

// ------------------------------------------------------------------
// VITE MIDDLEWARE SETUP
// ------------------------------------------------------------------
async function bootstrap() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Sugora Express Server] bound and running on http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Error starting server:', err);
});
