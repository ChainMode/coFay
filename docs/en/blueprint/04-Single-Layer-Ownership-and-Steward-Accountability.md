# 04. Single-Layer Ownership, Orthogonal Delegation, and Steward Accountability

## 4.1 Why Ownership, Organizational Hierarchy, and Operational Delegation Must Remain Orthogonal

One of the most dangerous architectural anti-patterns in a large-scale distributed agent ecosystem is collapsing *who legally owns an agent*, *how parent and subsidiary organizations nest*, and *who is authorized to operate the agent on today's shift* into a single tree. Permitting one `coFay` to own another `coFay`, or permitting an `iFay` to stand as the legal owner of a `coFay`, rapidly spawns opaque multi-hop shell chains: external auditors can no longer determine which natural person or legal entity bears ultimate liability, and routine staffing changes trigger cascading permission outages.

To eliminate multi-hop shell ambiguity by construction, `coFay`, **FayID**, and **Global Merit Chain** (`GMChain`) enforce a unified **Three-Orthogonal-Axes Model** across repositories (see `FayID` and `Global-Merit-Chain`):

1. **Ownership Axis**: Answers *"Who holds property rights and ultimate legal responsibility for this `coFay`?"* Strictly constrained to **single-layer ownership**.
2. **Organization Hierarchy Axis**: Answers *"How does a parent enterprise relate to its subsidiary divisions?"* Expressed exclusively inside `OrganizationID`'s own single-parent rooted acyclic tree in `FayID`, never simulated by nesting `coFay` instances.
3. **Operational Delegation Axis**: Answers *"Which individual avatars are authorized to operate this `coFay` during daily shifts?"* Granted orthogonally via single-hop `managers: iFayID[]` delegations without altering the underlying `owner`.

---

## 4.2 Single-Layer Ownership Invariant and Natural-Person Steward Accountability

Under `RoleCharter` 1.0, every `coFay` has one and only one accountable `owner` at any point in time:

- **Direct Natural-Person Ownership**: `owner = { "type": "human", "id": "hid_<base32>" }`
- **Direct Organizational Ownership**: `owner = { "type": "organization", "id": "org_<slug|base32>" }`

Both JSON Schema evaluation and runtime validation deterministically reject any attempt to populate `owner.id` with an `ifay_<base32>` or `cofay_<base32>` identifier, returning `OWNER_TYPE_FORBIDDEN`. Even when an owning subsidiary `org_sub` has a registered parent organization `org_parent` in `FayID`, the `coFay`'s `owner` field must name the direct holder `org_sub` explicitly and never rolls up implicitly to the parent entity.

### Mandatory Natural-Person Steward Under Organizational Ownership
An organization is a legal and institutional abstraction: it cannot physically safeguard hardware cryptographic keys or exercise natural-person ethical oversight on its own. Accordingly, `RoleCharter` 1.0 enforces a strict accountability penetration rule:

> **Every `coFay` whose `owner.type === "organization"` must explicitly declare a valid natural-person steward in `steward_human_id` (formatted strictly as `hid_<base32>`).**

- Omitting `steward_human_id` under organizational ownership fails immediately with `ORG_STEWARD_REQUIRED`.
- Supplying an `ifay_` or `cofay_` identifier in `steward_human_id` fails immediately with `STEWARD_MUST_BE_HUMAN`.

This rule guarantees that no matter how complex an enterprise or public agency becomes, every active `coFay` in the ecosystem remains anchored to a uniquely identifiable natural person directly accountable for charter compliance.

---

## 4.3 Orthogonal Single-Hop `iFay` Operational Delegation and No Re-Delegation

In day-to-day operations, an owning **Human Prime** or organizational steward cannot manually sign every routine configuration update or queue dispatch round the clock. To support scalable shift operations, the owner or steward may list one or more trusted Human Primes' individual avatars inside `RoleCharter.managers` (for example, `["ifay_opsmanageralpha2345", "ifay_opsmanagerbravo2345"]`).

Orthogonal operational delegation enforces three strict security invariants:

