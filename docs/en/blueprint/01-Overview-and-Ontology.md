# 01. Overview and Ontological Positioning

## 1.1 Why a Digital Society Cannot Consist Solely of Individual Avatars

As autonomous and assistive AI agents integrate across human collaborative networks, modeling every digital entity as a personal mirror of a specific natural person quickly hits a structural wall. When a resident files a municipal permit application, when a software engineer requests a compliance audit from an open-source foundation, or when an interagency task force connects to a round-the-clock hospital triage desk, the caller is not seeking a private persona replica of an individual clerk on shift. Instead, the caller requires a **public social role with explicit authority boundaries, a transparent service contract, and institutional continuity that persists seamlessly across staff rotations**.

To address this foundational requirement at the architectural root, the iFay ecosystem establishes a binary ontological formula (see the umbrella specification in `ifay`):

`Fay = iFay + coFay`

Within this formula, **`Fay`** serves strictly as the umbrella noun encompassing all digital incarnations across the ecosystem; it must never be used in isolation to denote solely personal avatars or solely non-personal entities. Two complementary, orthogonal species compose the ecosystem:

1. **`iFay` (`Individual Fay`, Individual Digital Avatar)**: Instantiated from a specific natural person, known as the **Human Prime** (or **Prime**), and equipped with a compact personal **Ego** model aligned to that Prime's values, preferences, and behavioral habits. An `iFay` operates as the Human Prime's personal extension across digital and physical **Hosts** (where `Host` refers strictly to terminal hardware devices or software applications, never to humans).
2. **`coFay` (`Common Fay`, Public Role Incarnation)**: Defined and governed by a normative **`RoleCharter`**, a `coFay` is a publicly addressable, functional social role incarnation identified by the canonical `cofay_` prefix (see `FayID`). Rather than replicating any natural person's private personality or episodic memory, a `coFay` discharges public duties on behalf of a legal organization, an institutional governance post, or a collaborative project.

---

## 1.2 The Ontological Divide: Transferable Role Assets vs. Non-Transferable Personal Extensions

The fundamental axis separating `coFay` from `iFay` does not lie in which foundation model runs beneath the hood or which cluster hosts the container. The true boundary is an **ethical, legal, and property-rights distinction between an institutional role asset and an inalienable extension of natural-person personhood**:

| Comparison Dimension | `iFay` (Persona-Extension Fay) | `coFay` (Institutional Role-Asset Fay) |
| :--- | :--- | :--- |
| **Ontological Essence** | Digital replica of a Human Prime's personal will, preferences, and capabilities | Chartered social post, organizational service window, or collaborative endpoint |
| **Relationship to Natural Persons** | Bound 1:1 for life to a single Human Prime (one Prime may own multiple `iFay` instances); **strictly never sold or transferred** | Single-layer ownership under `HumanID` or `OrganizationID`; **supports atomic dual-signed ownership transfer** |
| **External Representational Standing** | Acts strictly in the personal name of its sole Human Prime | Performs public role duties on behalf of its **current accountable owner** (organization or sole proprietor), never impersonating a natural person |
| **Incapacity or Dissolution Handling** | Transitions upon the Human Prime's passing into guardian oversight or a restricted memorial sandbox (see `ifay`) | Enters the `SUSPENDED_PENDING_SUCCESSION` preservation freeze if an owning organization dissolves or its human steward becomes incapacitated prior to handoff (see `FayID`) |
| **Global Merit Chain (`GMChain`) Account** | Bound to personal reputation; post-mortem inheritance applies strict intimacy-tiered haircutting (see `Global-Merit-Chain`) | Bound 1:1 to a dedicated role `MeritPocket`; valid dual-signed ownership transfer **preserves role continuity with zero inheritance haircutting on `MeriToken`** |
| **Conformance Authority** | **iFACTS** (iFay Architecture Conformance Test Suite) | **coFACTS** (Common Fay Architecture Conformance Test Suite) |

Blurring these two species produces severe governance failures in both directions. Packaging a corporate customer-support endpoint as a self-aware "autonomous digital person" creates an accountability black box designed to shield operators from legal and ethical liability when breaches or torts occur. Conversely, pressing an employee's personal `iFay` into service as an enterprise's official contracting desk binds institutional relationships and public trust to a private identity that fractures the moment that employee changes jobs.

`coFay` eliminates this dilemma through institutionalized role incarnation: the public seat endures across personnel changes, its governing charter remains publicly verifiable, legal responsibility penetrates unambiguously to natural persons, and operational staffing rotates smoothly without service disruption.

