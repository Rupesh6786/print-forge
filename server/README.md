# PrintForge API (DigitalOcean)

Node + Express backend that:
- Connects to **Hostinger MySQL** (see `database/mysql.sql`)
- Verifies **Firebase ID tokens** sent by the frontend as `Authorization: Bearer <token>`
- Stores product images and STL files as **BLOBs** in MySQL
- Exposes admin CRUD for products / orders / quotes / enquiries / users / settings

## Deploy on DigitalOcean (Droplet)

```bash
# On the droplet
git clone <your repo> printforge && cd printforge/server
cp .env.example .env       # fill in DB + Firebase values
npm install
node index.js              # or: pm2 start index.js --name printforge-api
```

Open port `8080` in the droplet firewall (or put nginx in front).
On Hostinger → **Databases → Remote MySQL** → whitelist the droplet's public IP.

## Frontend wiring

In Lovable set:
```
VITE_API_URL=https://api.your-domain.com
```
The frontend (`src/services/api.ts`) already attaches the Firebase ID token.
