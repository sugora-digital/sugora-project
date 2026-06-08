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
    <div id="saas-store-main" className="space-y-6 bg-slate-50/20 dark:bg-zinc-955/20 p-1 md:p-4 rounded-3xl font-sans">
      
      {/* Header Grid */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5 border-slate-100 dark:border-zinc-850 bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-sm">
        <div className="text-left font-sans">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <ShoppingCart className="h-6.5 w-6.5 text-blue-600 dark:text-blue-400" />
            Sugora Creator Marketplace
          </h1>
          <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 leading-relaxed">
            Acquire premium checklists, conversion funnels, Figma templates, and partner hosting options directly.
          </p>
        </div>

        {/* Search & Cart Trigger controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative max-w-xs w-full sm:w-60">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search checklist resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-zinc-950 focus:bg-white border border-slate-205 dark:border-zinc-800 outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-zinc-200 font-sans font-medium"
            />
          </div>

          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="rounded-xl px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md border-0 cursor-pointer transition select-none active:scale-95"
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
            type="button"
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition duration-150 cursor-pointer ${
              selectedCategory === cat
                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Store Items Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border dark:border-zinc-800 p-12 text-center text-slate-400 dark:text-zinc-500 font-bold font-sans">
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
                className="group bg-white dark:bg-zinc-900 rounded-3xl border border-slate-105 dark:border-zinc-800/80 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-zinc-700 transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer"
              >
                {/* Visual Image container */}
                <div className="relative aspect-video bg-slate-50 dark:bg-zinc-950 overflow-hidden shrink-0 border-b dark:border-zinc-800">
                  <img
                    referrerPolicy="no-referrer"
                    src={p.image_url}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Category overlay tab */}
                  <span className="absolute top-3 left-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wide text-slate-800 dark:text-zinc-150 shadow-sm border dark:border-zinc-800 select-none">
                    {p.category}
                  </span>

                  {/* Wishlist button */}
                  <button
                    key={`wish-${p.id}`}
                    type="button"
                    onClick={(e) => toggleWishlist(p.id, e)}
                    className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 dark:bg-zinc-900/95 backdrop-blur-md flex items-center justify-center text-slate-450 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-500 transition shadow-sm border dark:border-zinc-800 select-none cursor-pointer"
                  >
                    <Heart className={`h-4.5 w-4.5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>
                </div>

                {/* Info and action panel */}
                <div className="p-5 flex-1 flex flex-col justify-between gap-4 text-left">
                  <div className="space-y-1.5 font-sans">
                    {/* Star review summaries */}
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-500">
                        {averageRating} ({productReviews.length} verification reports)
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-150 group-hover:text-blue-600 dark:group-hover:text-blue-400 leading-snug transition-colors line-clamp-1">
                      {p.name}
                    </h3>
                    <p className="text-[11px] text-slate-455 dark:text-zinc-400 leading-relaxed line-clamp-2">
                      {p.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-50 dark:border-zinc-850 flex items-center justify-between font-sans">
                    <div>
                      <span className="block text-[8px] uppercase tracking-widest text-slate-400 dark:text-zinc-500 font-bold">Unlocking Cost</span>
                      <span className="text-[15px] font-black font-mono text-slate-800 dark:text-zinc-150">
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
                      <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 select-none">
                        <Check className="h-3.5 w-3.5" /> Owned
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(p, e)}
                        className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] px-4 py-2.5 flex items-center gap-1.5 shadow-sm border-0 cursor-pointer transition active:scale-95 select-none"
                      >
                        Unlock
                        <ArrowRight className="h-3.5 w-3.5 text-blue-105" />
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
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 z-40 overflow-y-auto font-sans">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-2xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl border dark:border-zinc-800 relative animate-fadeIn">
            
            <button
              type="button"
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 h-9 w-9 rounded-xl bg-slate-50 dark:bg-zinc-950 hover:bg-slate-100 dark:hover:bg-zinc-850 text-slate-500 dark:text-zinc-400 flex items-center justify-center border dark:border-zinc-800 cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            {/* Product description header */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-left">
              <div className="rounded-2xl overflow-hidden border dark:border-zinc-800">
                <img referrerPolicy="no-referrer" src={selectedProduct.image_url} alt={selectedProduct.name} className="w-full object-cover aspect-video" />
              </div>
              <div className="flex flex-col justify-between">
                <div className="font-sans">
                  <span className="rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-105 dark:border-blue-900/50 px-2 py-0.5 text-[9px] font-extrabold uppercase text-blue-700 dark:text-blue-400 w-fit select-none">
                    {selectedProduct.category}
                  </span>
                  <h2 className="text-lg font-black text-slate-900 dark:text-zinc-150 mt-2">{selectedProduct.name}</h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2 leading-relaxed">{selectedProduct.description}</p>
                </div>

                <div className="mt-4 pt-4 border-t dark:border-zinc-800 flex items-center justify-between font-sans">
                  <div>
                    <span className="block text-[8px] uppercase tracking-wider text-slate-400 dark:text-zinc-505 font-bold">Unlocking Fee</span>
                    <span className="text-lg font-black font-mono text-slate-800 dark:text-zinc-150">₹{selectedProduct.price.toFixed(2)}</span>
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
                    <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 dark:bg-emerald-905/20 px-4 py-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-990/40 select-none">
                      <Check className="h-4 w-4" /> Package Unlocked
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        handleAddToCart(selectedProduct, e);
                        setSelectedProduct(null);
                      }}
                      className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-3 shadow-md border-0 cursor-pointer"
                    >
                      Add to checkout
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Verification reviews catalog list */}
            <div className="pt-6 border-t dark:border-zinc-800 space-y-4 text-left font-sans">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Verifications & Integrity Reviews ({reviewsList.filter(r => r.productId === selectedProduct.id).length})</h3>
              
              <div className="space-y-3">
                {reviewsList.filter(r => r.productId === selectedProduct.id).map(rev => (
                  <div key={rev.id} className="p-4 bg-slate-50 dark:bg-zinc-950 p-4 rounded-2xl border dark:border-zinc-800 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-1 rounded-lg px-2 border dark:border-zinc-805">
                      <span className="font-extrabold text-slate-800 dark:text-zinc-200">{rev.author}</span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 text-amber-500 fill-amber-500" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-650 dark:text-zinc-400 px-2 leading-relaxed font-semibold">{rev.comment}</p>
                    <span className="block text-[8px] text-right text-slate-400 dark:text-zinc-500 font-mono">{rev.date}</span>
                  </div>
                ))}

                {reviewsList.filter(r => r.productId === selectedProduct.id).length === 0 && (
                  <p className="text-xs text-slate-400 dark:text-zinc-500 italic">No verification comments recorded. Be the first to verify integrity!</p>
                )}
              </div>

              {/* Submit a review form */}
              <form onSubmit={handleAddReview} className="bg-slate-50 dark:bg-zinc-950/60 p-4 rounded-3xl border dark:border-zinc-800 space-y-3 text-xs leading-relaxed font-sans font-semibold">
                <span className="block font-bold text-slate-705 dark:text-zinc-200 uppercase tracking-wide text-[9.5px]">Submit Integrity Report Verification</span>
                
                <div className="grid grid-cols-2 gap-3 font-sans">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-bold mb-1">Your Title / Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Rivera"
                      value={newReviewAuthor}
                      onChange={(e) => setNewReviewAuthor(e.target.value)}
                      className="w-full rounded-xl bg-white dark:bg-zinc-900 p-2 border dark:border-zinc-800 focus:outline-none text-slate-808 dark:text-zinc-150"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-bold mb-1">Overall Rating</label>
                    <select
                      value={newReviewRating}
                      onChange={(e) => setNewReviewRating(parseInt(e.target.value))}
                      className="w-full rounded-xl bg-white dark:bg-zinc-900 p-2 border dark:border-zinc-800 focus:outline-none text-slate-808 dark:text-zinc-155"
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
                  <label className="block text-[9px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-bold mb-1">Your Detailed Feedback</label>
                  <textarea
                    required
                    placeholder="Describe how this digital asset unlocked value or helped optimize templates..."
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    className="w-full rounded-xl bg-white dark:bg-zinc-900 p-2 border dark:border-zinc-808 h-16 resize-none focus:outline-none text-slate-805 dark:text-zinc-150 leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-slate-900 hover:bg-black dark:bg-zinc-800 dark:hover:bg-zinc-750 text-white font-bold py-2 border-0 cursor-pointer font-sans"
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
        <div className="fixed inset-y-0 right-0 max-w-sm w-full bg-white dark:bg-zinc-900 z-50 shadow-2xl p-6 border-l dark:border-zinc-800 flex flex-col justify-between animate-slideLeft font-sans">
          
          <div className="space-y-6 flex-1 overflow-y-auto">
            <div className="flex justify-between items-center border-b dark:border-zinc-800 pb-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-zinc-150 flex items-center gap-1.5">
                <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Checkout Ledger
              </h3>
              <button
                type="button"
                onClick={() => {
                  setCartOpen(false);
                  setCheckoutStep('cart');
                }}
                className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-zinc-950 hover:bg-slate-100 dark:hover:bg-zinc-850 text-slate-500 dark:text-zinc-400 flex items-center justify-center border dark:border-zinc-800 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* STEP 1: CART REVIEWS */}
            {checkoutStep === 'cart' && (
              <div className="space-y-4 font-sans text-left">
                {cart.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 dark:text-zinc-500 text-xs font-semibold">Your check bag is empty! Add assets.</div>
                ) : (
                  <div className="space-y-3.5">
                    {cart.map(item => (
                      <div key={item.id} className="flex gap-3 bg-slate-50 dark:bg-zinc-950 p-3 rounded-2xl border dark:border-zinc-800 items-center justify-between">
                        <img referrerPolicy="no-referrer" src={item.image_url} alt={item.name} className="h-10 w-10 object-cover rounded bg-white dark:bg-zinc-900 shadow-xs border dark:border-zinc-810" />
                        <div className="flex-1 min-w-0 px-1 font-sans">
                          <span className="block text-xs font-bold text-slate-805 dark:text-zinc-200 truncate">{item.name}</span>
                          <span className="block text-[10px] text-slate-400 dark:text-zinc-500 font-mono">₹{item.price.toFixed(2)}</span>
                        </div>
                        <button
                          key={`del-cart-${item.id}`}
                          type="button"
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="text-slate-405 hover:text-red-650 dark:hover:text-red-400 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer border-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}

                    <div className="p-4 bg-slate-50 dark:bg-zinc-950 rounded-2xl border dark:border-zinc-850 space-y-2 mt-4 text-xs font-bold text-slate-700 dark:text-zinc-330">
                      <div className="flex justify-between">
                        <span>Items Cart Sum</span>
                        <span className="font-mono">₹{cartTotalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-blue-600 dark:text-blue-400 border-t dark:border-zinc-800 pt-2">
                        <span>Grand Total Bill</span>
                        <span className="font-mono">₹{cartTotalAmount.toFixed(2)}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleCheckoutSubmit}
                      className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md border-0 cursor-pointer transition select-none"
                    >
                      Process Payment <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: CHOOSE PAYMENT METHOD AND ENFORCE COMMISSIONS */}
            {checkoutStep === 'payment' && (
              <div className="space-y-5 text-xs text-left font-sans">
                <div>
                  <span className="block font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider text-[9px] mb-2">Configure Ledger Source</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('wallet')}
                      className={`p-3 rounded-xl border dark:border-zinc-800 text-center font-bold flex flex-col items-center gap-1 cursor-pointer select-none transition ${
                        paymentMethod === 'wallet'
                          ? 'border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-400'
                          : 'bg-white dark:bg-zinc-950 text-slate-605 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-850'
                      }`}
                    >
                      <ShieldCheck className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
                      Main Cash Wallet
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('razorpay')}
                      className={`p-3 rounded-xl border dark:border-zinc-800 text-center font-bold flex flex-col items-center gap-1 cursor-pointer select-none transition ${
                        paymentMethod === 'razorpay'
                          ? 'border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-400'
                          : 'bg-white dark:bg-zinc-950 text-slate-605 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-850'
                      }`}
                    >
                      <Package className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400 animate-pulse animate-none" />
                      UPI / Razorpay
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-zinc-950 border border-slate-150 dark:border-zinc-850 rounded-2xl space-y-3.5 leading-relaxed font-semibold">
                  <div className="flex justify-between font-bold text-slate-700 dark:text-zinc-300">
                    <span>Payable sum</span>
                    <span className="font-mono text-slate-900 dark:text-zinc-100">₹{cartTotalAmount.toFixed(2)}</span>
                  </div>
                  {paymentMethod === 'wallet' && (
                    <div className="flex justify-between border-t dark:border-zinc-800 pt-2 text-[10px] text-slate-500 dark:text-zinc-500 font-medium font-sans">
                      <span>Available Wallet Ledger:</span>
                      <span className="font-mono font-bold">₹{walletBalance.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {paymentMethod === 'razorpay' && (
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-xl text-[10px] text-indigo-808 dark:text-indigo-400 leading-relaxed font-semibold">
                    ⚡ Razorpay Live Sandbox Active. Clicking "Finish Purchase" will emulate a standard Razorpay cash intent callback and complete checkout instantly.
                  </div>
                )}

                <button
                  type="button"
                  onClick={executeCompletePurchase}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs border-0 cursor-pointer"
                >
                  Finish Purchase of ₹{cartTotalAmount}
                </button>
              </div>
            )}

            {/* STEP 3: ORDER COMPLIANCE & PROGRESS TRACKER */}
            {checkoutStep === 'tracking' && (
              <div className="space-y-6 text-xs text-center pt-4 font-sans">
                <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-950/45 text-emerald-600 dark:text-emerald-450 flex items-center justify-center mx-auto shadow-sm border border-emerald-100 dark:border-emerald-900/40 animate-none">
                  <Package className="h-6 w-6" />
                </div>
                
                <div className="text-center font-sans">
                  <h4 className="font-black text-slate-900 dark:text-zinc-150 text-sm">Order Logged Successfully</h4>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-505 mt-1 leading-relaxed">Transaction verified. Digital file lock is releasing...</p>
                </div>

                {/* Progress bar */}
                <div className="space-y-4 text-left bg-slate-50 dark:bg-zinc-950 p-4 rounded-3xl border dark:border-zinc-800 font-sans">
                  <div className="flex items-center gap-3">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-[10px] select-none ${
                      orderTrackingStatus === 'received' || orderTrackingStatus === 'processing' || orderTrackingStatus === 'completed'
                        ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                    }`}>
                      1
                    </div>
                    <div>
                      <span className="block font-bold text-slate-800 dark:text-zinc-200">Order Received</span>
                      <span className="block text-[9px] text-slate-400 dark:text-zinc-500 font-mono">Invoice generated successfully</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-[10px] select-none ${
                      orderTrackingStatus === 'processing' || orderTrackingStatus === 'completed'
                        ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-zinc-800 text-slate-600'
                    }`}>
                      2
                    </div>
                    <div>
                      <span className="block font-bold text-slate-800 dark:text-zinc-200">Fulfillment Verification</span>
                      <span className="block text-[9px] text-slate-400 dark:text-zinc-505 font-mono">Verifying license codes with server</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-[10px] select-none ${
                      orderTrackingStatus === 'completed'
                        ? 'bg-green-600 text-white' : 'bg-slate-200 dark:bg-zinc-800 text-slate-605'
                    }`}>
                      {orderTrackingStatus === 'completed' ? '✓' : '3'}
                    </div>
                    <div>
                      <span className="block font-bold text-slate-800 dark:text-zinc-200">Completed & Dispatched</span>
                      <span className="block text-[9px] text-slate-400 dark:text-zinc-505 font-mono">Sent to email. Check download locker.</span>
                    </div>
                  </div>
                </div>

                {orderTrackingStatus === 'completed' && (
                  <div className="space-y-2 animate-fadeIn font-sans">
                    <p className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">🎉 Safe checkout execution completed!</p>
                    
                    {latestPurchasedProductId && products.find(p => p.id === latestPurchasedProductId)?.download_file_url && (
                      <a
                        href={products.find(p => p.id === latestPurchasedProductId)?.download_file_url}
                        className="inline-flex w-full justify-center bg-slate-900 dark:bg-zinc-800 hover:bg-black dark:hover:bg-zinc-700 text-white font-bold py-2 px-3 rounded-lg transition-colors border-0 text-xs"
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

          <div className="pt-4 border-t dark:border-zinc-800 text-center text-[10px] text-slate-400 select-none font-sans">
            🛡️ 256-Bit SSL Sandboxed payment gateway active.
          </div>
        </div>
      )}
    </div>
  );
}
