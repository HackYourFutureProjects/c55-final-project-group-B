"""Fetch from the source, validate, land the raw file. Runs as a container job."""

from .pipeline import run

__all__ = ["run"]
