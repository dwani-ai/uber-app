"""Point Gradio client at configurable school API (SCHOOL_BACKEND_URL)."""
from pathlib import Path

path = Path("/app/repo/frontend/ux.py")
text = path.read_text(encoding="utf-8")
marker = 'BACKEND_URL = "http://localhost:8000"\nBACKEND_URL = "https://school-server.dwani.ai/"'
replacement = (
    "import os\n"
    '_BACK = os.environ.get("SCHOOL_BACKEND_URL", "https://school-server.dwani.ai/").rstrip("/")\n'
    'BACKEND_URL = _BACK + "/"\n'
)
if marker in text:
    text = text.replace(marker, replacement)
    path.write_text(text, encoding="utf-8")
else:
    raise SystemExit("patch_backend: expected BACKEND_URL lines not found in ux.py")
