/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

/**
 * REST API handler for AI Chat generation with modern @google/genai library
 * Next.js 15 App Router standard: POST /api/chat
 */
export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not defined on the production Vercel console.' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are Sugora AI, a brilliant multi-functional AI assistant embedded in the Sugora.com platform.
Sugora.com is a premium digital hub containing:
- Sugora Tree (Linktree-style profiles, custom external social links, digital shop items & affiliate links)
- Shop (An admin marketplace with direct Razorpay checkouts)
- Chat (Instant peer communication with Real-time triggers on Supabase replication)
- Apps (Custom browser frames inside the app canvas)
- Wallet System (UPI with bank withdrawals, referral payouts, commissions)

Respond concisely in clean markdown with elegant formatting.`;

    const chatHistory = (history || []).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const chat = ai.chats.create({
      model: 'gemini-3.5-flash',
      config: {
        systemInstruction,
      },
      history: chatHistory,
    });

    const result = await chat.sendMessage({ message });

    return NextResponse.json({
      success: true,
      response: result.text || "I was unable to assemble a solid answer.",
    });

  } catch (error: any) {
    console.error('[Gemini Next.js Server Route Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal AI Server Error.' },
      { status: 500 }
    );
  }
}
