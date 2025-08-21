#!/bin/bash

echo "Fixing nginx configuration for LiveKit subdomain..."

# Backup current config
sudo cp /etc/nginx/sites-enabled/livekit /etc/nginx/sites-enabled/livekit.backup

# Create the fixed livekit config with the missing connection_upgrade map
sudo tee /etc/nginx/sites-enabled/livekit > /dev/null << 'EOF'
# WebSocket connection upgrade map (REQUIRED for WebSocket proxying)
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

server {
  server_name livekit.miyov.io;

  location / {
    proxy_pass http://127.0.0.1:7880;
    proxy_http_version 1.1;
    
    # WebSocket upgrade headers
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    
    # Standard proxy headers
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # WebSocket timeout settings
    proxy_read_timeout 86400;
    proxy_send_timeout 86400;
    
    # Disable buffering for real-time communication
    proxy_buffering off;
  }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/livekit.miyov.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/livekit.miyov.io/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

server {
    if ($host = livekit.miyov.io) {
        return 301 https://$host$request_uri;
    }

  listen 80;
  server_name livekit.miyov.io;
    return 404;
}
EOF

# Test nginx configuration
echo "Testing nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid!"
    echo "Reloading nginx..."
    sudo systemctl reload nginx
    echo "✅ Nginx reloaded successfully!"
    echo ""
    echo "Your LiveKit subdomain should now work at: wss://livekit.miyov.io"
else
    echo "❌ Nginx configuration has errors!"
    echo "Restoring backup..."
    sudo cp /etc/nginx/sites-enabled/livekit.backup /etc/nginx/sites-enabled/livekit
    echo "Please check the errors above and fix manually."
    exit 1
fi
