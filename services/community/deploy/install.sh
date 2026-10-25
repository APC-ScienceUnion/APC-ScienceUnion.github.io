#!/usr/bin/env bash
# Run as root after inspecting this file. Installs only this application; no firewall changes.
set -euo pipefail
test "$(id -u)" = 0
APP_SOURCE=$(cd "$(dirname "$0")/.." && pwd)
command -v node >/dev/null
node -e 'if (+process.versions.node.split(".")[0] < 24) process.exit(1)'
if ! id apc-community >/dev/null 2>&1; then useradd --system --home /var/lib/apc-community --shell /usr/sbin/nologin apc-community; fi
install -d -o apc-community -g apc-community -m 700 /var/lib/apc-community
install -d -m 755 /opt/apc-community/releases /srv/apc-media
RELEASE="/opt/apc-community/releases/$(date -u +%Y%m%dT%H%M%SZ)"
install -d -m 755 "$RELEASE"
cp -R "$APP_SOURCE/src" "$APP_SOURCE/package.json" "$RELEASE/"
ln -sfn "$RELEASE" /opt/apc-community/current
install -m 644 "$APP_SOURCE/deploy/community.service" /etc/systemd/system/apc-community.service
install -m 644 "$APP_SOURCE/deploy/backup.service" /etc/systemd/system/apc-community-backup.service
install -m 644 "$APP_SOURCE/deploy/backup.timer" /etc/systemd/system/apc-community-backup.timer
systemctl daemon-reload
if test -f /etc/apc-community.env && test -f /var/lib/apc-community/community-topics.json; then
    systemctl enable --now apc-community
    systemctl restart apc-community
    systemctl enable --now apc-community-backup.timer
    curl --fail --silent --show-error --retry 10 --retry-delay 1 --retry-connrefused http://127.0.0.1:8787/api/health
else
    echo 'Application installed. Add the private env file and article manifest before starting the API.'
fi
