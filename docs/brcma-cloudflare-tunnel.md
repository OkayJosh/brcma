# Production Cloudflare Tunnel for `brcma.dependly.app`

These steps create and register a Cloudflare Tunnel dedicated to the `brcma` subdomain so production traffic reaches the Dockerized stack that listens on `localhost:8080` (served by the `brcma-nginx` container). The tunnel itself runs inside the existing `brcma-tunnel` service defined in `docker-compose.yml` and uses the `cloudflare/cloudflared:latest` image.

## Prerequisites
- Access to the `dependly.app` zone in Cloudflare with permission to manage tunnels and DNS.
- A production host where the containers from this repo run (Docker + docker-compose).
- Ability to store production secrets (e.g., `.env.production`) and restart services on that host.

## 1. Create a new Cloudflare Tunnel
1. Authenticate once from any machine that has `cloudflared` installed (your laptop is fine):
   ```bash
   cloudflared tunnel login
   ```
2. Create a dedicated production tunnel and note its UUID (Cloudflare prints it):
   ```bash
   cloudflared tunnel create brcma-prod
   ```
3. In the Cloudflare dashboard open **Zero Trust → Access → Tunnels → brcma-prod → Configure** and generate a Scoped Token with permissions **Account: Cloudflare Tunnel → Edit**. Copy the token value and store it in your secret manager as `CLOUDFLARE_TUNNEL_TOKEN_PROD` (this is what the Docker service will read).

## 2. Add a new ingress rule for the service
Inside the Cloudflare dashboard, add an ingress rule under the `brcma-prod` tunnel that points the hostname to the internal Nginx listener (port `8080` from `docker-compose.yml`). Configure the rule as follows:

- **Public hostname:** `brcma.dependly.app`
- **Service:** `http://host.docker.internal:8080` (use `http://localhost:8080` if Docker runs directly on the host without host networking)
- Leave the automatic fallback rule (`http_status:404`) at the bottom

Add additional rules above the fallback if the tunnel will front more services later.

## 3. Connect the tunnel to Cloudflare via Docker
1. Store the token value from step 1 in your production `.env.production` (or secrets store) using the variable name `CLOUDFLARE_TUNNEL_TOKEN_PROD`.
2. Deploy the tunnel container and confirm it connects:
   ```bash
   docker compose --profile production up -d brcma-tunnel
   docker logs -f brcma-tunnel   # look for "Connected" messages
   ```
   The `docker-compose.yml` runs `cloudflared tunnel --no-autoupdate run --token ${CLOUDFLARE_TUNNEL_TOKEN_PROD}`, so as soon as the token is valid the container will establish the connection. The included healthcheck probes `http://localhost:2000/ready`; you can hit it manually if needed: `curl -sf http://localhost:2000/ready`.
3. Once the tunnel is healthy, start or restart the rest of the production stack so Nginx is listening on `8080`:
   ```bash
   docker compose --profile production up -d
   ```

## 4. Add the DNS record automatically for `brcma.dependly.app`
1. Let Cloudflare create the CNAME routing record pointing to the tunnel:
   ```bash
   cloudflared tunnel route dns brcma-prod brcma.dependly.app
   ```
   This command creates (or updates) the proxied DNS entry inside the `dependly.app` zone.
2. Verify the record exists and resolves to `brcma-prod.cfargotunnel.com`:
   ```bash
   dig +short brcma.dependly.app
   ```
3. Once DNS propagates, hit the HTTPS endpoint and confirm the upstream service responds:
   ```bash
   curl -I https://brcma.dependly.app/health
   ```

## Operational tips
- Anytime the upstream port or hostname changes, update the tunnel's ingress rule in the Cloudflare dashboard and restart the `brcma-tunnel` container (`docker compose restart brcma-tunnel`).
- Rotate the tunnel credentials if compromised by deleting/recreating the tunnel (`cloudflared tunnel delete brcma-prod`) and repeating these steps, then update the stored token.
- If you need zero downtime while updating, spin up a secondary tunnel and swap the DNS record using `cloudflared tunnel route dns`.

## Troubleshooting
- **Error: `Incorrect Usage: flag needs an argument: -token`** – the tunnel container started without the `CLOUDFLARE_TUNNEL_TOKEN_PROD` environment variable populated. Double-check the `.env.production` file (or secrets manager) contains `CLOUDFLARE_TUNNEL_TOKEN_PROD=<token>` with no surrounding quotes and restart the container: `docker compose --profile production up -d brcma-tunnel`.
- Verify the variable is making it into the container: `docker compose config | grep -A2 CLOUDFLARE_TUNNEL_TOKEN_PROD`. If the line is blank, export it in your shell or point `docker compose` at the correct `.env` file.
- If the token changed, restart the service after updating the env file so the new value is injected.
