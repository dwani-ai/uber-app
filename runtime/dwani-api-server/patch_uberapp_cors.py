"""Relax CORS for UberApp Traefik subdomains and local dev frontends."""
from pathlib import Path

path = Path("src/server/main.py")
text = path.read_text(encoding="utf-8")
old = """app.add_middleware(
    CORSMiddleware,
    allow_origins=[ "https://*.hf.space",
        "https://dwani.ai",
        "https://*.dwani.ai",
        "https://dwani-*.hf.space",
        "http://localhost:11080"
        ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)"""
new = """app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)"""
if old not in text:
    raise SystemExit("patch_uberapp_cors: expected CORS block not found — upstream main.py changed")
path.write_text(text.replace(old, new, 1), encoding="utf-8")
