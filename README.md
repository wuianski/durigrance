# Durigrance

Next.js App Router app: 100 QR codes, each with a one-time name/email registration. The second visit shows a welcome page. Unknown tokens return 404.

Repo: [github.com/wuianski/durigrance](https://github.com/wuianski/durigrance)

## Node version

Use **Node.js 22 LTS** (this project was built with `v22.15.0`).

Next.js 15 also runs on Node 20 LTS. Do not use Node 18 or older.

```bash
node -v   # expect v22.x
```

## Local setup

```bash
cp .env.example .env.local
# set ADMIN_PASSWORD
npm install
npm run seed
npm run dev
```

- Guest page: `http://localhost:3000/u/<token>` (see `qrcodes/tokens.csv`)
- QR landing: `http://localhost:3000/q/<token>` (redirects to `/u/...`)
- Admin: `http://localhost:3000/admin`

`npm run seed` is idempotent. Existing tokens are kept. It writes `qrcodes/001.png` … `100.png` and `qrcodes/tokens.csv`.

Do not print localhost QR codes. Phones will not reach your computer.

## Environment

| Variable | Purpose |
| --- | --- |
| `ADMIN_PASSWORD` | Admin login |
| `QR_BASE_URL` | URL baked into the PNG (`…/q/<token>`). Set this to the public domain **before** you print. Do not change it after printing. |
| `APP_URL` | Public site for `/u/…` pages and `/q/…` redirects |
| `BASE_URL` | Fallback if the two above are unset |

Each machine has its **own** `.env.local` (gitignored). Do not copy the laptop file to the Droplet.

- Laptop: `http://localhost:3000`
- Droplet: `https://your-domain.com` for both `QR_BASE_URL` and `APP_URL`

`/q/<token>` always redirects to `/u/<token>` on the **same host** that received the request, so local and production never mix.

`.env.local`, `data/app.db`, and `qrcodes/` are gitignored.

## Production (DigitalOcean Droplet + PM2)

1. Install Node 22. Own the app directory as the deploy user (not root):

   ```bash
   sudo chown -R "$USER:$USER" /path/to/durigrance
   ```

2. A 1 GB Droplet needs swap for `next build`:

   ```bash
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
   ```

3. Install and build **on the server** (do not copy `node_modules` from a Mac, and do not use `sudo npm`):

   ```bash
   npm ci
   NODE_OPTIONS=--max-old-space-size=1536 npm run build
   ```

4. Run with [PM2](https://pm2.keymetrics.io/) so the app restarts after a reboot or crash:

   ```bash
   npm install -g pm2
   pm2 start npm --name durigrance -- start
   pm2 save
   pm2 startup
   ```

   Useful commands:

   ```bash
   pm2 status
   pm2 logs durigrance
   pm2 restart durigrance
   ```

   After a code update:

   ```bash
   git pull
   npm ci
   NODE_OPTIONS=--max-old-space-size=1536 npm run build
   pm2 restart durigrance
   ```

5. Seed with the public domain, then print those PNGs:

   ```bash
   QR_BASE_URL=https://your-domain.com npm run seed
   ```

Put Caddy or nginx in front for HTTPS. Point the domain `A` record at the Droplet.
