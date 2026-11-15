# 02. Three-Layer Architecture (No Ego Layer) and Role Charter

## 2.1 Architectural Pruning of the Four-Layer Stack in coFay

The umbrella `ifay` specification defines a canonical four-layer reference architecture composed of the **Social Layer**, **Interaction Layer**, **Cognition Layer**, and **Ego Layer**. Across these four layers, the two `Fay` species diverge along a crisp structural boundary: an individual `iFay` mounts all four layers, whereas **`coFay` consists solely of the Social, Interaction, and Cognition layers and strictly forbids mounting an Ego Layer**.

```text
┌───────────────────────────────────────────────────────────────────────┐
│  [ PRUNED / STRICTLY FORBIDDEN ] Ego Layer                            │
│  x Never replicates personal persona memory                           │
│  x Never mounts @ego-models/* personal replica packages               │
├───────────────────────────────────────────────────────────────────────┤
│  Governance Cap: Normative RoleCharter 1.0 (Ed25519 + RFC 8785 JCS)   │
│  + Mission statement  + SSP/CAP capability bounds                     │
│  + Explicit redlines  + Tamper-evident audit policy                   │
├───────────────────────────────────────────────────────────────────────┤
│  Layer 3: Cognition Layer                                             │
│  - Domain reasoning and workflow orchestration                        │
│  - Institutional policy evaluation and deterministic skill routing    │
├───────────────────────────────────────────────────────────────────────┤
│  Layer 2: Interaction Layer                                           │
│  - Structured dialogue (ICP) and high-bandwidth coordination (TP)     │
│  - Charter-bounded terminal Host operations via CAP and DTP           │
├───────────────────────────────────────────────────────────────────────┤
│  Layer 1: Social Layer                                                │
│  - cofay_ identity and credential lifecycle                           │
│  - JWS-signed SSP skill publication and GMChain MeritPocket binding   │
└───────────────────────────────────────────────────────────────────────┘
```

Why must a `coFay` never possess an Ego Layer? This prohibition is not a technical limitation on loading fine-tuned adapters; it is enforced by three non-negotiable governance invariants:

1. **Preventing Anthropomorphic Misrepresentation to the Public**: The sole purpose of the Ego Layer (see `Ego`) is to replicate the personal value hierarchy, emotional cadence, and private episodic memory of a specific **Human Prime**. Mounting a natural person's private Ego package inside a public municipal desk or statutory review post would inject private cognitive bias into institutional adjudication while misleading external callers into believing they are conversing privately with that individual.
2. **Guaranteeing Stateless Consistency Across Horizontal Replicas**: Public role endpoints routinely handle thousands of concurrent collaboration sessions. If worker instances relied on an Ego Layer subject to subjective drift or local private memory, parallel workers would issue contradictory rulings under identical institutional rules. Pruning the Ego Layer ensures that the same signed `RoleCharter` and domain knowledge base govern every worker replica deterministically.
3. **Eliminating Personal Privacy Leakage During Ownership Transfer**: As an institutional role asset, a `coFay` can be transferred across accountable owners. If slices of a former steward's or operator's personal Ego state lingered inside the role runtime, transferring ownership would trigger catastrophic personal data exposure. Consequently, whenever the validator encounters any forbidden personal-replica property (`ego_package`, `ego_model`, `ego_profile`, `human_prime_id`, or `personal_persona`), it halts immediately with the hard error `COFAY_EGO_FORBIDDEN`.

---

## 2.2 Functional Division Across the Three Active Runtime Layers

With the Ego Layer structurally excised, the remaining three layers collaborate around a single objective: faithful execution of the public `RoleCharter`.

### 1. Social Layer: Public Identity, Verifiable Credentials, and Service Facade
The Social Layer manages the verifiable network identity and external service contracts of the `coFay`:

- Safeguards the canonical `cofay_<base32>` identifier and its associated holder-of-key verification credentials (see `FayID`).
- Publishes `cofay_`-signed JWS skill descriptors via the **Skill Sharing Protocol** (`SSP`; see `Skill-Sharing-Protocol`), partitioning exposed endpoints across three explicit visibility tiers: `public` (open unauthenticated queries), `restricted` (authenticated partner or citizen invocations), and `private` (internal administrative operations).
- Maintains the ledger attribution reference (`gmc_merit_pocket_ref`) pointing to the role's 1:1 bound `MeritPocket` on **Global Merit Chain** (`GMChain`), recording the non-monetary **MeriToken** earned through verified collaborative service (see `Global-Merit-Chain`).

### 2. Interaction Layer: Multimodal Engagement and Bounded Host Actuation
The Interaction Layer standardizes both inbound collaboration channels with external callers and outbound actuation over inhabited **Hosts** (where `Host` denotes terminal hardware devices or software applications only):

- **Inbound Protocol Engagement**: Supports context-rich structured annotation workflows over the **Interactive Conversation Protocol** (`ICP`; see `Interactive-Conversation-Protocol`) alongside high-bandwidth inter-Fay goal alignment and consultation sessions over the **Telepathy Protocol** (`TP`; see `Telepathy-Protocol`).
- **Outbound Bounded Host Control**: Whenever a public role operates enterprise software queues, environmental sensors, or dedicated kiosk Hosts, every command must execute through the **Control Authority Protocol** (`CAP`) and **Data Tunnel Protocol** (`DTP`) strictly within the scope declared by `RoleCharter.allowed_capabilities.cap_bounds` (see `Control-Authority-Protocol` and `Data-Tunnel-Protocol`). Unlisted Host resources remain unreachable by design.

