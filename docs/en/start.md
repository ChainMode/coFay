# Quickstart: Understanding and Integrating coFay

Welcome to the official documentation and reference toolkit for **coFay** (**Common Fay**, the public role digital incarnation). Within the foundational binary ontology of the **Fay** ecosystem, **`Fay = iFay + coFay`**, an `iFay` (**Individual Fay**) is a personal digital avatar instantiated from and permanently aligned with a single **Human Prime**. By contrast, a `coFay` is a **publicly addressable, functional social role incarnation defined and governed by a normative `RoleCharter`**.

Whether a Human Prime initiates a service request through a governed `iFay` or another `Fay` invokes a collaborative capability across organizational boundaries, callers never need to target or track a specific natural-person operator behind the scenes. Addressing and connecting to the stable `cofay_<base32>` public role endpoint delivers predictable, cryptographically verifiable, and end-to-end auditable collaboration.

---

## 1. Core Mental Model in Three Minutes

Understanding `coFay` begins with four structural and ethical boundaries that distinguish a public role incarnation from an individual `iFay`:

| Dimension | `iFay` (Individual Digital Avatar) | `coFay` (Public Role Incarnation) |
| :--- | :--- | :--- |
| **Ontological Nature** | Digital extension of a Human Prime's persona, preferences, and personal agency | Transferable public office, institutional service window, or collaborative unit |
| **Architectural Stack** | Social Layer + Interaction Layer + Cognition Layer + **Ego Layer** | **Social Layer + Interaction Layer + Cognition Layer (Ego Layer strictly forbidden)** |
| **Ownership and Transfer** | Permanently bound to a single Human Prime; never sold, traded, or transferred | Single-layer ownership under `HumanID` or `OrganizationID`; supports atomic dual-signed transfer |
| **Conformance Verification** | Verified by the **iFACTS** conformance test suite | Verified exclusively by the **coFACTS** conformance framework |

> **Critical Design Redline**: Across the entire `Fay` ecosystem, the term **Host** refers strictly to an inhabited terminal hardware device or software application, never to a human being. Legal and ethical accountability for every `coFay` ultimately anchors to a natural person: either the directly owning `HumanID` or, under organizational ownership, the mandatory natural-person steward registered in `steward_human_id`.

---

## 2. Prerequisites and One-Minute Local Verification

This repository ships with zero external runtime dependencies and includes the normative `RoleCharter` 1.0 JSON Schema, 20 positive and negative cryptographic conformance vectors, and the `coFACTS` L1 conformance checker. With **Node.js 20+** installed, run the full verification suite locally:

```bash
git clone https://github.com/ChainMode/coFay.git
cd coFay
npm test
```

When execution succeeds, the automated test suite verifies seven normative invariants in sequence:

1. Byte-for-byte equivalence between `schemas/cofay-role-charter-1.0.json` and the frozen baseline mirror at `schema/2025-10-25/schema.json`.
2. Deterministic JSON serialization under the RFC 8785 JSON Canonicalization Scheme (JCS).
3. Ed25519 signature generation and tamper-evident verification across all three canonical public role archetypes (`org_service`, `functional_post`, and `project_collaborator`).
4. Strict Ego-layer prohibition (blocking any `ego_package` or personal persona attachment), single-layer ownership enforcement (blocking nested `ifay_` or `cofay_` ownership), and mandatory natural-person steward binding for organizational owners.
5. Orthogonal single-hop `iFay` operational delegation (permitting grants and revocations by the owner or steward while rejecting secondary re-delegation by active managers).
6. Atomic dual-signed ownership transfer (`TransferEnvelope` 1.0), enforcing stale manager clearing or explicit re-ratification, strictly monotonic anti-replay `transfer_nonce` progression, and continuous on-chain `MeritPocket` binding on **Global Merit Chain** (`GMChain`).
7. Machine-readable `coFACTS` L1 conformance report generation alongside deterministic boundary rejection when an `iFay` target is submitted to `coFACTS`.

---

## 3. Authoring and Validating Your First `RoleCharter` 1.0

Every production `coFay` instance must carry a `RoleCharter` 1.0 document signed via Ed25519 by its accountable single-layer owner (or by its designated natural-person steward under organizational ownership):

