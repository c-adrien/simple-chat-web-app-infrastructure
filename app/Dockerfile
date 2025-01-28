# Use the official Nginx image
FROM nginx:alpine

# Copy the HTML, CSS, and JS files to the Nginx HTML directory
COPY index.html /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/
COPY script.js /usr/share/nginx/html/

COPY nginx.conf /etc/nginx/nginx.conf

# Add an entrypoint script to generate config.js
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose port 80
EXPOSE 80

# Use the entrypoint script to start Nginx
CMD ["/entrypoint.sh"]
