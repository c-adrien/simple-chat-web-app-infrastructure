#!/bin/bash

# If the OPENSEARCH_PASSWORD is not set, ask the user for a password and set it
if [ -z "$OPENSEARCH_PASSWORD" ]; then
    read -sp "Enter OpenSearch admin password: " user_input
    echo
    export OPENSEARCH_PASSWORD=$(echo -n "$user_input" | base64)
    echo "OpenSearch password has been set."
else
    echo "Using existing OPENSEARCH_PASSWORD."
fi


# Start the Docker containers in detached mode
docker-compose up --build -d

# Wait for OpenSearch to be ready
echo "Waiting for OpenSearch to start..."
until curl -s -o /dev/null -w "%{http_code}" http://localhost:9200 -ku "admin:$OPENSEARCH_PASSWORD" | grep -q "200"; do
    echo "OpenSearch is not ready yet. Waiting..."
    sleep 5
done

echo "OpenSearch is up and running."

# Create the index
response=$(curl -s -u "admin:$OPENSEARCH_PASSWORD" -X PUT "http://localhost:9200/messages" -H 'Content-Type: application/json' -d '{
  "mappings": {
    "properties": {
      "user": { "type": "text" },
      "message": { "type": "text" },
      "timestamp": { "type": "date" }
    }
  }
}')

# Check if the index creation was successful
if [[ $response == *'"acknowledged":true'* && $response == *'"shards_acknowledged":true'* ]]; then
    echo "Index created successfully: $response"
else
    echo "Failed to create index: $response"
    exit 1
fi


# Install the Prometheus exporter plugin for OpenSearch
echo "Installing Prometheus exporter plugin..."
container_id=$(docker ps -q -f name=opensearch)
docker exec -it $container_id ./bin/opensearch-plugin install https://github.com/aiven/prometheus-exporter-plugin-for-opensearch/releases/download/2.17.1.0/prometheus-exporter-2.17.1.0.zip

# Restart OpenSearch to apply the plugin
echo "Restarting OpenSearch..."
docker-compose restart opensearch


echo "Setup completed successfully."