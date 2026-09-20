#!/usr/bin/env python3
"""SQLite online backup; does not copy a live WAL file unsafely."""
from datetime import datetime, timezone
from pathlib import Path
import os
import sqlite3

os.umask(0o077)
source = Path('/var/lib/durnoty/durnoty.sqlite')
target = Path('/var/backups/durnoty')
target.mkdir(parents=True, exist_ok=True)
name = target / (datetime.now(timezone.utc).strftime('%Y-%m-%d-%H%M%S') + '.sqlite')
with sqlite3.connect(f'file:{source}?mode=ro', uri=True) as src, sqlite3.connect(name) as dest:
    src.backup(dest)
    if dest.execute('PRAGMA integrity_check').fetchone()[0] != 'ok':
        raise RuntimeError('Backup integrity check failed')
for old in sorted(target.glob('*.sqlite'), reverse=True)[14:]:
    old.unlink()
print('Durnoty database backup verified.')