```js
import {
  signRoleCharter,
  validateRoleCharter,
  runCoFactsL1Check,
} from "@ifay/cofay";

const unsignedCharter = {
  schema_version: "1.0",
  charter_id: "chr_b4f2k7m5p3q6r4s2t4v6w3x2y4",
  charter_revision: 1,
  cofay_id: "cofay_c5g3m6n2q4r7s5t3v5w7x4y3z5",
  display_name: "Municipal Public Permit Intake Desk",
  role_archetype: "org_service",
  owner: {
    type: "organization",
    id: "org_civic-service-bureau",
  },
  steward_human_id: "hid_a3d5f7g4j2k4m6n5p2q4r6s7t2",
  managers: ["ifay_m2n4p6q7r2s4t6v5w2x4y6z2a4"],
  mission_statement:
    "Provide standardized municipal permit guidance, preliminary document verification, and application status inquiries on behalf of the Civic Service Bureau.",
  allowed_capabilities: {
    ssp_skills: [
      {
        skill_ref: "ssp://org_civic-service-bureau/permit-inquiry@1.0",
        visibility: "public",
        require_caller_auth: false,
      },
      {
        skill_ref: "ssp://org_civic-service-bureau/permit-filing@1.0",
        visibility: "restricted",
        require_caller_auth: true,
      },
    ],
    cap_bounds: {
      allowed_scopes: ["cap:document.verify", "cap:queue.dispatch"],
      max_autonomy_tier: "delegated",
      allow_irreversible_actions: false,
    },
  },
  prohibited_actions: [
    "Never impersonate any Human Prime or mount a personal Ego persona package.",
    "Never issue final administrative permit revocations without countersignature from the accountable human steward.",
  ],
  audit_policy: {
    retention_days: 365,
    log_mode: "hash_chain",
    require_actor_trace: true,
    gmc_merit_pocket_ref: "mpk_c5g3m6n2q4r7s5t3v5w7x4y3z5",
  },
  lifecycle_state: "ACTIVE",
  transfer_nonce: 0,
  issued_at: "2026-11-16T00:00:00Z",
};

const signedCharter = signRoleCharter(unsignedCharter, {
  signerId: unsignedCharter.steward_human_id,
  privateKeySeedHex:
    "0202020202020202020202020202020202020202020202020202020202020202",
});

console.log(validateRoleCharter(signedCharter)); // { valid: true, errors: [] }
console.log(runCoFactsL1Check(signedCharter).conformance); // "PASS"
```

---

## 4. Architecture Blueprint Navigation

Read the six normative blueprint chapters in order to master the ontological design, cryptographic governance contracts, and cross-protocol integration model of `coFay`:

1. **[Chapter 01: Overview and Ontology](./blueprint/01-Overview-and-Ontology.md)**: Examines the binary social division of labor in `Fay = iFay + coFay` and establishes the ontological boundary between transferable institutional role assets and non-transferable personal extensions.
2. **[Chapter 02: Three-Layer Architecture and Role Charter](./blueprint/02-Three-Layer-Architecture-and-Role-Charter.md)**: Explains why `coFay` prunes the personal Ego Layer and governs its Social, Interaction, and Cognition layers through `RoleCharter` 1.0.
3. **[Chapter 03: Public Role Taxonomy and Scenarios](./blueprint/03-Public-Role-Taxonomy-and-Scenarios.md)**: Details capability baselines and production deployment patterns across the three canonical archetypes: `org_service`, `functional_post`, and `project_collaborator`.
4. **[Chapter 04: Single-Layer Ownership and Steward Accountability](./blueprint/04-Single-Layer-Ownership-and-Steward-Accountability.md)**: Maps end-to-end authority, single-hop operational delegation, and natural-person accountability across `FayID`, `Faying 1.1`, `SSP`, `CAP`, and `GMChain`.
5. **[Chapter 05: Stateless Runtime, Merit Continuity, and Dual-Signed Transfer](./blueprint/05-Stateless-Runtime-Merit-Continuity-and-Dual-Signed-Transfer.md)**: Resolves horizontal stateless worker scaling against continuous `MeritPocket` attribution and specifies atomic dual-signed ownership handoffs via `TransferEnvelope` 1.0.
6. **[Chapter 06: coFACTS Conformance and Roadmap](./blueprint/06-coFACTS-Conformance-and-Roadmap.md)**: Defines the tiered `coFACTS` verification model, its orthogonal boundary with `iFACTS`, and the four-phase ecosystem roadmap.
