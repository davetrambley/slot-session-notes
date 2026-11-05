from pathlib import Path
import zipfile

workspace = Path(__file__).resolve().parents[1]
source = workspace / 'slot-session-notes'
out = workspace / 'delivery'

with zipfile.ZipFile(out / 'slot-session-notes-github-v0.1.0.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
    for file in sorted(source.rglob('*')):
        if file.is_file():
            archive.write(file, file.relative_to(source).as_posix())

with zipfile.ZipFile(out / 'slot-session-notes-extension-v0.1.0.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
    for file in sorted((source / 'extension').rglob('*')):
        if file.is_file():
            archive.write(file, file.relative_to(source / 'extension').as_posix())

for name in ['slot-session-notes-github-v0.1.0.zip', 'slot-session-notes-extension-v0.1.0.zip']:
    with zipfile.ZipFile(out / name) as archive:
        assert archive.testzip() is None
        print(f'{name}: {len(archive.namelist())} files, integrity OK')

# Confirm every packaged manifest path exists.
import json
manifest = json.loads((source / 'extension' / 'manifest.json').read_text(encoding='utf-8'))
for relative in [manifest['background']['service_worker'], *manifest['icons'].values()]:
    assert (source / 'extension' / relative).is_file(), relative
assert (source / 'docs' / 'images' / 'overview.png').is_file()
