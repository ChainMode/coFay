# Contributing to coFay

Thank you for contributing to **coFay** (`@ifay/cofay`)! Please read our [Code of Conduct](./CODE_OF_CONDUCT.md) and report any security or charter-bypass issues privately via [SECURITY.md](./SECURITY.md).

## Local Setup & Verification

`coFay` requires **Node.js `>= 20.0.0`** and runs with zero external runtime dependencies (`node:crypto` + `node:test`).

```bash
# Clone your fork
git clone https://github.com/ChainMode/coFay.git
cd coFay

# Run the RoleCharter 1.0, TransferEnvelope 1.0, coFACTS L1, and 20-vector test suite
npm test
```

Any change to `schemas/cofay-role-charter-1.0.json` must preserve parity with `schema/2025-10-25/` where applicable and pass all positive and negative conformance vectors in `vectors/cofay-role-charter-vectors.json`.

## Contribution Workflow

1. **Fork & Branch**: Fork `https://github.com/ChainMode/coFay.git` and create a topic branch from `main`.
2. **Conventional Commits**: Format commit messages with Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`).
3. **Sign Off Your Commits (DCO 1.1)**: Commit with `git commit -s` to include your `Signed-off-by` trailer.
4. **Pull Request**: Open a Pull Request against `main` summarizing the change and pasting `npm test` verification results.

## Developer Certificate of Origin v1.1 (DCO 1.1) & Licensing

We use the **Developer Certificate of Origin Version 1.1 (DCO 1.1)** (`https://developercertificate.org/`). **No separate CLA is required.**

Every commit must include a `Signed-off-by` line (`git commit -s`):

```text
Signed-off-by: Jane Doe <jane.doe@example.com>
```

Under **Inbound = Outbound**, contributions are licensed under our dual-track open-source licenses (`Copyright (c) 2025-2026 ChainMode contributors`):

- **Source Code, Schemas & Conformance Vectors** (`src/`, `schemas/`, `schema/`, `vectors/`, `tests/`): Licensed under the **MIT License** ([LICENSE](./LICENSE)).
- **Specifications & Architectural Blueprints** (`docs/`): Licensed under **Creative Commons Attribution 4.0 International (CC BY 4.0)** ([LICENSE-DOCS](./LICENSE-DOCS)).

## Ecosystem Terminology Alignment

Please use canonical ecosystem terminology across schemas, validators, and documentation:

- **`Human Prime` (`人类原型`)**: Use `Human Prime` (`人类原型`) for living human individuals (such as a `hid_` owner or an organization's `steward_human_id`).
- **`Host` (`宿主`)**: Use `Host` (`宿主`) strictly for terminal hardware devices, operating systems, or runtime application environments.
- **`Fay = iFay + coFay`**: Use `Fay` as the umbrella term, `iFay` for an individual avatar aligned via `Ego`, and `coFay` for a three-layer public/organizational role avatar governed by a `RoleCharter` (with `coFACTS` for `coFay` conformance and `iFACTS` for `iFay` conformance).
- **`GMChain` (`公誉链`) & `MeriToken (μ)` (`美誉值`)**: Use `GMChain` (`公誉链`) for the Global Merit Chain and `MeriToken` (`μ` / `Merit Unit`) strictly as a non-monetary measure of social contribution.
