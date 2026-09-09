"""LiteLLM gateway helpers for ingest enrichment.

Loads the team's virtual key from env or Key Vault and calls the shared HYF
proxy (same gateway as optional dbt / notebook LLM work).
"""

from __future__ import annotations

import json
import logging
import os
import urllib.request
from dataclasses import dataclass
from pathlib import Path

import litellm
from dotenv import load_dotenv
from litellm import completion

litellm.suppress_debug_info = True
litellm.num_retries = 2

_data_dir = Path(__file__).resolve().parent.parent.parent
load_dotenv(dotenv_path=_data_dir / ".env")

logger = logging.getLogger(__name__)

LITELLM_GATEWAY_DEFAULT = (
    "https://app-litellm-team-d.blacksky-9263d113.westeurope.azurecontainerapps.io"
)
DEFAULT_MODELS = ["cheap", "medium"]

VAULT_SCOPE = "https://vault.azure.net/.default"


@dataclass(frozen=True)
class LlmConfig:
    api_key: str
    models: list[str]
    api_base: str


def team_letter() -> str:
    if letter := os.getenv("TEAM_LETTER"):
        return letter
    catalog = os.getenv("DATABRICKS_CATALOG", "team_b")
    if catalog.startswith("team_") and len(catalog) > len("team_"):
        return catalog.split("_", 1)[1]
    return "b"


def litellm_gateway() -> str:
    return os.getenv("LITELLM_API_BASE", LITELLM_GATEWAY_DEFAULT).rstrip("/")


def load_litellm_key_from_keyvault() -> str | None:
    vault = os.getenv("KV_VAULT", "kv-hyf-data")
    secret_name = f"litellm-key-team-{team_letter()}"
    url = f"https://{vault}.vault.azure.net/secrets/{secret_name}/?api-version=7.4"
    try:
        from azure.identity import DefaultAzureCredential

        token = DefaultAzureCredential().get_token(VAULT_SCOPE).token
        request = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})
        with urllib.request.urlopen(request, timeout=15) as response:
            payload = json.loads(response.read().decode("utf-8"))
        return payload.get("value")
    except Exception as exc:  # noqa: BLE001
        logger.warning("Key Vault secret %s unavailable: %s", secret_name, exc)
        return None


def resolve_llm_config() -> LlmConfig | None:
    """Load the team's LiteLLM virtual key for the class gateway."""
    api_key = os.getenv("LITELLM_API_KEY") or load_litellm_key_from_keyvault()
    if not api_key:
        return None
    return LlmConfig(
        api_key=api_key,
        models=list(DEFAULT_MODELS),
        api_base=f"{litellm_gateway()}/v1",
    )


def completion_json(prompt: str, api_key: str, model: str, *, api_base: str) -> str:
    """One chat completion; response must be a JSON object."""
    response = completion(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1500,
        response_format={"type": "json_object"},
        api_key=api_key,
        api_base=api_base,
        timeout=60,
    )
    return response.choices[0].message.content
