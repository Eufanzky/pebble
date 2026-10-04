# 2.3 Safety port: plan

1. Write the domain safety types and their tests.
2. Write the ports, the errors and `SafetyGate`.
3. Move the PII redactor to `infrastructure/pii/` behind `RegexPIIRedactor`, and leave a legacy shim.
4. Write `AzureContentSafety` (REST) and its contract tests, and `NoOpSafetyChecker` and the factory.
5. Add `ScriptedSafety` to `tests/fakes.py` and test the gate's reject path.
6. Update the docs; tick 2.3.
