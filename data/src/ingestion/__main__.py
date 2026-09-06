"""Container entrypoint for ``python -m src.ingestion`` (see data/Dockerfile)."""

from . import run

if __name__ == "__main__":
    run()
