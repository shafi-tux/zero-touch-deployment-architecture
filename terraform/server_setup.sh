#!/bin/bash
apt-get update -y
apt-get install docker.io git docker-compose-v2 -y
usermod -aG docker ubuntu
systemctl enable docker
systemctl start docker
