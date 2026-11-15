# 05. Stateless Runtime Elasticity, Merit Continuity, and Dual-Signed Transfer

## 5.1 Resolving the Core Tension: How Stateless Ephemeral Workers Sustain a Continuous Contribution Account

Engineering a public role incarnation surfaces an apparent architectural paradox:

- **From a high-availability systems perspective**: A `coFay` serving public skill invocations across the network must support stateless horizontal autoscaling, multi-region failover, and rolling container replacement. Terminating or recycling any individual worker process must never disrupt active callers.
- **From an institutional reputation perspective**: **Global Merit Chain** (`GMChain`) binds each canonical `cofay_<base32>` identifier 1:1 to a dedicated `MeritPocket` (see `Global-Merit-Chain`), accumulating long-term **MeriToken** (whose smallest unit is `μ` / **Merit Unit**) and community governance weight earned through verified public service.

How can disposable, stateless worker processes maintain an unbroken multi-year institutional reputation account?

`coFay` resolves this tension cleanly by **pushing execution elasticity down into the stateless runtime plane while anchoring identity, charter governance, and merit attribution in the persistent identity and ledger plane**:

```text
                        ┌───────────────────────────────────────────────────┐
Identity & Ledger Plane │  Persistent Identity: cofay_orgservicedesk234567  │
(Continuous, Tamper-    │  1:1 Bound Ledger:    GMChain MeritPocket (mpk_)  │
 Evident State)         │  Governance Anchor:   RoleCharter 1.0 (JCS Sig)   │
                        └─────────────────────────┬─────────────────────────┘
                                                  │ Mounts identical verified charter
                      ┌───────────────────────────┼───────────────────────────┐
                      ▼                           ▼                           ▼
Runtime Execution  [FayGer Worker #1]        [FayGer Worker #2]        [FayGer Worker #N]
Plane (Stateless,  No Ego / Autoscales       No Ego / Rolling          Multi-Region Failover /
Elastic Replicas)  on demand                 hot replacement           Scale-to-zero ready
```

1. **Stateless Runtime Elasticity**: **FayGer** worker containers executing cognitive reasoning and protocol parsing store zero local persona memory (having no Ego Layer). At startup, each replica mounts the active, signature-verified `RoleCharter` 1.0 alongside read-only domain knowledge bundles. Traffic spikes can scale a role out to hundreds of concurrent replicas in seconds and scale back down to zero during idle windows.
2. **Unified Cryptographic Representational Signing**: Stateless workers never emit anonymous or unattributed responses. Instead, workers sign outbound receipts and ledger attributions through HSM-backed or threshold-managed `cofay_` holder keys (see `FayID`) or via delegated representational signatures from authorized `managers: iFayID[]`.
3. **Merit Attributed to the Role, Never the Container**: External callers and peer evaluators assess the service quality delivered by the `cofay_` public role. All resulting non-monetary `MeriToken` ledger recordings accrue directly to the `MeritPocket` bound 1:1 to that `cofay_` identifier, preserving uninterrupted institutional credibility even after operators upgrade the underlying container image hundreds of times.

---

## 5.2 Why Ownership Handoffs Require an Atomic Dual-Signed Protocol

Unlike an individual `iFay`, which remains bound for life to a single **Human Prime**, a `coFay` serves as an institutional role asset with legitimate lifecycle handoff requirements. Common transitions include donating a mature open-source `project_collaborator` `coFay` from its founding developer's `HumanID` to an open-source foundation's `OrganizationID`, or transferring a public service window from a divesting corporate division to a newly chartered operating entity.

However, a naive single-signature transfer mechanism would expose three critical security vulnerabilities:

1. **Unilateral Hijacking or Liability Dumping**: Requiring only one party's signature would either allow an attacker to seize another owner's role or allow an outgoing holder to dump a `coFay` burdened with compliance disputes or pending penalties onto an unwitting third-party person or organization.
2. **Stale Manager Retention**: Prior to handoff, the outgoing owner typically configures internal shift delegates in `managers: iFayID[]`. If an ownership transfer silently carried the existing `managers` list forward for manual cleanup later, a dangerous race window would open at cutover during which the former owner's `iFay` delegates could still sign authoritative actions under the new owner's legal liability.
3. **Historical Transfer Replay Attacks**: Without a strictly monotonic anti-replay counter and cryptographic binding to the exact preceding charter digest, captured historical transfer payloads could be replayed to roll ownership backward.

---

## 5.3 `TransferEnvelope` 1.0: Normative Workflow for Atomic Dual-Signed Ownership Transfer

To eliminate all three failure modes by construction, `coFay` specifies the normative **`TransferEnvelope` 1.0** structure (defined under `$defs.TransferEnvelope` in `schemas/cofay-role-charter-1.0.json`):

