#!/bin/bash
set -e

# 1. Create a basic index.html placeholder
echo "--> Creating index.html..."
cat <<'EOF' > /var/www/sabz.afriqpay.com/html/index.html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Welcome to Sabz</title>
    <style>
        body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #F5FBFD; color: #0D1B2A; }
        .container { text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        h1 { color: #00B4D8; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to Sabz.AfriqPay</h1>
        <p>The frontend application has not been deployed yet.</p>
    </div>
</body>
</html>
EOF

# 2. Create Nginx Site Configuration for HTTP
echo "--> Creating Nginx Configuration..."
cat <<'EOF' > /etc/nginx/sites-available/sabz.afriqpay.com
server {
    listen 80;
    listen [::]:80;
    
    # Listen on both the main domain and www prefix if appropriate
    server_name sabz.afriqpay.com;

    root /var/www/sabz.afriqpay.com/html;
    index index.html index.htm;

    # Single Page Application routing configuration
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

# 3. Enable the site configuration by creating a symlink
echo "--> Enabling Nginx site..."
ln -sf /etc/nginx/sites-available/sabz.afriqpay.com /etc/nginx/sites-enabled/

# Ensure no conflicting defaults
rm -f /etc/nginx/sites-enabled/default

# 4. Test Nginx and reload
echo "--> Testing Nginx configuration..."
nginx -t
systemctl reload nginx

# 5. Install Certbot (skip if already installed)
echo "--> Installing Certbot if not present..."
if ! command -v certbot >/dev/null 2>&1; then
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
fi

# 6. Use Certbot to configure HTTPS automatically
# We use --non-interactive, agree to terms, and redirect HTTP to HTTPS
echo "--> Running Certbot for HTTPS..."
certbot --nginx -d sabz.afriqpay.com --non-interactive --agree-tos -m admin@afriqpay.com --redirect

echo "--> Reloading Nginx after Certbot configuration..."
systemctl reload nginx

echo "✅ SUCCESS: HTTPS has been configured for sabz.afriqpay.com!"
