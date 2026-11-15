# 06. coFACTS Conformance Framework and Phased Roadmap

## 6.1 Why `iFACTS` and `coFACTS` Enforce an Orthogonal Boundary

In an open multi-vendor protocol ecosystem, objective and reproducible automated conformance testing determines whether implementations interoperate reliably or fragment into incompatible claims. The umbrella `ifay` repository establishes **iFACTS** (*iFay Architecture Conformance Test Suite*) and the `iFay Ready` certification tiers for individual digital avatars (see `ifay`). Why, then, does the ecosystem maintain a separate conformance suite for `coFay` rather than folding public roles into `iFACTS`?

Because **their core security invariants are diametric opposites**:

- Under `iFACTS`, a conformant individual avatar implementation must prove that it accurately mounts and aligns with its **Human Prime**'s personal `Ego` model, executes exclusive 1:1 Prime pairing handshakes, and honors guardian succession transitions.
- Under `coFay`, mounting any personal `Ego` model constitutes a **critical security violation (`COFAY_EGO_FORBIDDEN`)**. Conversely, the foundational invariants mandatory for `coFay`, including natural-person steward penetration (`steward_human_id`), single-layer anti-nesting ownership, and atomic prior-manager clearing during dual-signed transfers, do not exist on personal `iFay` avatars.

Accordingly, the ecosystem enforces bilateral target-boundary interception:

1. **`@ifay/ifacts` verifies exclusively individual `iFay` implementations and compatible Host integrations**, intercepting `cofay_` targets explicitly and directing operators to `coFACTS` (see `ifay`).
2. **`coFACTS` (*Common Fay Architecture Conformance Test Suite*) verifies exclusively `coFay` role implementations, charters, and governance transitions**. Whenever `runCoFactsL1Check` detects an input carrying an `ifay_` identifier or an `IFAY_MANIFEST` / `IFAY_ID` kind marker, it halts immediately and returns `conformance: "REJECTED_BOUNDARY"` with error code `BOUNDARY_IFAY_USE_IFACTS`.

---

## 6.2 Three-Tier Progressive Conformance Model in `coFACTS`

Aligned with ecosystem verification methodology, `coFACTS` defines three strictly progressive conformance levels (implementations must pass 100% of L1 checks before claiming L2 or L3 conformance):

| Level | Conformance Tier Name | System Under Test and Core Verification Scope | Delivery Status |
| :--- | :--- | :--- | :--- |
| **L1** | **Charter & State Conformance** | Deterministic offline verification of `RoleCharter` 1.0 JSON Schema compliance, Ego-layer prohibition, canonical role archetype enumeration, single-layer ownership and mandatory natural-person steward binding, SSP non-public caller authentication gates, RFC 8785 JCS + Ed25519 signature integrity, single-hop `iFay` delegation without re-delegation, and `TransferEnvelope` 1.0 atomic dual-signed ownership transfers with replay protection | **v1.0 Delivered** (built into `@ifay/cofay`) |
| **L2** | **Cross-Protocol Interface Conformance** | Live wire-protocol verification against running `coFay` endpoints: validates `/.well-known/skill-sharing` JWS-signed SSP descriptors and mutual caller authentication on restricted endpoints, `Faying 1.1` delegated stewardship credential chains, CAP `cap_bounds` out-of-scope command blocking on terminal Hosts, and role-identity disclosure in ICP and TP sessions | **Planned for Phase 2** |
| **L3** | **Elasticity & Audit Continuity** | End-to-end resilience and governance chaos drills: verifies behavioral determinism across concurrent stateless FayGer workers, tamper-evident integrity of local hash-chained `(cofay_id, owner_id, actor_signer_id)` audit logs, automatic `SUSPENDED_PENDING_SUCCESSION` freeze transitions upon steward incapacity, and continuous ledger attribution reconciliation with **Global Merit Chain** (`GMChain`) `MeritPocket` state | **Planned for Phase 3** |

---

