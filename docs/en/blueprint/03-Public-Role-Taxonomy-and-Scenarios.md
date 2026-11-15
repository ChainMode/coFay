# 03. Public Role Taxonomy and Application Scenarios

## 3.1 Why `RoleCharter` 1.0 Establishes a Canonical Role Taxonomy

Across real-world institutions, public roles span municipal permitting, enterprise support, regulatory auditing, joint scientific research, and open-source governance. Treating every public role as an undifferentiated blob in `RoleCharter` 1.0 or, at the opposite extreme, hard-coding hundreds of industry-specific verticals would undermine protocol integrity: an untyped model cannot enforce differentiated default safety baselines across varying levels of institutional authority, whereas a sprawling vertical enum would fracture cross-domain interoperability.

To balance precision with extensibility, `coFay` classifies public roles along three orthogonal structural traits: **external service topology, discretionary authority boundary, and seat lifecycle**. Combining these traits yields three canonical `role_archetype` values in release 1.0:

1. **`org_service` (Organizational Public Service Window)**
2. **`functional_post` (Statutory or Governance Functional Post)**
3. **`project_collaborator` (Project or Special-Purpose Collaborative Unit)**

Every valid `RoleCharter` 1.0 document must declare one of these three exact values in `role_archetype`; any unrecognized string fails validation immediately with `ROLE_ARCHETYPE_INVALID`.

---

## 3.2 Archetype 1: `org_service` (Organizational Public Service Window)

### Positioning and Defining Characteristics
`org_service` represents a **standardized consultation, intake, and skill-delivery facade** operated externally by an enterprise, public agency, trade association, or sole proprietorship. It is the archetype external callers encounter most frequently in daily interactions.

- **Typical Ownership Structure**: Commonly owned by an `OrganizationID` (such as `org_civic-service-bureau`) paired with a mandatory natural-person steward (`steward_human_id`); independent studios or licensed sole practitioners may also anchor `owner` directly to a `HumanID`.
- **Recommended CAP Autonomy Profile**: Typically configured at `assistive` or `delegated` with `allow_irreversible_actions` set to `false`. This profile empowers automated policy lookups, ticket triage, appointment scheduling, and standardized skill execution while escalating irreversible legal or administrative commitments to the human steward or an authorized `iFay` manager.
- **SSP Skill Exposure Pattern**: Combines unauthenticated `public` inquiry skills (such as fee schedules or filing checklists) with caller-authenticated (`require_caller_auth: true`) `restricted` intake and case-tracking skills.

### Production Scenario: Municipal Permit and Public Consultation Desk
A municipal administrative service bureau deploys `cofay_orgservicedesk234567` as its public permitting desk. Rather than navigating fragmented agency portals, a resident instructs their personal `iFay`: *"Verify the fire-safety and business registration filings required to open a neighborhood bookstore."*

1. The resident's `iFay` discovers the municipal `coFay` via **SSP** and first verifies both the `org_civic-service-bureau` ownership claim and the human steward's Ed25519 signature on its `RoleCharter` 1.0 document.
2. Once verified, the resident's `iFay` invokes the `public` checklist inquiry skill and, after obtaining explicit confirmation from its **Human Prime**, submits a pre-screening dossier through the `restricted` filing skill.
3. Behind that single `cofay_` identity, dozens of stateless worker replicas absorb morning peak traffic in parallel, stamping every pre-screening receipt with an auditable `(cofay_id, owner_id, actor_signer_id)` provenance tuple.

---

## 3.3 Archetype 2: `functional_post` (Statutory or Governance Functional Post)

### Positioning and Defining Characteristics
`functional_post` models a **standing institutional seat vested with explicit charter authority, compliance attestation duties, or operational sign-off power** within an organization, cross-entity consortium, or ecosystem infrastructure. Its defining principle is institutional permanence: *the office endures while officeholders rotate*.

- **Typical Ownership Structure**: Owned by a governance board, foundation, or enterprise internal-controls body (`OrganizationID`) and strictly bound to the incumbent natural-person officeholder via `steward_human_id`.
- **Semantic Alignment with CAP `Official_Post`**: Within the **Control Authority Protocol** (`CAP`), high-sensitivity physical Hosts and critical infrastructure operations require authorization descriptors issued or countersigned by an institutional post (`Official_Post`; see `Control-Authority-Protocol`). A `functional_post` `coFay` serves as the normative role-layer carrier of those semantics and may declare `cap_bounds.max_autonomy_tier: "official_post"`.
- **Term Rotation and Unbroken Reputation Continuity**: When a chief security auditor completes a term and a successor assumes office, the owning organization updates `steward_human_id` and the active shift `managers: iFayID[]` array, then publishes an incremented `RoleCharter` (`charter_revision + 1`). Throughout the transition, the seat's `cofay_` identifier, external watcher subscriptions, and historical `MeritPocket` track record continue with zero interruption.

