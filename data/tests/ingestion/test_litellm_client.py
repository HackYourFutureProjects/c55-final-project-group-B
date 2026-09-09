"""LiteLLM client config resolution."""

from src.ingestion.litellm_client import resolve_llm_config, team_letter


def test_team_letter_from_catalog(monkeypatch):
    monkeypatch.delenv("TEAM_LETTER", raising=False)
    monkeypatch.setenv("DATABRICKS_CATALOG", "team_b")
    assert team_letter() == "b"


def test_resolve_llm_config_uses_env_key(monkeypatch):
    monkeypatch.setenv("LITELLM_API_KEY", "sk-test")
    monkeypatch.setenv("LITELLM_API_BASE", "https://gateway.example.com")
    config = resolve_llm_config()
    assert config is not None
    assert config.api_key == "sk-test"
    assert config.api_base == "https://gateway.example.com/v1"
    assert config.models == ["cheap", "medium"]
