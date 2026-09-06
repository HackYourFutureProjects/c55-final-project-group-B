"""Container entrypoint for ``python -m src.ingestion`` (see data/Dockerfile)."""

import sys

from . import run

if __name__ == "__main__":
    run()
    sys.exit(0)
