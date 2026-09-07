import runpy

import pytest


def test_ingestion_main_entrypoint(monkeypatch):
    """Ensure python -m src.ingestion executes src.ingestion.run correctly."""
    called = False

    def mock_run():
        nonlocal called
        called = True
        return 0

    monkeypatch.setattr("src.ingestion.run", mock_run)

    with pytest.raises(SystemExit) as exc_info:
        runpy.run_module("src.ingestion.__main__", run_name="__main__")

    assert called is True
    assert exc_info.value.code == 0
