#!/usr/bin/env python3
"""Fixed sudo entry point for a restricted publisher; never execute uploaded code."""
import hashlib
import json
import os
import pwd
import subprocess
from pathlib import Path

root=Path('/srv/apc-media').resolve()
staging=Path('/srv/apc-publish')
manifest_file=staging/'media-manifest.json'
topics_file=staging/'community-topics.json'
for p in (manifest_file,topics_file):
    if p.is_symlink() or not p.is_file() or p.stat().st_size>4*1024*1024:raise SystemExit('Invalid manifest file')
manifest=json.loads(manifest_file.read_text())
for item in manifest['files']:
    path=(root/item['path']).resolve()
    if not path.is_relative_to(root) or not path.is_file():raise SystemExit('Invalid image path')
    if path.stat().st_size!=item['bytes'] or hashlib.sha256(path.read_bytes()).hexdigest()!=item['sha256']:raise SystemExit('Image verification failed')
topics=json.loads(topics_file.read_text())
if not isinstance(topics.get('topics'),list) or not topics['topics'] or any(not isinstance(x,str) or not x.startswith('/articles/') or len(x)>1000 for x in topics['topics']):raise SystemExit('Invalid article manifest')
destination=Path('/var/lib/apc-community/community-topics.json')
temporary=destination.with_suffix('.next')
temporary.write_text(json.dumps(topics))
account=pwd.getpwnam('apc-community');os.chown(temporary,account.pw_uid,account.pw_gid);os.chmod(temporary,0o600)
os.replace(temporary,destination)
subprocess.run(['systemctl','restart','apc-community'],check=True)
print(f"Verified {len(manifest['files'])} images and updated article manifest.")
