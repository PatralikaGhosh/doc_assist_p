#!/bin/bash
set -e

echo "Starting SSH daemon..."
/usr/sbin/sshd

echo "Starting Solr in background with -force..."
/opt/solr/bin/solr start -force

echo "Waiting for Solr to be available..."
until curl -s http://localhost:8983/solr/admin/info/system > /dev/null; do
    sleep 2
done
echo "Solr is available."

CORE_NAME="document_processing"

echo "Creating core '$CORE_NAME' with -force..."
/opt/solr/bin/solr create -c "$CORE_NAME" -d _default -force || echo "Core creation failed or core already exists."

echo "Solr is running. Keeping container active..."
sleep infinity
