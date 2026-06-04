/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * REST API handler for Razorpay order processing & purchase execution
 * Next.js 15 App Router standard: POST /api/razorpay
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, userId, productId, amount, paymentId, orderId, signature } = body;

    // Guard on secret validation
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: 'Razorpay keys are missing on the Vercel hosting server.' },
        { status: 500 }
      );
    }

    const rzp = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // -------------------------------------------------------------
    // ACTION 1: INITIALIZE ORDER (Before opening Razorpay Checkout Dialog)
    // -------------------------------------------------------------
    if (action === 'create_order') {
      if (!productId || !amount) {
        return NextResponse.json({ error: 'product_id and amount are required.' }, { status: 400 });
      }

      // Convert amount to paisa (multiple of 100) for Indian Rupees
      const rawAmountInPaisa = Math.round(parseFloat(amount) * 100);

      const options = {
        amount: rawAmountInPaisa,
        currency: 'INR',
        receipt: `receipt_prod_${productId.substring(0, 8)}_${Date.now()}`,
        payment_capture: 1, // Auto-capture payments
      };

      const originalOrder = await rzp.orders.create(options);

      return NextResponse.json({
        success: true,
        orderId: originalOrder.id,
        amount: originalOrder.amount,
        currency: originalOrder.currency,
      });
    }

    // -------------------------------------------------------------
    // ACTION 2: VERIFY PAYMENT SIGNATURE (After Checkout Completion)
    // -------------------------------------------------------------
    if (action === 'verify_payment') {
      if (!paymentId || !orderId || !signature || !userId || !productId) {
        return NextResponse.json({ error: 'Missing parameters for execution verification.' }, { status: 400 });
      }

      // Create Hash signature using local secret to authenticate transaction integrity
      const textToSign = `${orderId}|${paymentId}`;
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(textToSign)
        .digest('hex');

      const isSignatureMatchDone = generatedSignature === signature;

      if (!isSignatureMatchDone) {
        return NextResponse.json({ error: 'Payment authentic signatures do not match! Fraud attempts blocked.' }, { status: 400 });
      }

      // Retrieve product price details securely using Administrator permission
      const supabaseAdmin = getSupabaseAdmin();
      const { data: targetProduct, error: productError } = await supabaseAdmin
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (productError || !targetProduct) {
        return NextResponse.json({ error: 'Requested digital item not found.' }, { status: 404 });
      }

      const verifiedPrice = parseFloat(targetProduct.price);

      // Save order record in DB
      const { data: newOrder, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert({
          user_id: userId,
          product_id: productId,
          amount: verifiedPrice,
          payment_id: paymentId,
          status: 'completed',
        })
        .select()
        .single();

      if (orderError) {
        return NextResponse.json({ error: `Database insertion error: ${orderError.message}` }, { status: 500 });
      }

      // Retrieve and adjust buyer wallet records with transaction log entries
      const { data: buyerWallet, error: walletError } = await supabaseAdmin
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (buyerWallet && !walletError) {
        // Record purchases
        await supabaseAdmin.from('transactions').insert({
          wallet_id: buyerWallet.id,
          amount: -verifiedPrice,
          type: 'product_sale',
          status: 'completed',
          description: `Bought product: ${targetProduct.name}`,
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Transaction authorized, order stored, and wallet synchronized successfully.',
        order: newOrder,
      });
    }

    return NextResponse.json({ error: 'Unsupported action request.' }, { status: 400 });

  } catch (error: any) {
    console.error('[Razorpay Server Endpoint Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal payment error occured.' }, { status: 500 });
  }
}
