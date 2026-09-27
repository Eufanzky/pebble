# 2.1 Layer skeleton: plan

1. Create the layer packages with docstrings.
2. `git mv` the config, routers, schemas and auth; rewrite imports with sed; `ruff --fix` the import order.
3. Add `tests/unit/test_architecture.py`.
4. Start the app and hit `/api/health`; run the whole suite.
5. Document the rule; update the structure trees and `CLAUDE.md`; tick 2.1.