### 3. Cognition Layer: Charter-Gated Domain Reasoning and Skill Orchestration
The Cognition Layer serves as the domain reasoning engine of the `coFay` and assembles declaratively inside the **FayGer** container runtime (see `FayGer`):

- Mounts role-specific regulatory corpora, architectural indexes, or standard operating procedures (SOPs).
- Enforces a mandatory **Charter Policy Gate** prior to emitting any external commitment or Host command, cross-checking every proposed action against the `allowed_capabilities` allowlist and the `prohibited_actions` redline array. Any action that touches a redline or exceeds `max_autonomy_tier` (for example, attempting an irreversible state mutation while `allow_irreversible_actions` is `false`) suspends execution automatically and escalates to the accountable human steward or an authorized `iFay` operational manager.

---

## 2.3 `RoleCharter` 1.0: The Institutional Constitution Replacing the Ego Layer

Where an `Ego` model answers *"Whose personal replica am I, and what personal sensibilities do I uphold?"* for an `iFay`, **`RoleCharter` 1.0** (normative Schema URI: `https://ifay.ai/schemas/cofay-role-charter-1.0.json`) answers *"What public mandate do I fulfill, who owns me, which natural person stands accountable, what capabilities may I exercise, and what redlines may I never cross?"* for a `coFay`.

A compliant `RoleCharter` 1.0 document comprises five normative structural blocks:

### (1) Identity and Revision Metadata Block
- `schema_version`: Fixed to the two-segment string `"1.0"`.
- `charter_id` (`chr_<base32>`) and strictly positive integer `charter_revision`: Establish an unambiguous version anchor for every charter amendment.
- `cofay_id` (`cofay_<base32>`), human-readable `display_name`, and `role_archetype` (one of the three canonical public role archetypes).
- `lifecycle_state`: Explicitly declares `"ACTIVE"`, `"SUSPENDED_PENDING_SUCCESSION"` (preservation freeze pending succession), or `"REVOKED"` (permanently decommissioned).
- `transfer_nonce`: Initializes at `0` and increments strictly by `1` exclusively upon each valid dual-signed ownership transfer.

### (2) Accountability Anchoring and Orthogonal Delegation Block
- `owner`: Single-layer ownership reference specifying either `human` (`hid_<base32>`) or `organization` (`org_<slug|base32>`).
- `steward_human_id`: Mandatory natural-person steward identifier (`hid_<base32>`) whenever `owner.type === "organization"`, guaranteeing that organizational accountability penetrates directly to an identifiable human being.
- `managers`: Zero or more orthogonal operational delegate identifiers (`ifay_<base32>[]`).

### (3) Mission Statement, Capability Allowlist, and Behavioral Redlines Block
- `mission_statement`: Publicly inspectable statement of institutional purpose and service scope.
- `allowed_capabilities.ssp_skills`: Per-skill declarations specifying the skill URI (`skill_ref`), `visibility` tier, and caller authentication gate (`require_caller_auth`). As a hard normative rule, every skill with `visibility` set to `"restricted"` or `"private"` **must** enforce `require_caller_auth: true` (violations fail immediately with `SSP_AUTH_REQUIRED_FOR_NON_PUBLIC`), preventing security-by-obscurity directory hiding from substituting for cryptographic caller authentication.
- `allowed_capabilities.cap_bounds`: Constrains permitted CAP permission scopes (`allowed_scopes`), ceiling autonomy tier (`assistive`, `delegated`, or `official_post`), and irreversible actuation permission (`allow_irreversible_actions`).
- `prohibited_actions`: Non-empty array of machine-readable compliance redlines.

### (4) Self-Contained Local Audit Policy Block (`audit_policy`)
- Specifies minimum log retention duration (`retention_days`), tamper-evident storage mode (`hash_chain` or `append_only`), and mandatory actor attribution (`require_actor_trace: true`).
- Requires every outbound representational action log entry to record the canonical `(cofay_id, owner_id, actor_signer_id)` tuple while strictly forbidding `acting_as_natural_person: true` (`NATURAL_PERSON_IMPERSONATION_FORBIDDEN`), preserving full evidentiary auditability even on isolated local networks.

### (5) RFC 8785 JCS + Ed25519 Ownership Signature Block (`owner_signature`)
To eliminate cross-language signature verification failures caused by divergent JSON key ordering or whitespace formatting, `RoleCharter` 1.0 mandates deterministic signing: the signer serializes the charter payload (with `owner_signature` stripped) into canonical UTF-8 bytes via the **RFC 8785 JSON Canonicalization Scheme (JCS)**, prepends the explicit domain-separation tag `"ifay.cofay.role-charter.v1\0"`, and signs the resulting byte sequence using the Ed25519 private key of `owner.id` or `steward_human_id`. Modifying even a single character anywhere in the charter deterministically triggers `CHARTER_SIGNATURE_INVALID`.
