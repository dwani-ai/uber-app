#!/usr/bin/env python3
"""Relax upstream import-time failure when DWANI_* env is unset (Gradio UI can still load)."""
from pathlib import Path


def main() -> None:
    p = Path(__file__).resolve().parent / "workshop_demo.py"
    text = p.read_text(encoding="utf-8")
    old = (
        "# Validate API configuration\n"
        "if not dwani.api_key or not dwani.api_base:\n"
        '    logger.error("API key or base URL not set. Please set DWANI_API_KEY and DWANI_API_BASE_URL environment variables.")\n'
        '    raise ValueError("Please set DWANI_API_KEY and DWANI_API_BASE_URL environment variables.")\n'
    )
    new = (
        "# Validate API configuration (warn only — set env for live API calls)\n"
        "if not dwani.api_key or not dwani.api_base:\n"
        '    logger.warning("DWANI_API_KEY / DWANI_API_BASE_URL not set — API features need these in the environment.")\n'
    )
    if old not in text:
        raise SystemExit(
            "patch_demo: upstream workshop_demo.py changed; update runtime/workshop/patch_demo.py"
        )
    p.write_text(text.replace(old, new), encoding="utf-8")


if __name__ == "__main__":
    main()
