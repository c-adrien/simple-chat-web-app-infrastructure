#!/bin/sh

echo "window.config = { apiUrl: '${API_URL:-http://localhost:9200}' };" > /usr/share/nginx/html/config.js
exec nginx -g "daemon off;"