## 6.3 Six Automated `coFACTS` L1 Checks and Machine-Readable Report Format

Exported from `src/cofay-charter.mjs`, `runCoFactsL1Check(subject)` provides a zero-dependency reference L1 conformance runner that emits deterministic `report_version: "cofacts-l1-report/1.0"` JSON reports:

```json
{
  "report_version": "cofacts-l1-report/1.0",
  "suite": "coFACTS",
  "level": "L1",
  "target_id": "cofay_orgservicedesk234567",
  "conformance": "PASS",
  "checks": [
    { "id": "L1-BOUNDARY-01", "name": "coFACTS vs iFACTS target boundary", "passed": true },
    { "id": "L1-NO-EGO-02", "name": "Absence of personal Ego layer attachment", "passed": true },
    { "id": "L1-TAXONOMY-03", "name": "Canonical public role archetype", "passed": true },
    { "id": "L1-OWNERSHIP-04", "name": "Single-layer ownership & natural-person steward accountability", "passed": true },
    { "id": "L1-CAPABILITIES-05", "name": "SSP caller auth gates, CAP bounds & explicit red lines", "passed": true },
    { "id": "L1-CRYPTO-06", "name": "Ed25519 JCS RoleCharter signature & actor traceability policy", "passed": true }
  ],
  "errors": []
}
```

Accompanying the reference checker, `vectors/cofay-role-charter-vectors.json` ships **20 normative positive and negative test vectors** (`V01` through `V20`). Independent third-party teams implementing `coFay` runtimes or governance gateways in Rust, Go, Python, or TypeScript must accept every positive vector and reject every negative vector with its exact normative error code before claiming `coFACTS` L1 conformance.

---

## 6.4 Four-Phase Ecosystem Roadmap

The evolution of `coFay` progresses deliberately from cryptographic charter contracts to live cross-protocol interoperability and large-scale public-sector governance:

### Phase 1: Normative Specification Baseline and `coFACTS` L1 (Delivered, `2025-10-25` Initial Release Baseline)
- Establish the Ego-free three-layer public role ontology and the three canonical release-1.0 role archetypes (`org_service`, `functional_post`, and `project_collaborator`).
- Freeze the normative JSON Schema for `RoleCharter` 1.0 and atomic dual-signed `TransferEnvelope` 1.0 (`schemas/cofay-role-charter-1.0.json` together with the byte-identical `schema/2025-10-25/` release triad).
- Ship 20 deterministic Ed25519 + RFC 8785 JCS conformance test vectors alongside the zero-dependency `@ifay/cofay` reference validation and signing library.
- Deliver complete nine-locale architectural blueprints and quickstart documentation.

### Phase 2: Live Cross-Protocol Endpoint Integration and `coFACTS` L2 (Near-Term)
- Complete live wire-level interoperability testing across `Faying 1.1` (`coFay` Delegated Stewardship Profile), `SSP 1.0` skill servers, and static index registries in `FayGer`.
- Release the automated HTTP/TLS `coFACTS` L2 conformance probe to inspect live `RoleCharter` endorsements and verify caller authentication enforcement on restricted SSP endpoints.

### Phase 3: Threshold Key Custody, Multi-Instance Elasticity, and `coFACTS` L3 (Mid-Term)
- Integrate N-of-M organizational threshold multisignature policies from `FayID` to support board-ratified charter amendments and emergency succession drills for large public institutions.
- Ship stateless `coFay` worker templates for **FayGer** container orchestration alongside distributed tamper-evident hash-chain audit aggregators, unlocking full `coFACTS` L3 certification.

### Phase 4: Global Merit Chain (`GMChain`) Public Service Ecosystem at Scale (Long-Term Vision)
- Enable cross-industry public role directory discovery and transparent `MeritPocket` track-record inspection, empowering municipal service desks, academic peer-review seats, and open-source infrastructure units to collaborate within a high-trust, accountable, non-monopolistic human-agent society anchored by non-monetary **MeriToken** attribution.
