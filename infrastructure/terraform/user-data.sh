#!/bin/bash

set -euxo pipefail

export DEBIAN_FRONTEND=noninteractive

apt-get update

apt-get install -y \
  ca-certificates \
  curl \
  gnupg \
  jq \
  nginx \
  unzip

# Docker official repository.
install -m 0755 -d /etc/apt/keyrings

curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  -o /etc/apt/keyrings/docker.asc

chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" \
  > /etc/apt/sources.list.d/docker.list

apt-get update

apt-get install -y \
  docker-ce \
  docker-ce-cli \
  containerd.io \
  docker-buildx-plugin \
  docker-compose-plugin

systemctl enable docker
systemctl start docker

systemctl enable nginx
systemctl start nginx

# Allow Ubuntu user to manage Docker without sudo.
usermod -aG docker ubuntu

# CloudDrop directories.
mkdir -p /opt/clouddrop
mkdir -p /etc/clouddrop

chown ubuntu:ubuntu /opt/clouddrop
chown root:ubuntu /etc/clouddrop

chmod 755 /opt/clouddrop
chmod 750 /etc/clouddrop

# Ensure AWS Systems Manager Agent is available.
if ! command -v amazon-ssm-agent >/dev/null 2>&1; then
  snap install amazon-ssm-agent --classic || true
fi

systemctl enable --now snap.amazon-ssm-agent.amazon-ssm-agent.service 2>/dev/null \
  || systemctl enable --now amazon-ssm-agent 2>/dev/null \
  || true

cat > /opt/clouddrop/BOOTSTRAP_COMPLETE <<BOOTSTRAP
CloudDrop production host bootstrap completed.
Docker, Docker Compose, Nginx, and SSM are configured.
BOOTSTRAP
