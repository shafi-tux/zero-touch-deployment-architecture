#!/bin/bash
apt-get update -y
apt-get install docker.io docker-compose-v2 -y
usermod -aG docker ubuntu
systemctl enable docker
systemctl start docker
docker container run --name dbserver -p 6379:6379 --restart always -d redis:latest