1. **Operational Delegation Never Alters Ownership**: Adding or removing entries in `managers` adjusts routine operational representation only; `owner` remains untouched. Operational managers cannot initiate ownership transfers and cannot amend the `RoleCharter` mission statement or behavioral redlines.
2. **Delegates Must Be `iFay` Avatars Only**: Routine management actions must run through individual avatars governed directly by accountable Human Primes. Assigning another `coFay` as a manager of the current `coFay` is strictly rejected with `MANAGER_TARGET_INVALID`, preventing cross-role control loops.
3. **Strict Single-Hop Discipline (No Re-Delegation)**: Only `owner.id` or `steward_human_id` may issue `GRANT` or `REVOKE` delegation changes. If an already authorized manager `ifay_A` attempts to sub-delegate management privileges to `ifay_B`, the validator rejects the request immediately with `MANAGER_REDELEGATION_FORBIDDEN`. Single-hop enforcement stops runaway privilege propagation cold.

---

## 4.4 End-to-End Accountability Chain Across Five Core Ecosystem Protocols

How does a compliant `coFay` thread this accountability model across the full protocol stack? The diagram below traces the five-repository coordination topology from sovereign identity registration to bounded Host actuation and merit attribution:

```text
[FayID 1.0] Establishes hid_ / org_ / ifay_ / cofay_ holder-of-key identities & single-layer ownership
     │
     ▼
[coFay RoleCharter 1.0] Owner or steward signs charter: locks archetype, SSP/CAP bounds & managers[]
     │
     ├──▶ [Faying 1.1] (coFay Delegated Stewardship Profile)
     │      Verifies the Human Prime / Steward ──▶ iFay Manager ──▶ coFay delegation credential chain
     │
     ├──▶ [SSP 1.0 & CAP 1.0]
     │      Publishes cofay_-signed JWS skill descriptors; actuates terminal Hosts within cap_bounds
     │
     └──▶ [GMChain]
            Records verified social contributions into the 1:1 bound MeritPocket (non-monetary MeriToken)
```

Specifically, cross-protocol integration follows three normative handshakes:

- **Alignment with `Faying 1.1`**: While `Faying 1.0` focuses on 1:1 pairing between a Human Prime and their personal `iFay` and remains frozen as published, the backward-compatible **`Faying 1.1` (`coFay` Delegated Stewardship Profile)** extension (see `Faying-Protocol`) carries verifiable delegation chains across `Human Prime / Steward -> iFay Manager -> coFay` alongside dual-signed ownership transfer authorization semantics without breaking 1.0 implementations.
- **Alignment with `SSP 1.0`**: When an external caller (typically an `iFay` operating under its Human Prime's Mandate) invokes a `coFay` skill, `InvocationRequest.caller.id` carries a canonical `FayID`, while the `coFay` enforces mutual caller authentication on both descriptor retrieval and skill execution for all `restricted` and `private` endpoints (see `Skill-Sharing-Protocol`).
- **Alignment with `CAP 1.0`**: Whenever a `coFay` inhabits and actuates a kiosk or enterprise application **Host** (terminal hardware device or software application), the Host driver evaluates the CAP authorization descriptor against `RoleCharter.allowed_capabilities.cap_bounds`, blocking any command that steps outside `allowed_scopes` or violates `allow_irreversible_actions` (see `Control-Authority-Protocol`).

---

## 4.5 Representational Action Audit Trails and Offline Traceability

To guarantee forensic reconstruction during compliance reviews or incident postmortems, `coFay` defines **representational traceability** as an intrinsic semantic invariant independent of external network reachability or live blockchain connectivity:

1. **Zero Natural-Person Impersonation**: Every external statement, skill response, or Host action issued by a `coFay` executes strictly in the name of the chartered public role under its accountable owner. Any audit record carrying `acting_as_natural_person: true` fails validation immediately with `NATURAL_PERSON_IMPERSONATION_FORBIDDEN`.
2. **Mandatory Three-Tuple Audit Anchor**: Every outbound invocation, sign-off, or state mutation record must persist three cryptographic identifiers together:
   - `cofay_id`: Identifier of the public role discharging the action.
   - `owner_id`: Identifier of the legal single-layer owner at the exact timestamp of execution.
   - `actor_signer_id`: Identifier of the authorized key holder that signed the action (restricted strictly to the `cofay_` role key itself, `owner.id`, `steward_human_id`, or an active `ifay_` listed in `managers`; any unlisted signer fails immediately with `AUDIT_ACTOR_UNAUTHORIZED`).
3. **Graceful Offline Degradation**: Even when a deployment runs inside an air-gapped facility or before connecting to the `GMChain` mainnet, local `hash_chain` or `append_only` audit logs preserve complete cryptographic proof over every `(cofay_id, owner_id, actor_signer_id)` tuple, enabling optional batch digest anchoring once connectivity resumes.