### Production Scenarios: Ecosystem Security Audit Seat and Low-Altitude Logistics Dispatch Post
- **Ecosystem Security Audit Post**: An open-source security consortium establishes a standing vulnerability disclosure and patch attestation seat, `cofay_govpostauditor234567`. Member projects push security advisories directly to that seat; on-duty security researchers operate the seat through their authorized `iFay` manager delegates to reproduce exploits and countersign remediation advisories, allowing downstream consumers to pin trust to one enduring seat key chain.
- **Campus Low-Altitude Airspace Dispatch Post**: An industrial park authority operates an airspace dispatch `functional_post` `coFay` interfacing with autonomous delivery drone Hosts over CAP and DTP. When severe wind shear triggers charter safety thresholds, the post issues deterministic ground-stop directives across active flight corridors within its bounded CAP scopes.

---

## 3.4 Archetype 3: `project_collaborator` (Project or Special-Purpose Collaborative Unit)

### Positioning and Defining Characteristics
`project_collaborator` is purpose-built for open-source repositories, multi-institution research grants, standards working groups, and cross-company engineering initiatives, serving as a **shared teammate endpoint that aggregates domain knowledge graphs, automated verification pipelines, and collaborative workflows**.

- **Typical Ownership Lifecycle**: Frequently initialized under a project founder's personal `HumanID` during early incubation. Once the initiative matures and joins an open-source foundation or formal research institute, atomic dual-signed ownership transfer (`TransferEnvelope` 1.0) hands the `coFay` cleanly over to the foundation's `OrganizationID` without breaking a single `cofay_` endpoint reference configured by external contributors.
- **Multi-Protocol Collaboration Fit**: Pairs naturally with the **Interactive Conversation Protocol** (`ICP`) to emit structured `.ctx` review annotations on RFC drafts, manuscripts, or code specifications, and with the **Telepathy Protocol** (`TP`) to coordinate bounded shared workspaces across contributors' individual `iFay` avatars (see `Interactive-Conversation-Protocol` and `Telepathy-Protocol`).

### Production Scenario: Cross-Institutional Research and Protocol Conformance Bot
A multilingual open-protocol working group launches `cofay_ossprojectbot234567` under the `project_collaborator` archetype. Contributors across global time zones connect their personal `iFay` avatars directly to the unit without waiting for human maintainers to wake up: the `coFay` executes conformance test vectors, audits nine-locale terminology invariants, and returns structured `.ctx` review annotations. As peer contributors endorse high-utility reviews on **Global Merit Chain** (`GMChain`), non-monetary **MeriToken** attribution accrues continuously in the unit's dedicated `MeritPocket`, transparently reflecting the collaborative project's public impact.

---

## 3.5 Capability Baseline Comparison Across the Three Role Archetypes

| Dimension | `org_service` | `functional_post` | `project_collaborator` |
| :--- | :--- | :--- | :--- |
| **Primary Design Goal** | High-concurrency standardized public or customer service intake | Strictly accountable standing governance, sign-off, and compliance attestation | Domain knowledge synthesis, multi-party R&D coordination, and transferable stewardship |
| **Typical Single-Layer Owner** | `OrganizationID` (or sole-proprietor `HumanID`) | `OrganizationID` (with mandatory natural-person steward) | `HumanID` during incubation; often transferred to `OrganizationID` at maturity |
| **Typical SSP Skill Visibility** | Mix of `public` inquiry + `restricted` intake | Predominantly `restricted` or `private` with mandatory caller authentication | `public` (open-source collaboration) or `restricted` (consortium members) |
| **Typical CAP Ceiling Tier** | `assistive` / `delegated` | `delegated` / `official_post` | `assistive` / `delegated` |
| **Canonical Lifecycle Transition** | Shift rotation across operational `managers` | Incumbent steward term handoff (`cofay_` unchanged) | Dual-signed ownership transfer from founding individual to foundation |
