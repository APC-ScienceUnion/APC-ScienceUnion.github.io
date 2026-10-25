#!/usr/bin/env python3
"""Mirror gallery image references separately from the established article manifest."""
import argparse
import hashlib
import json
import re
from collections import defaultdict
from pathlib import Path
import localize_external_images as assets

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--download',action='store_true')
    parser.add_argument('--check',action='store_true')
    args=parser.parse_args()
    grouped=defaultdict(list)
    texts={}
    for file in (assets.SOURCE_ROOT/'gallery').rglob('*'):
        if not file.is_file() or file.suffix.lower() not in assets.TEXT_SUFFIXES: continue
        text=assets.read_utf8_text(file)
        refs=assets.scan_text(file,text)
        for tag in re.finditer(r'\{%\s*galleryGroup\b[^\n]*?%\}',text):
            for match in re.finditer(r'https?://[^\s\"\']+\.(?:jpe?g|png|webp|gif)',tag.group(0)):
                start=tag.start()+match.start()
                refs.append(assets.Reference(file,start,tag.start()+match.end(),match.group(0),'galleryGroup',text.count('\n',0,start)+1))
        if refs: texts[file]=text
        for ref in refs: grouped[ref.url].append(ref)
    print(f'{sum(map(len,grouped.values()))} external gallery image references; {len(grouped)} unique images.',flush=True)
    if args.check:
        manifest=assets.REPO_ROOT/'tools/gallery-server-images.json'
        for image in json.loads(manifest.read_text(encoding='utf8'))['images']:
            file=assets.SOURCE_ROOT/image['path'].lstrip('/')
            if file.is_symlink() or not file.resolve().is_relative_to((assets.SOURCE_ROOT/'gallery/assets/server').resolve()):raise SystemExit('Invalid gallery image path')
            if not file.is_file() or file.stat().st_size!=image['bytes'] or hashlib.sha256(file.read_bytes()).hexdigest()!=image['sha256']:raise SystemExit(f'Gallery image changed: {file}')
        if grouped:raise SystemExit(1)
        print('All gallery image references and mirrored bytes verified.')
        return
    if not args.download:return
    scope=assets.Scope(key='gallery-server',local_dir=assets.SOURCE_ROOT/'gallery/assets/server',public_dir='/gallery/assets/server',numbered=False)
    plans=[assets.AssetPlan(url=url,scope=scope,references=refs,stem='asset-'+hashlib.sha256(url.encode()).hexdigest()[:10]) for url,refs in grouped.items()]
    if not plans:return
    results,failures=assets.download_all(plans,6)
    manifest=assets.REPO_ROOT/'tools/gallery-server-images.json'
    previous=json.loads(manifest.read_text(encoding='utf8')) if manifest.exists() else {'version':1,'images':[]}
    for result in results:
        entry={'url':result.plan.url,'path':result.public_path,'sha256':result.image.sha256,'bytes':result.image.path.stat().st_size}
        previous['images']=[old for old in previous['images'] if old['url']!=entry['url']]+[entry]
    # Each successful file is independently validated before its references are changed.
    # Failed URLs remain intact and are explicitly reported for follow-up.
    assets.replace_references(results,texts)
    manifest.write_text(json.dumps(previous,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    for plan,error in failures: print(f'FAILED {plan.url}: {error}',flush=True)
    if failures:raise SystemExit(1)

if __name__=='__main__':main()
