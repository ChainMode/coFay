# coFay (`@ifay/cofay`)

[![Docs CI](https://github.com/ChainMode/coFay/actions/workflows/docs-ci.yml/badge.svg)](https://github.com/ChainMode/coFay/actions/workflows/docs-ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Docs: CC BY 4.0](https://img.shields.io/badge/Docs-CC%20BY%204.0-lightgrey.svg)](./LICENSE-DOCS)
[![Website: ifay.ai](https://img.shields.io/badge/Website-ifay.ai-blue)](https://ifay.ai)

**coFay** (**Common Fay**) is the public social role incarnation within the **Fay** ecosystem (`Fay = iFay + coFay`). While an **iFay** (**Individual Fay**) is instantiated from and permanently aligned with a single **Human Prime** via a personal **Ego** model, a **coFay** embodies an addressable, chartered public or organizational function—such as a civic or enterprise service desk (`org_service`), a statutory or governance post (`functional_post`), or a cross-entity project collaborator (`project_collaborator`).

Whether a Human Prime (acting through a governed `iFay`) or another `Fay` connects to a public skill, callers address the stable `cofay_<base32>` role endpoint rather than targeting a specific individual operator.

---

## Core Architectural Principles

1. **Three-Layer Public Role Architecture (No Ego Layer)**
   - In the ecosystem's four-layer model (Social, Interaction, Cognition, Ego), `coFay` implements the **Social**, **Interaction**, and **Cognitive** layers only.
   - `coFay` **never** loads a personal `Ego` replica package (`COFAY_EGO_FORBIDDEN`) and never impersonates a natural person. Its behavioral boundaries, capability exposures, and red lines are governed by a cryptographically signed **`RoleCharter` 1.0**.
2. **Single-Layer Ownership & Natural-Person Steward Accountability**
   - Every `coFay` has exactly one legal/accountability owner: `owner ∈ { HumanID (hid_<base32>), OrganizationID (org_<slug|base32>) }` (referencing canonical identity definitions in `FayID`).
   - Nested ownership (`ifay_` or `cofay_` owning a `coFay`) is strictly forbidden (`OWNER_TYPE_FORBIDDEN`).
   - Organization-owned `coFay` instances MUST designate an accountable natural-person steward (`steward_human_id: hid_<base32>`).
3. **Orthogonal Single-Hop `iFay` Operational Delegation**
   - Daily operational management can be delegated to one or more `managers: iFayID[]` (`ifay_<base32>`) without altering ownership.
   - Delegation is strictly single-hop: active `iFay` managers MUST NOT re-delegate management authority (`MANAGER_REDELEGATION_FORBIDDEN`).
4. **Stateless Runtime Elasticity & Continuous `MeritPocket`**
   - Cognitive and interaction worker instances behind a `cofay_` identity scale horizontally as stateless runtimes, while its social contribution record remains anchored 1:1 to a continuous `MeritPocket` on **GMChain** (**Global Merit Chain**).
   - **MeriToken** (measured in `μ` / **Merit Unit**) is strictly a non-monetary measure of social contribution—never a cryptocurrency, never mineable, never speculated upon, and never two-way exchangeable for fiat currency.
5. **Atomic Dual-Signed Ownership Transfer (`TransferEnvelope` 1.0)**
   - Transferring a `coFay` between single-layer owners requires valid Ed25519 signatures over RFC 8785 JCS from **both** the outgoing owner/steward and the incoming owner/steward (`TRANSFER_DUAL_SIGNATURE_REQUIRED`), bound to `prior_charter_digest_hex` and a strictly monotonic `transfer_nonce`.
   - Upon transfer, prior operational `managers` are automatically cleared (`CLEAR_ALL`) or explicitly re-ratified (`RATIFY_NEW`) by the incoming owner so stale delegates never retain control, while preserving `cofay_id` and its `MeritPocket` intact without inheritance haircutting.
6. **`coFACTS` Conformance Boundary**
   - `iFay` conformance is verified by `iFACTS`; `coFay` conformance is verified exclusively by **`coFACTS`**. Passing an `iFay` target to `coFACTS` triggers immediate boundary interception (`BOUNDARY_IFAY_USE_IFACTS`).

---

## Repository Layout

```text
cofay/
├── docs/                                    # 9-locale documentation (zh-CN canonical + 8 locales)
│   └── <lang>/
│       ├── start.md                         # Quickstart & RoleCharter orientation
│       └── blueprint/
│           ├── 01-*.md                      # Overview & Ontology (Fay = iFay + coFay)
│           ├── 02-*.md                      # Three-Layer Architecture (No Ego) & RoleCharter
│           ├── 03-*.md                      # Public Role Taxonomy & Scenarios
│           ├── 04-*.md                      # Single-Layer Ownership, Delegation & Accountability
│           ├── 05-*.md                      # Stateless Runtime, MeritPocket & Dual-Signed Transfer
│           └── 06-*.md                      # coFACTS Conformance Framework & Phased Roadmap
├── schemas/
│   └── cofay-role-charter-1.0.json          # Normative JSON Schema (Draft 2020-12)
├── schema/
│   └── 2025-10-25/                          # Frozen 2025-10-25 release baseline mirror
│       ├── schema.json
│       ├── schema.ts
│       └── schema.mdx
├── vectors/
│   └── cofay-role-charter-vectors.json      # 20 positive & negative Ed25519 JCS conformance vectors
├── bin/
│   └── cofay.mjs                            # Zero-dependency runnable CLI (create, rotate-steward, transfer, pack-buf, verify, demo)
├── src/
│   ├── cofay-charter.mjs                    # Zero-dependency Node ESM validator, signer & coFACTS L1 checker
│   ├── cofay-seat-wizard.mjs                # Seat bundle generator, steward rotation & dual-signed transfer helpers
│   ├── cofay-buf.mjs                        # Standards-compliant FayGer BUF\0 v1 binary packer & inspector
│   └── cofay-charter.d.ts                   # TypeScript type declarations
├── tests/
│   ├── cofay-charter.test.mjs               # Normative RoleCharter & conformance vector suite
│   └── cofay-cli-and-buf.test.mjs           # CLI wizard, rotation, transfer & BUF\0 v1 test suite
├── package.json
├── CONTRIBUTING.md
├── SECURITY.md
├── CODE_OF_CONDUCT.md
├── LICENSE
└── LICENSE-DOCS
```

---

## Quick Verification & CLI Toolkit

Requires **Node.js >= 20** (zero external runtime dependencies):

```bash
npm test
npm run demo
```

### Seat Wizard, Rotation, Transfer, `BUF\0` Packer & `coFACTS` L1 CLI

```bash
# 1. Create a signed coFay public-role seat bundle (org_service | functional_post | project_collaborator)
node ./bin/cofay.mjs create \
  --archetype org_service \
  --name "Civic Public Permit Desk" \
  --owner-type organization \
  --owner-id org_civic-service-bureau \
  --steward-id hid_a3d5f7g4j2k4m6n5p2q4r6s7t2 \
  --out-dir ./my-seat

# 2. Rotate the accountable natural-person steward (charter_revision + 1, continuous MeritPocket)
node ./bin/cofay.mjs rotate-steward \
  --charter ./my-seat/role-charter.json \
  --new-steward hid_b4f6g7h2j4k6m7n2p4q6r7s2t4 \
  --out ./my-seat/role-charter.json

# 3. Execute atomic dual-signed ownership transfer (TransferEnvelope 1.0, 0% inheritance haircut)
node ./bin/cofay.mjs transfer \
  --charter ./my-seat/role-charter.json \
  --to-owner-type organization \
  --to-owner-id org_metro-digital-agency \
  --new-steward hid_z4y6x7w6v5t4s3r2q7p6n5m4k3 \
  --out ./my-seat/role-charter.json

# 4. Pack a FayGer BUF\0 v1 seat artifact mountable by `fayger inspect` / `fayger up`
node ./bin/cofay.mjs pack-buf \
  --charter ./my-seat/role-charter.json \
  --out ./my-seat/seat.buf

# 5. Run coFACTS L1 conformance verification on RoleCharter JSON or .buf artifact
node ./bin/cofay.mjs verify ./my-seat/seat.buf
```

### Programmatic Example

```js
import {
  signRoleCharter,
  validateRoleCharter,
  runCoFactsL1Check,
} from "@ifay/cofay";

const signedCharter = signRoleCharter(unsignedCharter, {
  signerId: "hid_a3d5f7g4j2k4m6n5p2q4r6s7t2",
  privateKeySeedHex: "0202020202020202020202020202020202020202020202020202020202020202",
});

const result = validateRoleCharter(signedCharter);
const report = runCoFactsL1Check(signedCharter);
console.log(result.valid, report.conformance); // true, "PASS"
```

---

## License

This repository uses a dual-track open-source license (`Copyright (c) 2025-2026 ChainMode contributors`):

- **Source Code, Schemas & Conformance Vectors** (`src/`, `schemas/`, `schema/`, `vectors/`, `tests/`): Licensed under the **MIT License** — see [LICENSE](./LICENSE).
- **Specifications & Architectural Blueprints** (`docs/`): Licensed under **Creative Commons Attribution 4.0 International (CC BY 4.0)** — see [LICENSE-DOCS](./LICENSE-DOCS).
