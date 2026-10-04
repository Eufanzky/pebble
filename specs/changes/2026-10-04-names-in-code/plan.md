# 6.5 Names in the code: plan

1. Review every folder, file, export, CSS prefix, env var, script, storage key and CI name; list what's unclear.
2. Backend: one name per agent (prompts, `LLMRequest.agent`, fake, tests); move adapters and tests to their layer; split bundled test files.
3. Frontend: rename modules, merge the faces, move the helper, rename CSS (and delete the dead rules it would wake), split the E2E.
4. Evals after the prompt change; all checks; docs; roadmap; PR.
