#!/usr/bin/env bash
# Run from the repository root after Hexo generation and its existing asset checks.
set -euo pipefail
: "${APC_SERVER_HOST:?Set the target server}"
: "${APC_DEPLOY_USER:?Use a restricted deployment account}"
: "${APC_SSH_KEY_FILE:?Path to a private deployment key}"
: "${APC_KNOWN_HOSTS_FILE:?Path to verified SSH host keys}"
: "${IMAGE_HOST_URL:?Set the HTTPS image origin}"
export APC_SSH_KEY_FILE APC_KNOWN_HOSTS_FILE
STAGE=$(mktemp -d)
trap 'rm -rf "$STAGE"' EXIT
node tools/server_assets.js prepare public "$STAGE"
cat > "$STAGE/ssh" <<'SH'
#!/usr/bin/env bash
exec ssh -i "$APC_SSH_KEY_FILE" -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes -o UserKnownHostsFile="$APC_KNOWN_HOSTS_FILE" "$@"
SH
chmod 700 "$STAGE/ssh"
REMOTE="${APC_DEPLOY_USER}@${APC_SERVER_HOST}"
# Do not delete old images. Daily snapshots and old cached pages may still reference them.
# The forced rrsync entry point roots remote paths at /srv.
# CI's private umask protects credentials but must not make public image
# directories inaccessible to Caddy's separate service account.
rsync -az --checksum --chmod=D755,F644 -e "$STAGE/ssh" "$STAGE/media/" "$REMOTE:/apc-media/"
rsync -az -e "$STAGE/ssh" "$STAGE/community-topics.json" "$STAGE/media-manifest.json" "$REMOTE:/apc-publish/"
"$STAGE/ssh" "$REMOTE" sudo -n /usr/local/sbin/apc-publish
curl --fail --silent --show-error --retry 10 --retry-delay 1 --retry-connrefused "${COMMUNITY_API_URL:?Set API origin}/api/health"
node tools/server_assets.js rewrite public "$IMAGE_HOST_URL"
