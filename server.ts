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
  const { message, history } = req.body;

  if (!message) {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  try {
    const ai = getAIClient();
    
    // Structure chat with system instruction
    const systemInstruction = `You are Sugora AI, a brilliant multi-functional AI assistant embedded in the Sugora.com platform.
Sugora.com is a premium digital hub containing:
- Sugora Tree (Linktree-style microsites for users to showcase profiles, links, sell digital downloads and list affiliate products)
- Shop (An admin-supervised digital products & affiliate links marketplace with direct Razorpay checkouts)
- Chat (WhatsApp-style instant peer and support communication)
- Apps (Embedded browser portals for external services like Instagram, YouTube, X inside Sugora's canvas)
- Wallet System (UPI & bank withdrawals, referral payouts, sales commissions)

Keep responses concise, helpful, and beautifully formatted in markdown. Refuse illegal tasks.`;

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
    
    // Provide a beautiful fallback experience for UI testing if API key is not configured in secrets yet
    if (error.message && error.message.includes('GEMINI_API_KEY')) {
      const fallbackResponses = [
        "Welcome to **Sugora AI**! I'm operating in Sandbox Mock mode because the `GEMINI_API_KEY` is not linked. Once you set your API key in **Settings > Secrets**, I'll answer queries with real-time intelligence!",
        "Double click any card or explore the **Sugora Tree** in the user dashboard! This premium simulator showcases our full-stack layout.",
        "To run Sugora locally, use the generated `supabase_schema.sql` inside your Supabase project's SQL builder. It creates all tables and automatic triggers successfully!"
      ];
      const randomFallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      res.json({ 
        response: randomFallback,
        isDemoFallback: true
      });
      return;
    }

    res.status(500).json({ error: error.message || 'Internal Server Error' });
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
