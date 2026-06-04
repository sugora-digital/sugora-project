/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, ShoppingBag, ExternalLink, Download, Star, CheckCircle, Zap, ShieldAlert } from 'lucide-react';
import { Product, ProductReview } from '../types';

interface ShopMarketplaceProps {
  products: Product[];
  walletBalance: number;
  onPurchaseComplete: (product: Product, price: number, paymentId: string) => void;
  ownedProductIds: string[];
}

const INITIAL_REVIEWS: Record<string, ProductReview[]> = {
  'prod-1': [
    { id: 'rev-1', product_id: 'prod-1', user_id: 'user-johndoe', username: 'johndoe', rating: 5, comment: 'Hands-down the best structured handbook for modern layouts. The section about hashtag weight is pure gold!', created_at: new Date().toISOString() }
  ],
  'prod-2': [
    { id: 'rev-2', product_id: 'prod-2', user_id: 'user-ceo', username: 'ceo', rating: 4, comment: 'Very clean and easy to customize. The token configuration speeds up my Figma flows immensely.', created_at: new Date().toISOString() }
  ]
};

export default function ShopMarketplace({
  products,
  walletBalance,
  onPurchaseComplete,
  ownedProductIds
}: ShopMarketplaceProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeReviewProductId, setActiveReviewProductId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Record<string, ProductReview[]>>(INITIAL_REVIEWS);
  const [newReviewRating, setNewReviewRating] = useState<number>(5);
  const [newReviewComment, setNewReviewComment] = useState<string>('');

  // Payment simulator triggers
  const [selectedProductToBuy, setSelectedProductToBuy] = useState<Product | null>(null);
  const [razorpaySimState, setRazorpaySimState] = useState<'idle' | 'processing' | 'success'>('idle');

  const categories = ['All', 'E-Books', 'Design Templates', 'Affiliate Services'];

  const filteredProducts = products.filter(p => {
    const categoryMatches = selectedCategory === 'All' || p.category === selectedCategory;
    const queryMatches = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatches && queryMatches;
  });

  const triggerRazorpayCheckout = (product: Product) => {
    setSelectedProductToBuy(product);
    setRazorpaySimState('idle');
  };

  const handleRazorpayPayment = () => {
    if (!selectedProductToBuy) return;
    setRazorpaySimState('processing');

    setTimeout(() => {
      setRazorpaySimState('success');
      const randomPaymentId = `pay_razor_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
      
      setTimeout(() => {
        onPurchaseComplete(selectedProductToBuy, selectedProductToBuy.price, randomPaymentId);
        setSelectedProductToBuy(null);
        setRazorpaySimState('idle');
      }, 1000);
    }, 1500);
  };

  const handleAddReview = (prodId: string) => {
    if (!newReviewComment.trim()) return;

    const newReview: ProductReview = {
      id: `rev-${Date.now()}`,
      product_id: prodId,
      user_id: 'user-current',
      username: 'you',
      rating: newReviewRating,
      comment: newReviewComment,
      created_at: new Date().toISOString()
    };

    setReviews(prev => ({
      ...prev,
      [prodId]: [newReview, ...(prev[prodId] || [])]
    }));

    setNewReviewComment('');
    setActiveReviewProductId(null);
  };

  return (
    <div id="shop-marketplace-root" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-emerald-600" />
            Sugora Shop Marketplace
          </h1>
          <p className="text-xs text-gray-500">
            Admin-controlled digital marketplace. Only verified administrators can upload items.
          </p>
        </div>

        {/* Categories toggler */}
        <div className="flex flex-wrap gap-2">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold tracking-wide transition ${
                selectedCategory === c
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-100 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Searching section */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search products by title or keyword..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-2xl bg-white dark:bg-zinc-900 pl-11 pr-5 py-3 text-xs border border-gray-100 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Products Display Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800/60 p-8">
          <ShoppingBag className="h-12 w-12 text-gray-200 dark:text-zinc-800 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No active products match your criteria. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((p) => {
            const isOwned = ownedProductIds.includes(p.id);
            const rList = reviews[p.id] || [];
            const avgRating = rList.length > 0 ? (rList.reduce((acc, r) => acc + r.rating, 0) / rList.length).toFixed(1) : '5.0';

            return (
              <div key={p.id} className="group relative flex flex-col justify-between rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition dark:border-zinc-800/40 dark:bg-zinc-900">
                <div>
                  <div className="relative h-44 w-full overflow-hidden rounded-t-2xl bg-gray-50">
                    <img
                      referrerPolicy="no-referrer"
                      src={p.image_url}
                      alt={p.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <span className="absolute top-3 left-3 rounded-full bg-black/60 backdrop-blur-xs px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
                      {p.category}
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-100">{p.name}</h3>
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-500 bg-amber-50 dark:bg-amber-950/20 px-1.5 py-0.5 rounded">
                        <Star className="h-3 w-3 fill-amber-500" />
                        {avgRating} ({rList.length})
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                      {p.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-gray-50 dark:border-zinc-800/20 mt-4">
                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <span className="block text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Sale Price</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-zinc-100">₹{p.price.toFixed(2)}</span>
                    </div>

                    {p.type === 'affiliate_product' ? (
                      <a
                        href={p.affiliate_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl bg-indigo-50 hover:bg-indigo-100 px-4 py-2.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 flex items-center gap-1.5 transition"
                      >
                        Buy External Link
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : isOwned ? (
                      <a
                        href={p.download_file_url}
                        download
                        className="rounded-xl bg-teal-50 hover:bg-teal-100 px-4 py-2.5 text-xs font-bold text-teal-700 dark:bg-teal-950/30 dark:text-teal-400 flex items-center gap-1.5 transition animate-pulse"
                      >
                        Download Files
                        <Download className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <button
                        onClick={() => triggerRazorpayCheckout(p)}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white transition active:scale-95 shadow-sm"
                      >
                        Buy Now
                      </button>
                    )}
                  </div>

                  {/* Reviews review toggle and widget */}
                  <div className="mt-4 pt-4 border-t border-gray-50 dark:border-zinc-800/10">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Total Reviews ({rList.length})</span>
                      <button
                        onClick={() => setActiveReviewProductId(activeReviewProductId === p.id ? null : p.id)}
                        className="text-emerald-600 font-semibold hover:underline"
                      >
                        {activeReviewProductId === p.id ? 'Close Comments' : 'Add Review'}
                      </button>
                    </div>

                    {activeReviewProductId === p.id && (
                      <div className="mt-3 bg-gray-50 dark:bg-zinc-950 p-3 rounded-xl border dark:border-zinc-800">
                        <span className="block text-[10px] font-bold text-gray-400 mb-1">Select Star Rating</span>
                        <div className="flex gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map(st => (
                            <button
                              key={st}
                              onClick={() => setNewReviewRating(st)}
                              className={`text-sm ${newReviewRating >= st ? 'text-amber-500' : 'text-gray-300'}`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                        <textarea
                          placeholder="Write a constructive, honest product review..."
                          value={newReviewComment}
                          onChange={(e) => setNewReviewComment(e.target.value)}
                          className="w-full rounded bg-white dark:bg-zinc-900 border text-[11px] p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 mb-2 h-14"
                        />
                        <button
                          onClick={() => handleAddReview(p.id)}
                          className="rounded bg-emerald-600 text-white font-semibold text-[10px] px-3 py-1.5 hover:bg-emerald-700"
                        >
                          Submit Comment
                        </button>
                      </div>
                    )}

                    {rList.length > 0 && (
                      <div className="mt-2 space-y-2 max-h-24 overflow-y-auto">
                        {rList.map(r => (
                          <div key={r.id} className="text-[10px] border-b border-gray-50 dark:border-zinc-800/5 py-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-gray-700 dark:text-zinc-300">@{r.username}</span>
                              <span className="text-amber-500 font-bold">★ {r.rating}</span>
                            </div>
                            <p className="text-gray-500 italic mt-0.5">{r.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Razorpay Checkout Modal Simulator */}
      {selectedProductToBuy && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-sm rounded-2xl bg-[#1d1f27] text-white p-6 shadow-2xl border border-zinc-800">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-indigo-600 p-2 text-white">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight">Razorpay Checkout</h3>
                  <p className="text-[10px] text-zinc-400">Merchant: sugora.com</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProductToBuy(null)}
                className="text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="py-6 space-y-4">
              <div>
                <span className="block text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">Buying Product</span>
                <span className="text-sm font-semibold truncate block mt-0.5">{selectedProductToBuy.name}</span>
              </div>

              <div className="flex items-center justify-between bg-zinc-900 p-3 rounded-xl border border-zinc-800">
                <div>
                  <span className="block text-[10px] text-zinc-400 font-medium font-mono">Invoice Total</span>
                  <span className="text-lg font-mono font-bold text-emerald-400">₹{selectedProductToBuy.price.toFixed(2)}</span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] text-zinc-400">Billing Mode</span>
                  <span className="rounded bg-indigo-950/70 border border-indigo-700 text-indigo-400 text-[10px] px-2 py-0.5 font-bold">INS-UPI</span>
                </div>
              </div>

              <div className="text-xs text-zinc-400 leading-relaxed bg-zinc-900/40 p-3 rounded-lg border border-zinc-800/50 flex gap-2">
                <Zap className="h-4 w-4 shrink-0 text-amber-500" />
                <span>
                  This simulation triggers Razorpay’s instant sandbox approval webhook. Upon successful validation, authorization tokens allocate immediately.
                </span>
              </div>
            </div>

            {/* Status actions */}
            {razorpaySimState === 'idle' && (
              <button
                onClick={handleRazorpayPayment}
                className="w-full rounded-xl bg-emerald-600 py-3 text-xs font-semibold text-white hover:bg-emerald-500 active:scale-95 transition"
              >
                Simulate Successful Payment (₹{selectedProductToBuy.price.toFixed(2)})
              </button>
            )}

            {razorpaySimState === 'processing' && (
              <div className="flex flex-col items-center justify-center py-2 text-zinc-300">
                <span className="h-5 w-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mb-2"></span>
                <span className="text-xs font-medium font-mono">Contacting banking gateway...</span>
              </div>
            )}

            {razorpaySimState === 'success' && (
              <div className="flex flex-col items-center justify-center py-2 text-emerald-400 font-semibold text-xs">
                <CheckCircle className="h-6 w-6 text-emerald-500 mb-2 animate-bounce" />
                <span>Authorization Confirmed!</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
