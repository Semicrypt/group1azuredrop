#!/usr/bin/env bash

set -euxo pipefail

export DEBIAN_FRONTEND=noninteractive

apt-get update

apt-get install -y \
  ca-certificates \
  curl \
  git \
  docker.io \
  docker-compose-v2

systemctl enable docker
systemctl start docker

usermod -aG docker ubuntu

mkdir -p /opt/azuredrop

chown ubuntu:ubuntu \
  /opt/azuredrop

# AWS Systems Manager Agent for secure CI/CD deployments.
if ! snap list amazon-ssm-agent >/dev/null 2>&1; then
  snap install amazon-ssm-agent --classic
fi

snap start amazon-ssm-agent
