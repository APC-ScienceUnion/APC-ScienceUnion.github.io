#!/usr/bin/env python3
"""SSH entry point: write-only rsync under /srv, or the fixed manifest publisher."""
import os

command = os.environ.get('SSH_ORIGINAL_COMMAND', '')
if command == 'sudo -n /usr/local/sbin/apc-publish':
    os.execv('/usr/bin/sudo', ['sudo', '-n', '/usr/local/sbin/apc-publish'])
# rrsync validates protocol arguments and paths. Munge links so an uploaded
# symlink cannot expose files outside the published image directory.
os.execv('/usr/bin/rrsync', ['rrsync', '-wo', '-munge', '-no-del', '-no-lock', '/srv'])
