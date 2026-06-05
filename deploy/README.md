# Deploying Hang Guy behind nginx (Proxmox)

Two moving parts, one domain:

```
                ┌─────────────────────── your Proxmox LXC/VM ───────────────────────┐
  browser  ──►  nginx :80 ──┬──►  static files  (client/dist on disk)                │
                            └──►  /socket.io/  ──►  Node backend :3001 (systemd)      │
                └──────────────────────────────────────────────────────────────────┘
```

## 1. Build the client (static bundle)

The socket URL is baked in **at build time**, so it must point at your public domain
(same-origin keeps CORS out of the picture):

```bash
cd client
VITE_SERVER_URL=http://hangguy.example.com npm run build
sudo mkdir -p /var/www/hangguy
sudo cp -r dist/* /var/www/hangguy/
```

> Using a LAN IP instead of a domain? Use `VITE_SERVER_URL=http://192.168.1.x`
> and set the same value for `server_name` / `CORS_ORIGIN` below.

## 2. Run the server (systemd)

```bash
# on the server, with the repo at /opt/hangguy-game
cd /opt/hangguy-game/server && npm install
sudo cp ../deploy/hangguy-server.service /etc/systemd/system/
# edit WorkingDirectory + CORS_ORIGIN in the unit if your paths/domain differ
sudo systemctl daemon-reload
sudo systemctl enable --now hangguy-server
```

## 3. Wire up nginx

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/hangguy
sudo ln -s /etc/nginx/sites-available/hangguy /etc/nginx/sites-enabled/hangguy
sudo nginx -t && sudo systemctl reload nginx
```

## 4. Verify

```bash
curl -s http://hangguy.example.com/                      # → index.html
curl -s http://hangguy.example.com/socket.io/?EIO=4&transport=polling   # → "0{...sid...}"
```

The second curl hitting the Node handshake (not a 404) proves the proxy works.

## The three values that MUST agree

| Place                    | Value                          |
|--------------------------|--------------------------------|
| `VITE_SERVER_URL` (build)| `http://hangguy.example.com`   |
| `CORS_ORIGIN` (systemd)  | `http://hangguy.example.com`   |
| `server_name` (nginx)    | `hangguy.example.com`          |

If they don't match, the socket connects but the server rejects it on CORS.

## HTTPS (recommended)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d hangguy.example.com
```

certbot rewrites the nginx block to `listen 443 ssl`. After that, switch the two
`http://` values above to `https://` and rebuild the client.
