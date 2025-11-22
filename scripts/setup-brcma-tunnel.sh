#!/bin/bash
set -e

# Cloudflare Tunnel Setup Script (API Method)
# Supports both production and staging environments for brcma

ENVIRONMENT=$1  # "production" or "staging"
ACCOUNT_ID=$2
API_TOKEN=$3

if [ -z "$ENVIRONMENT" ] || [ -z "$ACCOUNT_ID" ] || [ -z "$API_TOKEN" ]; then
    echo "Usage: $0 <production|staging> <account_id> <api_token>"
    echo ""
    echo "Example:"
    echo "  $0 production cf_account_id cf_api_token"
    echo ""
    exit 1
fi

if [ "$ENVIRONMENT" != "production" ] && [ "$ENVIRONMENT" != "staging" ]; then
    echo "Usage: $0 <production|staging> <account_id> <api_token>"
    echo ""
    echo "Example:"
    echo "  $0 production cf_account_id cf_api_token"
    echo ""
    exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
    echo "❌ jq is required. Install jq and re-run this script."
    exit 1
fi

TUNNEL_NAME="brcma-${ENVIRONMENT}"
SERVICE_TARGET="http://brcma-nginx:80"

if [ "$ENVIRONMENT" = "production" ]; then
    HOSTNAME="brcma.dependly.app"
    TOKEN_ENV_KEY="CLOUDFLARE_TUNNEL_TOKEN_PROD"
else
    HOSTNAME="brcma-staging.dependly.app"
    TOKEN_ENV_KEY="CLOUDFLARE_TUNNEL_TOKEN_STAGING"
fi

CONFIG_FILE="tunnel-config-${ENVIRONMENT}.json"

echo "🚀 Cloudflare Tunnel Setup for brcma"
echo "===================================="
echo "Environment: $ENVIRONMENT"
echo "Tunnel Name: $TUNNEL_NAME"
echo "Hostname: $HOSTNAME"
echo "Service Target: $SERVICE_TARGET"
echo ""

echo "Creating tunnel: $TUNNEL_NAME"
RESPONSE=$(curl -s "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/cfd_tunnel" \
  -X POST \
  -H "Authorization: Bearer ${API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"${TUNNEL_NAME}\", \"config_src\": \"cloudflare\"}")

TUNNEL_ID=$(echo "$RESPONSE" | jq -r '.result.id')
TUNNEL_TOKEN=$(echo "$RESPONSE" | jq -r '.result.token')

if [ "$TUNNEL_ID" = "null" ] || [ -z "$TUNNEL_ID" ]; then
    echo "❌ Error creating tunnel:"
    echo "$RESPONSE" | jq '.'
    exit 1
fi

echo "✓ Tunnel created successfully!"
echo "Tunnel ID: $TUNNEL_ID"
echo ""

echo "Writing ingress configuration to ${CONFIG_FILE}"
cat > "$CONFIG_FILE" <<EOF_CFG
{
  "config": {
    "ingress": [
      {
        "hostname": "${HOSTNAME}",
        "service": "${SERVICE_TARGET}"
      },
      {
        "service": "http_status:404"
      }
    ]
  }
}
EOF_CFG

# Update tunnel configuration
echo "Updating tunnel configuration..."
CONFIG_RESPONSE=$(curl -s "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/cfd_tunnel/${TUNNEL_ID}/configurations" \
  -X PUT \
  -H "Authorization: Bearer ${API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d @"${CONFIG_FILE}")

if echo "$CONFIG_RESPONSE" | jq -e '.success' >/dev/null && [ "$(echo "$CONFIG_RESPONSE" | jq -r '.success')" = "true" ]; then
    echo "✓ Tunnel configuration updated successfully!"
else
    echo "⚠️  Warning: Configuration update response:"
    echo "$CONFIG_RESPONSE" | jq '.'
fi

echo ""
echo "🎉 Tunnel setup complete!"
echo "======================================="
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Add this to your .env.${ENVIRONMENT} file:"
echo "   ${TOKEN_ENV_KEY}=${TUNNEL_TOKEN}"
echo ""
echo "2. Create DNS CNAME record in Cloudflare pointing to:"
echo "   ${HOSTNAME} → ${TUNNEL_ID}.cfargotunnel.com (Proxied ✓)"
echo ""
echo "3. Deploy or restart the tunnel container:"
echo "   docker compose --profile production up -d brcma-tunnel"
echo ""
echo "4. Verify the tunnel is running:"
echo "   docker compose ps brcma-tunnel"
echo "   docker logs -f brcma-tunnel"
echo ""
echo "5. Test your endpoints:"
echo "   curl -I https://${HOSTNAME}"
echo "   curl -I https://${HOSTNAME}/health"
echo ""
echo "💡 Tip: Configure SSL/TLS mode to 'Full (strict)' in Cloudflare"
echo ""

rm -f "$CONFIG_FILE"
