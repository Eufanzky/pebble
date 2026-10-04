"""Print the API's OpenAPI schema as stable JSON.

The frontend generates its API types from this (``npm run api:generate`` in
``frontend/``), and CI fails if the committed copy drifts from the code.
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.main import app  # noqa: E402

if __name__ == "__main__":
    print(json.dumps(app.openapi(), indent=2, sort_keys=True))
