# Sugora Link-Builder Migration Guide
### Connect Next.js 15 + Supabase + Razorpay + Vercel Deployment for sugora.com

This directory contains a **production-ready full-stack layout** configured specifically for **Sugora.com's** core architecture. Follow this step-by-step guide to move your current React client codebase into an enterprise-ready, real-time platform with infinite scalability on Supabase, Vercel, and Razorpay.

---

## 🛠️ Step 1. Supabase Initialization (PostgreSQL, Auth, Storage, Realtime)

1. **Create a Supabase Project**:
   - Go to [Supabase Dashboard](https://supabase.com) and create a new project.
   - Set database password, choose your region (e.g. Asia Pacific - Mumbai, Singapore, or US East).

2. **Run Database Migration Script (`supabase_schema.sql`)**:
   - Inside your project, navigate to **SQL Editor > New Query**.
   - Copy the entire contents of `supabase_schema.sql` (found in the root directory of this repository) and click **Run**.
   - This creates all PostgreSQL schemas, Row Level Security (RLS) configurations, trigger functions (`handle_new_user()`), and links your `profiles` table to Supabase Auth (`auth.users(id)`) automatically.

3. **Configure Storage Buckets**:
   - In Supabase, open **Storage > New Bucket**.
   - Create the following three buckets:
     * `avatars`: Public read access (for user avatars).
     * `products`: Public read access (for digital product previews and covers).
     * `kyc`: Protected private bucket (for Aadhaar, PAN card, and selfie uploads).
   - Click **Allow Public Access** for `avatars` and `products`. For `kyc`, configure custom RLS permissions to restrict read authorization to administrators and support agents only.

4. **Enable Database Real-time**:
   - To make chat rooms instantly responsive across user interfaces, enable Replication on the `chat_messages` table.
   - Go to **Database > Replication** in Supabase, toggle **Source: postgres**, navigate to tables list and toggle **chat_messages** to `Enabled`.

---

## 💳 Step 2. Razorpay & Dodo Payments Gateway Integration

1. **Activate Razorpay Dashboard**:
   - Sign up at [Razorpay Developer Portal](https://razorpay.com).
   - Switch to **Test Mode** (or Live Mode when launch-ready).
   - Go to **Account & Settings > API Keys > Generate Key**.
   - Save your `Key ID` and `Key Secret` privately.

2. **Dodo Payments Setup**:
   - Sign up at [Dodo Payments Dashboard](https://dodopayments.com).
   - Generate your API token under the settings panel.
   - Save your `DODO_PAYMENTS_API_KEY` to configure backend checkout links dynamically for international clients, card processing, or local alternative payments.

3. **Inject Webhook Listeners (Optional but Recommended)**:
   - To securely confirm orders even if a browser is closed mid-checkout, set up a Razorpay or Dodo Payments Webhook.
   - Point the Webhook URL to: `https://sugora.com/api/payment-webhook`
   - Subscribe to the dynamic events like `payment.captured` (Razorpay) or `payment.succeeded` (Dodo Payments) and set helper secrets.

---

## 🚀 Step 3. Next.js 15 Backend-Frontend Architecture

This folder contains a pre-built template with Next.js 15 App Router paradigms.

- **`src/lib/supabase.ts`**: Handles seamless, isomorphic Supabase Client generation with credentials proxy.
- **`src/app/api/razorpay/route.ts`**: Automatically communicates order instantiation with Razorpay's Node.js SDK and validates HMAC-SHA256 callback signatures server-side.
- **`src/app/api/chat/route.ts`**: Runs secure server-side Gemini 1.5/2.5/3.5-flash context matching, protecting API keys from browser inspection.

### Recommended Environment Variables for Vercel Configuration:

```env
# SUPABASE PARAMETERS
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# RAZORPAY CONFIG
RAZORPAY_KEY_ID="rzp_test_yourKeyID"
RAZORPAY_KEY_SECRET="yourSecretValue"

# DODO PAYMENTS CONFIG
DODO_PAYMENTS_API_KEY="your-dodo-api-key"

# GEMINI SYSTEM CONFIG
GEMINI_API_KEY="your-gemini-ai-key"
```

---

## 🌐 Step 4. Vercel Deployment & Domain DNS Link Setup (`sugora.com`)

1. **Import Project to GitHub**:
   - Commit files to a private/public GitHub repository.

2. **Deploy on Vercel**:
   - Create a project on [Vercel](https://vercel.com) and link your GitHub repository.
   - Paste the environment variables defined in **Step 3** into the Vercel **Environment Variables** configuration area.
   - Select the Framework option as **Next.js** and click **Deploy**.

3. **Map custom domain (`sugora.com`)**:
   - In Vercel, open **Project Settings > Domains**.
   - Input your root domain name: `sugora.com`.
   - Update your domain provider's DNS records (GoDaddy, Namecheap, Route 53):
     * **A Record** pointing to Vercel's IP address: `76.76.21.21` (or **CNAME** pointing to `cname.vercel-dns.com` for subdomain `www.sugora.com`).
   - Let Vercel auto-provision clean, secure SSL certificates for your host parameters.

---

## 📱 Step 5. Migrating your Front-End UI Code

1. Move custom pages from your client-only `/src/components/*` files into corresponding App Router routes:
   - For link-tree rendering (`sugora.com/u/[username]`): Create `/src/app/u/[username]/page.tsx` utilizing dynamic routing.
   - For affiliate links: Create `/src/app/ref/[code]/route.ts` to log click actions with an SQL callback, redirecting surfers instantly.
   - Use React Hooks (`useEffect` or `@supabase/ssr` callbacks) to update local wallets or read database states in real-time.
