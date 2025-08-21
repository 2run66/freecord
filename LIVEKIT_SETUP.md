# Self-Hosted LiveKit Setup for miyov.io

This guide will help you set up a self-hosted LiveKit server for your Freecord application.

## Prerequisites

- Docker and Docker Compose installed
- Domain `miyov.io` pointing to your server's IP address
- SSL certificate for `miyov.io` (see SSL Setup section)

## 1. Generate LiveKit API Keys

Run the provided script to generate your LiveKit API keys:

```bash
./generate-livekit-keys.sh
```

This will output something like:
```
API_KEY: APIfoo...
API_SECRET: bar...
```

## 2. Create Your .env File

Copy the template and fill in your credentials:

```bash
cp env.template .env
```

Edit `.env` with your actual values:
- Add the generated `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET`
- **IMPORTANT**: Set both LiveKit URLs correctly:
  - `LIVEKIT_SERVER_URL=http://livekit:7880` (for server-side API calls)
  - `NEXT_PUBLIC_LIVEKIT_URL=wss://miyov.io/livekit` (for client browsers)
- Add your Clerk credentials
- Add other required credentials

## 3. SSL Certificate Setup

### Option A: Let's Encrypt (Recommended)

```bash
# Install certbot
sudo apt update
sudo apt install certbot

# Generate certificate
sudo certbot certonly --standalone -d miyov.io -d www.miyov.io

# Copy certificates to nginx directory
sudo mkdir -p /etc/nginx/ssl
sudo cp /etc/letsencrypt/live/miyov.io/fullchain.pem /etc/nginx/ssl/miyov.io.crt
sudo cp /etc/letsencrypt/live/miyov.io/privkey.pem /etc/nginx/ssl/miyov.io.key
```

### Option B: Self-Signed (Development Only)

```bash
sudo mkdir -p /etc/nginx/ssl
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/miyov.io.key \
    -out /etc/nginx/ssl/miyov.io.crt \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=miyov.io"
```

## 4. Install and Configure Nginx

### Install Nginx

```bash
sudo apt update
sudo apt install nginx
```

### Deploy Configuration

```bash
# Copy the nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/miyov.io

# Enable the site
sudo ln -s /etc/nginx/sites-available/miyov.io /etc/nginx/sites-enabled/

# Remove default site if it exists
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## 5. Configure Firewall

Ensure the following ports are open:

```bash
# HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# LiveKit RTC (if direct access needed)
sudo ufw allow 50000:50200/udp

# Application and LiveKit API (internal only, optional)
sudo ufw allow from 127.0.0.1 to any port 3000
sudo ufw allow from 127.0.0.1 to any port 7880
```

## 6. Start Services

```bash
# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f

# Check specific service logs
docker-compose logs -f livekit
docker-compose logs -f app
```

## 7. Verify Setup

1. **Check LiveKit Health**: Visit `https://miyov.io/livekit/` (should show LiveKit info)
2. **Check App**: Visit `https://miyov.io` (should load your application)
3. **Test Voice/Video**: Create a voice channel and test the calling functionality

## Troubleshooting

### Understanding LiveKit URLs (CRITICAL)

**The #1 source of confusion**: There are TWO different URLs for LiveKit:

1. **`LIVEKIT_SERVER_URL`** = Used by your server-side code (RoomServiceClient)
   - Must be internal Docker network: `http://livekit:7880`
   - Used for creating rooms, managing participants, etc.

2. **`NEXT_PUBLIC_LIVEKIT_URL`** = Used by client browsers
   - Must be externally accessible: `wss://miyov.io/livekit`
   - Used for WebSocket connections from user browsers

**Common Mistake**: Using the external URL for server-side code will fail because the server can't reach the external domain from inside Docker.

### LiveKit Connection Issues

1. **Check firewall**: Ensure UDP ports 50000-50200 are open
2. **Check logs**: `docker-compose logs livekit`
3. **Verify external IP**: LiveKit needs to know your server's external IP for WebRTC
4. **URL Configuration**: Verify you're using the correct URLs (see above)

### SSL Issues

1. **Certificate path**: Ensure certificates exist at `/etc/nginx/ssl/`
2. **Permissions**: Certificates should be readable by nginx user
3. **Domain validation**: Ensure miyov.io points to your server

### Performance Tuning

For production use, consider:

1. **Increase file limits**: Add to `/etc/security/limits.conf`:
   ```
   * soft nofile 65536
   * hard nofile 65536
   ```

2. **Optimize kernel for WebRTC**:
   ```bash
   echo 'net.core.rmem_max = 26214400' >> /etc/sysctl.conf
   echo 'net.core.rmem_default = 26214400' >> /etc/sysctl.conf
   sysctl -p
   ```

## Monitoring

Monitor your services:

```bash
# Check service status
docker-compose ps

# Monitor resource usage
docker stats

# Check nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```
