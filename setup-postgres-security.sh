#!/bin/bash

# PostgreSQL 보안 설정 스크립트

echo "🔐 Setting up PostgreSQL authentication..."

# pg_hba.conf 설정: postgres 사용자만 peer, 나머지는 md5
sudo bash -c 'cat > /var/lib/pgsql/data/pg_hba.conf << "EOF"
# TYPE  DATABASE        USER            ADDRESS                 METHOD

# postgres 사용자는 Unix socket으로만 접속 가능 (관리용)
local   all             postgres                                peer

# 다른 모든 사용자는 비밀번호 필요
local   all             all                                     md5

# TCP/IP 연결: localhost만 허용, 모두 비밀번호 필요
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5

# Replication (필요한 경우)
local   replication     all                                     peer
host    replication     all             127.0.0.1/32            md5
host    replication     all             ::1/128                 md5
EOF
'

echo "✅ pg_hba.conf updated"

# postgresql.conf 보안 설정: localhost만 listen
echo "🔒 Configuring PostgreSQL to listen on localhost only..."
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = 'localhost'/" /var/lib/pgsql/data/postgresql.conf
sudo sed -i "s/listen_addresses = '\*'/listen_addresses = 'localhost'/" /var/lib/pgsql/data/postgresql.conf

echo "✅ PostgreSQL will only listen on localhost"

# PostgreSQL 재시작
echo "🔄 Restarting PostgreSQL..."
sudo systemctl restart postgresql

echo ""
echo "✅ PostgreSQL security configured:"
echo "   - postgres user: peer authentication (Unix socket only)"
echo "   - Other users: password required"
echo "   - Only listening on localhost (no external access)"
echo ""
