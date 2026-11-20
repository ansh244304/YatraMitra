# Yatra Mitra backend (simple version)

## Run it

```powershell
cd backend
npm install
copy .env.example .env
npm run dev
```

Set `MONGODB_URL` and `JWT_SECRET` in `.env`. The API runs at `http://localhost:8787/api`.
If MongoDB reports `querySrv ECONNREFUSED`, set `MONGODB_DNS_SERVERS` to DNS server addresses allowed by your network, separated by commas (for example, `1.1.1.1,8.8.8.8`).

## Folder layout

- `server.js` - starts Express and connects to MongoDB
- `db.js` - MongoDB connection
- `middleware/auth.js` - simple JWT check (token lasts 7 days)
- `models/User.js` - user accounts
- `models/Item.js` - one small collection for all saved data; `type` says what the item is (`trip`, `wishlist`, `history`, `review`, `packing`, `booking`, `recent`, `search`, `notification`)
- `controllers/` - all the request logic lives here
- `routes/` - one route file per feature; `api.js` connects them to the API
- `data/destinations.js` - built-in destination list

## Authentication

`POST /api/auth/register` and `POST /api/auth/login` return `{ user, accessToken }`.
The frontend stores the token and sends it as `Authorization: Bearer <accessToken>` on protected requests. Tokens last 7 days; after expiry, log in again.

## AI trip plan

`POST /api/ai/plan` works without any API key and returns a simple local plan.
Add `GEMINI_API_KEY` or `OPENAI_API_KEY` to `.env` to get AI-generated suggestions.
