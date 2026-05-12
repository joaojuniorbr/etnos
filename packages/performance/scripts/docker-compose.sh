#!/bin/sh
set -eu

if docker compose version >/dev/null 2>&1; then
	docker compose "$@"
elif command -v docker-compose >/dev/null 2>&1; then
	docker-compose "$@"
else
	echo "Docker Compose nao encontrado. Instale o Docker Compose v2 ou docker-compose." >&2
	exit 1
fi
