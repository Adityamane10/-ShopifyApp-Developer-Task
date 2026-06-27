# Announcement App — Shopify Admin + Storefront Banner

A Shopify app that lets merchants manage a live announcement banner from their admin dashboard. Built with the MERN stack (MongoDB, Express, React, Node.js) and the Shopify Admin API.

## Tech Stack

| Layer        | Technology                                                    |
|-------------|---------------------------------------------------------------|
| **Frontend** | React 18, Polaris Web Components, React Router v7             |
| **Backend**  | Express (production server), React Router v7 (dev server)     |
| **Database** | MongoDB (via Mongoose) for audit history, SQLite (via Prisma) for OAuth sessions |
| **Shopify**  | Admin GraphQL API (`metafieldsSet`), App Embed Block (Liquid) |
| **Deploy**   | Render (Web Service), MongoDB Atlas                           |

## Architecture

```
Merchant types announcement in Admin Dashboard
       │
       ▼
React Router action (app/routes/app.announcement.jsx)
       │
       ├──► MongoDB ← announcement saved to collection
       │
       └──► Shopify Metafields GraphQL API
                │
                ▼
         Shop Metafield (my_app.announcement) updated
                │
                ▼
         Storefront reads via Liquid (announcement-banner Extension)
```

## Features

- **Admin Dashboard** — embedded in Shopify admin, textarea + Save button
- **MongoDB Audit** — every announcement is timestamped and stored
- **Shopify Metafield Sync** — writes to `shop.metafields.my_app.announcement`
- **Storefront Banner** — fixed-top banner via App Embed Block, editable in Theme Editor
- **Express Production Server** — serves the React Router build on Render

## Prerequisites

- Node.js >=22.12
- MongoDB (local or Atlas)
- Shopify Partners account + dev store
- Shopify CLI

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment

Create `.env` in the project root:

```env
MONGODB_URI=mongodb://localhost:27017/Shopity_App_Developer_Task
```

### 3. Run the app

```bash
shopify app dev
```

This starts the Vite dev server, creates a Cloudflare tunnel, and launches the theme extension server.

### 4. Install the app

1. Press **P** in the terminal to open the Preview URL
2. Click **Install** to authorize the app on your dev store
3. Navigate to **Apps → announcement-app → Announcement Manager**
4. Type a message and click **Save**
5. Open your storefront to see the banner live

## Production (Render)

### Build

```bash
npm run build
```

### Environment Variables (set on Render)

| Variable          | Value                                                              |
|------------------|--------------------------------------------------------------------|
| `MONGODB_URI`    | MongoDB Atlas connection string                                    |
| `SHOPIFY_API_KEY` | Client ID from Partners dashboard                                 |
| `SHOPIFY_API_SECRET` | Client Secret from Partners dashboard                          |
| `SHOPIFY_APP_URL` | `https://shopifyapp-developer-task.onrender.com`                  |
| `SCOPES`         | `write_products,read_products,write_metaobjects,write_metaobject_definitions` |
| `NODE_ENV`       | `production`                                                       |

### Deployment Steps

1. Push code to a **public GitHub repository**
2. In **Render Dashboard** → **New Web Service** → connect your repo
3. Set:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
4. Add all environment variables above
5. In **Shopify Partners Dashboard**, update:
   - **App URL**: `https://shopifyapp-developer-task.onrender.com`
   - **Allowed redirection URL(s)**: `https://shopifyapp-developer-task.onrender.com/auth`
6. In **MongoDB Atlas** → **Network Access** → add `0.0.0.0/0`

### Access for Evaluation

> **Important:** This app is in **development mode** with **Custom distribution** (not published). Only the developer's store can authorize it. To access the app, the evaluator **must** be added as a collaborator on the development store.

**Collaborator access has been granted to:** `careers@futureblinkmail.xyz`

**Steps to access:**
1. Visit `https://shopifyapp-developer-task.onrender.com`
2. Enter shop domain: `test-store-b3skqtoj.myshopify.com`
3. Click **Log in** → redirected to Shopify to authorize
4. After authorization, the app opens in your Shopify admin

## Project Structure

```
├── app/
│   ├── routes/
│   │   ├── app.announcement.jsx   # Admin dashboard page
│   │   ├── api.announcement.jsx   # REST API fallback route
│   │   ├── app.jsx                # Layout with AppProvider
│   │   └── ...
│   ├── services/
│   │   ├── announcement.server.js # Save + sync metafield logic
│   │   └── mongodb.server.js      # MongoDB connection
│   ├── models/
│   │   └── Announcement.server.js # Mongoose schema
│   └── shopify.server.js          # Shopify app config
├── extensions/
│   └── announcement-banner/       # Theme App Extension (Liquid)
├── server/
│   └── index.js                   # Express production server
├── prisma/
│   └── schema.prisma              # Prisma schema (SQLite sessions)
└── shopify.app.toml               # Shopify app config
```

## Notes

- SQLite session storage is ephemeral on Render — sessions are lost on restart. This is acceptable for a demo.
- The Express server handles both API routing and React Router proxying in production.
- The Theme App Extension allows merchants to enable/disable the banner from the Theme Editor.