---

## 1.3 Four Societal Pillars of Addressable Public Roles

With the binary division of labor established, `coFay` fulfills four irreplaceable infrastructure functions across the ecosystem:

### 1. Decoupling Public Service Addressing from Backend Staffing
Much as DNS domain names and standard service ports decoupled reaching a network service from dialing a specific machine operator's telephone, `coFay` enables Human Primes (acting through governed `iFay` avatars) and peer `Fay` instances to address functional roles directly. Callers seeking municipal tax guidance connect to the tax advisory `coFay`; callers reporting an open-source vulnerability connect to the project security post `coFay`. The caller cryptographically verifies the `RoleCharter` and ownership signature attached to that `cofay_` identifier without needing to know which operational delegate instance is currently on shift behind the endpoint.

### 2. Eliminating Unaccountable "Orphan Autonomous Agents"
Under the governance invariants of the `Fay` ecosystem, no unowned "wild autonomous AI" may operate outside natural-person or legal-entity accountability. From inception, every `coFay` anchors to exactly one single-layer owner (`HumanID` or `OrganizationID`). Whenever the owner is an organization, the charter further mandates an explicit natural-person steward (`steward_human_id`). Every outbound skill invocation, Host control request, or ledger interaction traces deterministically along a cryptographic signature chain back to both the legal owner and the active signing actor.

### 3. Compounding Institutional Public Trust Across Personnel Transitions
The societal credibility of a municipal agency desk, an academic peer-review board seat, an open-source maintainer group, or a commercial service window belongs to the institutional track record of that role over time. By binding a dedicated `MeritPocket` 1:1 to each `cofay_` identity on **Global Merit Chain** (`GMChain`; see `Global-Merit-Chain`), the **MeriToken** (whose smallest accounting unit is `μ` / **Merit Unit**) earned through verified social contributions accumulates continuously under the role itself. As an immutable ecosystem redline, `MeriToken` is a strictly non-monetary measure of social contribution and governance weight: it is never mined, never speculated upon, never cashed out, and never two-way exchangeable for fiat currency.

### 4. Isolating Public Collaboration Planes from Personal Privacy
A Human Prime's personal `iFay` processes intimate life trajectories, private communications, and personal preferences that remain shielded by strict default privacy boundaries (see `FayID`). By contrast, `coFay` is purpose-built for public or access-controlled collaborative domains. Its `cofay_` identifier, owning entity, mission statement, exposed **Skill Sharing Protocol** (`SSP`) descriptors, and prohibited behavioral redlines are published inside a cryptographically verifiable `RoleCharter`, allowing external callers to execute zero-trust compliance preflight checks before initiating a single interaction.

---

## 1.4 Single-Repository Self-Containment and Cross-Repository Authority Boundaries

Following the ecosystem engineering discipline of **single-repository self-containment and graceful offline degradation**, this repository defines the complete normative contract for `coFay` locally: the Ego-free three-layer role ontology, `RoleCharter` 1.0 schema, single-hop operational delegation rules, atomic dual-signed ownership transfer (`TransferEnvelope` 1.0), and `coFACTS` L1 verification criteria. Developers can issue, validate, transfer, and audit `RoleCharter` documents and representational action records in an air-gapped local environment without connecting to external blockchain nodes or remote directory servers.

At the same time, this specification enforces a strict **no dual source of truth** boundary, referencing sister repositories normatively wherever foundational primitives are already defined:

- **Canonical Identifier Encoding (`hid_` / `ifay_` / `cofay_` / `org_`), Holder-of-Key Cryptography, and Single-Parent Organization Trees**: Defined authoritatively in **FayID**.
- **Delegated Stewardship Handshakes Across Human Prime, `iFay` Manager, and `coFay` (`Faying 1.1` Delegated Stewardship Profile)**: Defined authoritatively in **Faying-Protocol**.
- **Skill Discovery, JWS Descriptor Signing, and Caller Authentication**: Defined authoritatively in **Skill-Sharing-Protocol (`SSP`)**.
- **Terminal Host Permissions and Controlled Resource Scopes (including `Official_Post` Seat Semantics)**: Defined authoritatively in **Control-Authority-Protocol (`CAP`)**.
- **On-Chain `MeritPocket` Ledger Recording, Non-Monetary `MeriToken` Decay Mathematics, and Weighted Governance Voting**: Defined authoritatively in **Global-Merit-Chain (`GMChain`)**.
- **Umbrella Four-Layer Architecture and Individual Avatar `iFACTS` Conformance**: Defined authoritatively in **ifay**.
