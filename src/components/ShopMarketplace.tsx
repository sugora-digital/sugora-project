/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShoppingCart, Heart, Star, Search, Filter, Check, X, ArrowRight, 
  Trash2, HelpCircle, Package, RefreshCw, Sparkles, ExternalLink, ShieldCheck 
} from 'lucide-react';
import { Product } from '../types';

interface ShopMarketplaceProps {
  products: Product[];
  walletBalance: number;
  ownedProductIds: string[];
  onPurchaseComplete: (product: Product, amount: number, paymentId: string) => void;
}

interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

const DEFAULT_REVIEWS: Review[] = [
  { id: 'rev-1', productId: 'prod-1', author: 'Vikram Mehta', rating: 5, comment: 'Incredibly detailed! Enabled me to reach 10k organic impressions within my first month editing reels.', date: '2026-05-10' },
  { id: 'rev-2', productId: 'prod-1', author: 'Neha J.', rating: 4, comment: 'Practical, no-fluff guide. The viral hooks spreadsheet alone is worth the price.', date: '2026-05-24' },
  { id: 'rev-3', productId: 'prod-2', author: 'Arthur Morgan', rating: 5, comment: 'Phenomenal vector organization and reusable dashboard constraints. Highly recommended.', date: '2026-06-02' }
];

