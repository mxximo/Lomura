"""SQLite backup and restore to a NEW directory, without replacing live data."""
import argparse
import os
from pathlib import Path
import sqlite3
import tempfile
from contextlib import closing


def checked_copy(source: Path, destination: Path):
    source, destination = source.resolve(), destination.resolve()
    if not source.is_file():
        raise ValueError(f"Database not found: {source}")
    if destination.exists():
        raise ValueError(f"Destination already exists; choose a new path: {destination}")
    destination.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=destination.parent, suffix=".sqlite3", delete=False) as f:
        temporary = Path(f.name)
    try:
        with closing(sqlite3.connect(source.as_uri() + "?mode=ro", uri=True)) as src:
            if src.execute("PRAGMA quick_check").fetchone()[0] != "ok":
                raise ValueError("Source failed SQLite integrity check")
            with closing(sqlite3.connect(temporary)) as dst:
                src.backup(dst)
                if dst.execute("PRAGMA quick_check").fetchone()[0] != "ok":
                    raise ValueError("Copy failed SQLite integrity check")
                count = dst.execute("SELECT COUNT(*) FROM responses").fetchone()[0]
        # link creates destination atomically and refuses an existing file.
        os.link(temporary, destination)
        print(f"Verified copy: {destination} ({count} responses)")
    finally:
        temporary.unlink(missing_ok=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="action", required=True)
    backup = sub.add_parser("backup")
    backup.add_argument("--data-dir", type=Path, default=Path(os.getenv("DATA_DIR", str(Path(__file__).resolve().parents[1] / "backend/storage"))))
    backup.add_argument("--output", type=Path, required=True)
    restore = sub.add_parser("restore")
    restore.add_argument("--snapshot", type=Path, required=True)
    restore.add_argument("--target-dir", type=Path, required=True)
    args = parser.parse_args()
    try:
        if args.action == "backup":
            checked_copy(args.data_dir / "responses.sqlite3", args.output)
        else:
            if args.target_dir.exists() and any(args.target_dir.iterdir()):
                raise ValueError("Restore requires an empty or new target directory")
            checked_copy(args.snapshot, args.target_dir / "responses.sqlite3")
    except (ValueError, sqlite3.Error, OSError) as e:
        parser.exit(1, f"{e}\n")