### Step 1: Lock Prior Charter State and Monotonic Anti-Replay Nonce
Every transfer envelope must explicitly bind:

- `prior_charter_digest_hex`: Lowercase SHA-256 hex digest computed over the RFC 8785 JCS canonical serialization of the currently active `RoleCharter` (any mismatch fails immediately with `PRIOR_CHARTER_DIGEST_MISMATCH`).
- `transfer_nonce`: Strictly equal to `currentCharter.transfer_nonce + 1` (replaying an old nonce or skipping values fails immediately with `TRANSFER_NONCE_MISMATCH`).
- `from_owner` and `to_owner`: Both endpoints must satisfy single-layer ownership rules (`HumanID` or `OrganizationID` only; nested `ifay_` or `cofay_` owners fail with `OWNER_TYPE_FORBIDDEN`, and transferring to the identical owner fails with `SELF_TRANSFER_REDUNDANT`). Whenever `to_owner.type === "organization"`, the envelope must simultaneously designate the incoming natural-person steward in `new_steward_human_id`.

### Step 2: Enforce Stale Manager Clearing or Explicit Incoming Ratification (`manager_policy`)
`TransferEnvelope` 1.0 **strictly forbids silent inheritance of prior `managers`**, requiring an explicit choice between two mutually exclusive policies:

- **`"CLEAR_ALL"` (Recommended Safe Default)**: `ratified_managers` must be an empty array `[]` (non-empty arrays fail with `CLEAR_ALL_NON_EMPTY_MANAGERS`), atomically revoking every prior `iFay` operational delegate at the exact instant ownership transfers.
- **`"RATIFY_NEW"` (Zero-Downtime Cutover)**: Lists the exact incoming `iFay` operational delegates inside `ratified_managers`. Because the incoming owner's or steward's signature covers the entire transfer envelope, only `iFay` delegates explicitly ratified by the incoming side remain active, and the protocol strips unratified prior delegates atomically.

### Step 3: Collect Joint Outgoing and Incoming Ed25519 Signatures
After stripping signature fields, serializing the envelope via RFC 8785 JCS, and prepending the domain-separation tag `"ifay.cofay.ownership-transfer.v1\0"`, the transaction requires **both** valid Ed25519 signatures simultaneously:

- `from_signature`: Signed by the outgoing `owner.id` or outgoing `steward_human_id`.
- `to_signature`: Signed by the incoming `to_owner.id` or incoming `new_steward_human_id`.

Omitting either signature fails immediately with `TRANSFER_DUAL_SIGNATURE_REQUIRED`; any unauthorized signer or tampered payload fails deterministically with `TRANSFER_SIGNER_UNAUTHORIZED` or `TRANSFER_SIGNATURE_INVALID`.

---

## 5.4 Zero-Haircut `MeritPocket` Continuity and Incapacity Preservation Freeze

### 1. Role Continuity with Zero Inheritance Haircutting on `MeritPocket`
Under `GMChain` rules, post-mortem transfer of an individual's personal reputation applies strict five-tier intimacy haircutting (and forbids inheritance altogether below an intimacy score of `0.1`) so personal merit can never be commercialized. For a valid dual-signed `coFay` transfer, however, the `MeritPocket` belongs to the **`cofay_` public role itself** rather than to a departing individual. Provided `merit_continuity` declares both `preserve_cofay_id: true` and `preserve_merit_pocket: true` (violations fail with `MERIT_CONTINUITY_VIOLATION`), the `MeriToken` balance earned historically by that role carries forward intact under the incoming owner's stewardship with zero inheritance haircutting (see `Global-Merit-Chain`). Naturally, `MeriToken` continues to obey `GMChain`'s non-monetary time-decay curve toward its baseline floor: no organization can hoard static governance privilege merely by acquiring an established role, and sustained public trust always requires ongoing verified contribution.

### 2. Preservation Freeze Upon Organizational Dissolution or Steward Incapacity (`SUSPENDED_PENDING_SUCCESSION`)
What happens if an owning organization dissolves or its registered natural-person steward suffers sudden incapacity before completing a dual-signed transfer? Under cross-repository governance rules aligned with `FayID` ADR `0003`:

- The `coFay` **never rolls up silently** to a parent organization, **never mutates into an unaccountable autonomous agent**, and **never destroys its historical merit ledger**.
- Instead, its `lifecycle_state` transitions deterministically into **`"SUSPENDED_PENDING_SUCCESSION"`**: while frozen in this preservation state, mutations to operational `managers` are blocked (`CHARTER_NOT_ACTIVE`) and outbound restricted business actions pause.
- Only after executing a pre-registered threshold governance recovery procedure or completing a valid dual-signed `TransferEnvelope` 1.0 handoff does the role return to `"ACTIVE"` status and resume public service.