export default function ShopMarketplace({
  products,
  walletBalance,
  ownedProductIds,
  onPurchaseComplete
}: ShopMarketplaceProps) {
  // Navigation categories
  const categories = ['All', 'E-Books', 'Design Templates', 'Affiliate Services'];
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Wishlist
  const [wishlist, setWishlist] = useState<string[]>([]);
  // Cart
  const [cart, setCart] = useState<Product[]>([]);
  const [cartOpen, setCartOpen] = useState<boolean>(false);

  // Active product details modal for reviews/purchase
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Review states
  const [reviewsList, setReviewsList] = useState<Review[]>(DEFAULT_REVIEWS);
  const [newReviewAuthor, setNewReviewAuthor] = useState<string>('');
  const [newReviewRating, setNewReviewRating] = useState<number>(5);
  const [newReviewComment, setNewReviewComment] = useState<string>('');

  // Checkout states
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'payment' | 'tracking'>('cart');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'razorpay'>('wallet');
  const [checkoutSuccess, setCheckoutSuccess] = useState<boolean>(false);
  const [latestPurchasedProductId, setLatestPurchasedProductId] = useState<string | null>(null);

  // Simulated Order Tracking Progress
  // steps: RECEIVED -> PROCESSING -> SENT(Completed & file ready)
  const [orderTrackingStatus, setOrderTrackingStatus] = useState<'received' | 'processing' | 'completed'>('received');

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (cart.find(item => item.id === product.id)) {
      alert('Product already loaded in your checkout cart!');
      return;
    }
    setCart(prev => [...prev, product]);
    setCartOpen(true);
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleCheckoutSubmit = () => {
    if (cart.length === 0) return;
    setCheckoutStep('payment');
  };

  const executeCompletePurchase = () => {
    // Buy all items in cart
    const finalBill = cart.reduce((acc, item) => acc + item.price, 0);

    if (paymentMethod === 'wallet' && finalBill > walletBalance) {
      alert('Insufficient main ledger cash balance in secure wallet! Top up wallet funds under the wallet module.');
      return;
    }

    // Process all purchases
    cart.forEach(item => {
      onPurchaseComplete(item, item.price, `pay-mock-${Date.now()}`);
      if (cart.length === 1) {
        setLatestPurchasedProductId(item.id);
      }
    });

    setCart([]);
    setCheckoutStep('tracking');
    setOrderTrackingStatus('received');

    // Simulate progressive order fulfillment
    setTimeout(() => {
      setOrderTrackingStatus('processing');
    }, 2000);

    setTimeout(() => {
      setOrderTrackingStatus('completed');
    }, 4500);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewComment.trim() || !selectedProduct) return;

    const nReview: Review = {
      id: `rev-${Date.now()}`,
      productId: selectedProduct.id,
      author: newReviewAuthor.trim(),
      rating: newReviewRating,
      comment: newReviewComment.trim(),
      date: new Date().toISOString().split('T')[0]
    };

    setReviewsList(prev => [nReview, ...prev]);
    setNewReviewAuthor('');
    setNewReviewComment('');
    setNewReviewRating(5);
  };

  // Filters logic
  const filteredProducts = products.filter(p => {
    const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const cartTotalAmount = cart.reduce((acc, item) => acc + item.price, 0);

  return (
    <div id="saas-store-main" className="space-y-6 bg-slate-50/20 p-1 md:p-4 rounded-3xl">
      
      {/* Header Grid */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5 border-slate-100 bg-white p-5 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <ShoppingCart className="h-6.5 w-6.5 text-blue-600" />
            Sugora Creator Marketplace
          </h1>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Acquire premium checklists, conversion funnels, Figma templates, and partner hosting options directly.
          </p>
        </div>

        {/* Search & Cart Trigger controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative max-w-xs w-full sm:w-60">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search checklist resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 focus:bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>

          <button
            onClick={() => setCartOpen(true)}
            className="rounded-xl px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Bag ({cart.length})</span>
          </button>
        </div>
      </div>

      {/* Category selector pill row */}
      <div className="flex flex-wrap gap-2 px-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition duration-150 ${
              selectedCategory === cat
                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Store Items Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border p-12 text-center text-slate-400 font-bold">
          No digital assets match your directory parameters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((p) => {
            const isOwned = ownedProductIds.includes(p.id);
            const isWishlisted = wishlist.includes(p.id);
            const productReviews = reviewsList.filter(r => r.productId === p.id);
            const averageRating = productReviews.length > 0 
              ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1)
              : '5.0';

            return (
              <div
                key={p.id}
                onClick={() => setSelectedProduct(p)}
                className="group bg-white rounded-3xl border border-slate-105 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer"
              >
                {/* Visual Image container */}
                <div className="relative aspect-video bg-slate-50 overflow-hidden shrink-0 border-b">
                  <img
                    referrerPolicy="no-referrer"
                    src={p.image_url}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Category overlay tab */}
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wide text-slate-800 shadow-sm border">
                    {p.category}
                  </span>

                  {/* Wishlist button */}
                  <button
                    onClick={(e) => toggleWishlist(p.id, e)}
                    className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-500 hover:text-rose-600 transition shadow-sm border"
                  >
                    <Heart className={`h-4.5 w-4.5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>
                </div>

                {/* Info and action panel */}
                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-1.5">
                    {/* Star review summaries */}
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-[10px] font-bold text-slate-500">
                        {averageRating} ({productReviews.length} verification reports)
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 leading-snug transition-colors line-clamp-1">
                      {p.name}
                    </h3>
                    <p className="text-[11px] text-slate-450 leading-relaxed line-clamp-2">
                      {p.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div>
                      <span className="block text-[8px] uppercase tracking-widest text-slate-400 font-bold">Unlocking Cost</span>
                      <span className="text-[15px] font-black font-mono text-slate-800">
                        ₹{p.price.toFixed(2)}
                      </span>
                    </div>

                    {p.type === 'affiliate_product' ? (
                      <a
                        href={p.affiliate_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:opacity-95 text-white font-extrabold text-[11px] px-3.5 py-2.5 flex items-center gap-1 shadow-sm transition active:scale-95"
                      >
                        Referral Redirect
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : isOwned ? (
                      <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-2 text-[10px] font-bold text-emerald-700 border border-emerald-100">
                        <Check className="h-3.5 w-3.5" /> Owned
                      </span>
                    ) : (
                      <button
                        onClick={(e) => handleAddToCart(p, e)}
                        className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] px-4 py-2.5 flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer animate-fadeIn"
                      >
                        Unlock
                        <ArrowRight className="h-3.5 w-3.5 text-blue-100" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAILED MODAL: Product detail specs, review board, and add review fields */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-40 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl border relative animate-fadeIn">
            
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 h-9 w-9 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 flex items-center justify-center border"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            {/* Product description header */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="rounded-2xl overflow-hidden border">
                <img referrerPolicy="no-referrer" src={selectedProduct.image_url} alt={selectedProduct.name} className="w-full object-cover aspect-video" />
              </div>
              <div className="flex flex-col justify-between">
                <div>
                  <span className="rounded-lg bg-blue-50 border border-blue-105 px-2 py-0.5 text-[9px] font-extrabold uppercase text-blue-700 w-fit">
                    {selectedProduct.category}
                  </span>
                  <h2 className="text-lg font-black text-slate-900 mt-2">{selectedProduct.name}</h2>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{selectedProduct.description}</p>
                </div>

                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <div>
                    <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold">Unlocking Fee</span>
                    <span className="text-lg font-black font-mono text-slate-800">₹{selectedProduct.price.toFixed(2)}</span>
                  </div>

                  {selectedProduct.type === 'affiliate_product' ? (
                    <a
                      href={selectedProduct.affiliate_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs px-4 py-2.5 flex items-center gap-1 shadow-sm"
                    >
                      Visit Affiliate site
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : ownedProductIds.includes(selectedProduct.id) ? (
                    <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-800 border border-emerald-100">
                      <Check className="h-4 w-4" /> Package Unlocked
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        handleAddToCart(selectedProduct, e);
                        setSelectedProduct(null);
                      }}
                      className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-3 shadow-md"
                    >
                      Add to checkout
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Verification reviews catalog list */}
            <div className="pt-6 border-t space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Verifications & Integrity Reviews ({reviewsList.filter(r => r.productId === selectedProduct.id).length})</h3>
              
              <div className="space-y-3">
                {reviewsList.filter(r => r.productId === selectedProduct.id).map(rev => (
                  <div key={rev.id} className="p-4 bg-slate-50 rounded-2xl border space-y-1.5 text-xs">
                    <div className="flex justify-between items-center bg-white p-1 rounded-lg px-2 border">
                      <span className="font-extrabold text-slate-800">{rev.author}</span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 text-amber-500 fill-amber-500" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-650 px-2 leading-relaxed">{rev.comment}</p>
                    <span className="block text-[8px] text-right text-slate-400 font-mono">{rev.date}</span>
                  </div>
                ))}

                {reviewsList.filter(r => r.productId === selectedProduct.id).length === 0 && (
                  <p className="text-xs text-slate-400 italic">No verification comments recorded. Be the first to verify integrity!</p>
                )}
              </div>

              {/* Submit a review form */}
              <form onSubmit={handleAddReview} className="bg-slate-50 p-4 rounded-3xl border space-y-3 text-xs">
                <span className="block font-bold text-slate-700">Submit Integrity Report Verification</span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1">Your Title / Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Rivera"
                      value={newReviewAuthor}
                      onChange={(e) => setNewReviewAuthor(e.target.value)}
                      className="w-full rounded-xl bg-white p-2 border focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1">Overall Rating</label>
                    <select
                      value={newReviewRating}
                      onChange={(e) => setNewReviewRating(parseInt(e.target.value))}
                      className="w-full rounded-xl bg-white p-2 border focus:outline-none"
                    >
                      <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                      <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                      <option value="3">⭐⭐⭐ 3 Stars</option>
                      <option value="2">⭐⭐ 2 Stars</option>
                      <option value="1">⭐ 1 Star</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1">Your Detailed Feedback</label>
                  <textarea
                    required
                    placeholder="Describe how this digital asset unlocked value or helped optimize templates..."
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    className="w-full rounded-xl bg-white p-2 border h-16 resize-none focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-slate-900 hover:bg-black text-white font-bold py-2"
                >
                  Post Verification Review
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT DRAWER: Cart elements, selection parameters, and simulated Progress bar tracker */}
      {cartOpen && (
        <div className="fixed inset-y-0 right-0 max-w-sm w-full bg-white z-50 shadow-2xl p-6 border-l flex flex-col justify-between animate-slideLeft">
          
          <div className="space-y-6 flex-1 overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
                Checkout Ledger
              </h3>
              <button
                onClick={() => {
                  setCartOpen(false);
                  setCheckoutStep('cart');
                }}
                className="h-8 w-8 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 flex items-center justify-center border"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* STEP 1: CART REVIEWS */}
            {checkoutStep === 'cart' && (
              <div className="space-y-4">
                {cart.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs font-semibold">Your check bag is empty! Add assets.</div>
                ) : (
                  <div className="space-y-3.5">
                    {cart.map(item => (
                      <div key={item.id} className="flex gap-3 bg-slate-50 p-3 rounded-2xl border items-center justify-between">
                        <img referrerPolicy="no-referrer" src={item.image_url} alt={item.name} className="h-10 w-10 object-cover rounded bg-white shadow-xs border" />
                        <div className="flex-1 min-w-0 px-1">
                          <span className="block text-xs font-bold text-slate-800 truncate">{item.name}</span>
                          <span className="block text-[10px] text-slate-400 font-mono">₹{item.price.toFixed(2)}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="text-slate-400 hover:text-red-650 p-1 rounded hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}

                    <div className="p-4 bg-slate-50 rounded-2xl border space-y-2 mt-4 text-xs font-bold text-slate-700">
                      <div className="flex justify-between">
                        <span>Items Cart Sum</span>
                        <span className="font-mono">₹{cartTotalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-blue-600 border-t pt-2">
                        <span>Grand Total Bill</span>
                        <span className="font-mono">₹{cartTotalAmount.toFixed(2)}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleCheckoutSubmit}
                      className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-750 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md"
                    >
                      Process Payment <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: CHOOSE PAYMENT METHOD AND ENFORCE COMMISSIONS */}
            {checkoutStep === 'payment' && (
              <div className="space-y-5 text-xs">
                <div>
                  <span className="block font-bold text-slate-700 uppercase tracking-wider text-[9px] text-slate-400 mb-2">Configure Ledger Source</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPaymentMethod('wallet')}
                      className={`p-3 rounded-xl border text-center font-bold flex flex-col items-center gap-1 ${
                        paymentMethod === 'wallet'
                          ? 'border-blue-600 bg-blue-50/50 text-blue-900'
                          : 'bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <ShieldCheck className="h-4.5 w-4.5 text-blue-600" />
                      Main Cash Wallet
                    </button>
                    <button
                      onClick={() => setPaymentMethod('razorpay')}
                      className={`p-3 rounded-xl border text-center font-bold flex flex-col items-center gap-1 ${
                        paymentMethod === 'razorpay'
                          ? 'border-blue-600 bg-blue-50/50 text-blue-900'
                          : 'bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Package className="h-4.5 w-4.5 text-indigo-600 animate-pulse" />
                      UPI / Razorpay
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-3.5">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>Payable sum</span>
                    <span className="font-mono text-slate-900">₹{cartTotalAmount.toFixed(2)}</span>
                  </div>
                  {paymentMethod === 'wallet' && (
                    <div className="flex justify-between border-t pt-2 text-[10px] text-slate-500 font-medium">
                      <span>Available Wallet Ledger:</span>
                      <span className="font-mono font-bold">₹{walletBalance.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {paymentMethod === 'razorpay' && (
                  <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-[10px] text-indigo-800 leading-relaxed font-medium">
                    ⚡ Razorpay Live Sandbox Active. Clicking "Finish Purchase" will emulate a standard Razorpay cash intent callback and complete checkout instantly.
                  </div>
                )}

                <button
                  onClick={executeCompletePurchase}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  Finish Purchase of ₹{cartTotalAmount}
                </button>
              </div>
            )}

            {/* STEP 3: ORDER COMPLIANCE & PROGRESS TRACKER */}
            {checkoutStep === 'tracking' && (
              <div className="space-y-6 text-xs text-center pt-4">
                <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm border border-emerald-100 animate-bounce">
                  <Package className="h-6 w-6" />
                </div>
                
                <div>
                  <h4 className="font-black text-slate-900 text-sm">Order Logged Successfully</h4>
                  <p className="text-[10px] text-slate-400 mt-1">Transaction verified. Digital file lock is releasing...</p>
                </div>

                {/* Progress bar */}
                <div className="space-y-4 text-left bg-slate-50 p-4 rounded-3xl border">
                  <div className="flex items-center gap-3">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                      orderTrackingStatus === 'received' || orderTrackingStatus === 'processing' || orderTrackingStatus === 'completed'
                        ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      1
                    </div>
                    <div>
                      <span className="block font-bold text-slate-800">Order Received</span>
                      <span className="block text-[9px] text-slate-400 font-mono">Invoice generated successfully</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                      orderTrackingStatus === 'processing' || orderTrackingStatus === 'completed'
                        ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600 animate-pulse'
                    }`}>
                      2
                    </div>
                    <div>
                      <span className="block font-bold text-slate-800">Fulfillment Verification</span>
                      <span className="block text-[9px] text-slate-400 font-mono">Verifying license codes with server</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                      orderTrackingStatus === 'completed'
                        ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {orderTrackingStatus === 'completed' ? '✓' : '3'}
                    </div>
                    <div>
                      <span className="block font-bold text-slate-800">Completed & Dispatched</span>
                      <span className="block text-[9px] text-slate-400 font-mono">Sent to email. Check download locker.</span>
                    </div>
                  </div>
                </div>

                {orderTrackingStatus === 'completed' && (
                  <div className="space-y-2 animate-fadeIn">
                    <p className="text-[10px] font-mono font-bold text-emerald-600">🎉 Safe checkout execution completed!</p>
                    
                    {latestPurchasedProductId && products.find(p => p.id === latestPurchasedProductId)?.download_file_url && (
                      <a
                        href={products.find(p => p.id === latestPurchasedProductId)?.download_file_url}
                        className="inline-flex w-full justify-center bg-slate-900 text-white font-bold py-2 px-3 rounded-lg hover:bg-black transition-colors"
                        onClick={() => {
                          setCartOpen(false);
                          setCheckoutStep('cart');
                        }}
                      >
                        Download Files Now
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 border-t text-center text-[10px] text-slate-400 select-none">
            🛡️ 256-Bit SSL Sandboxed payment gateway active.
          </div>
        </div>
      )}
    </div>
  );
}
