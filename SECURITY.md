# Security Policy

## Supported Versions

Security fixes and advisories apply to the normative **coFay `1.0`** specification, schemas, vectors, and reference validator on `main`:

| Component / Artifact | Version / Edition | Supported |
| --- | --- | --- |
| `@ifay/cofay` Validator & `coFACTS` L1 Checker (`src/`, `vectors/`) | `main` / `1.0.x` | Yes |
| `RoleCharter 1.0` & `TransferEnvelope 1.0` Schemas (`schemas/`, `schema/2025-10-25/`) | `1.0` (`2025-10-25`) | Yes |
| Pre-`1.0` drafts | `< 1.0.0` | No |

## Security Scope

`coFay` (**Common Fay**) governs public and organizational role avatars within the ecosystem (`Fay = iFay + coFay`). High-priority security invariants include:

1. **`RoleCharter` Three-Layer No-Ego Invariant (`COFAY_EGO_FORBIDDEN`)**:
   - Any schema or validator bypass allowing a `coFay` to attach a personal `Ego` model, impersonate a natural person, or evade cryptographic `RoleCharter 1.0` redlines.
2. **Single-Layer Ownership & Single-Hop Delegation**:
   - Bypass of single-layer ownership (`owner` restricted to `hid_` or `org_` — rejecting `ifay_` / `cofay_` nesting via `OWNER_TYPE_FORBIDDEN`), missing natural-person `steward_human_id` on organization-owned `coFay` instances, or unauthorized re-delegation by `iFay` operational managers (`MANAGER_REDELEGATION_FORBIDDEN`).
3. **Atomic Dual-Signature Ownership Transfer (`TransferEnvelope 1.0`)**:
   - Single-signature transfer acceptance (`TRANSFER_DUAL_SIGNATURE_REQUIRED` bypass), RFC 8785 JCS / `Ed25519` verification flaws, `prior_charter_digest_hex` binding mismatches, `transfer_nonce` replay attacks, or failure to clear/re-ratify stale operational `managers` upon ownership transfer.
4. **`coFACTS` vs. `iFACTS` Conformance Boundary**:
   - Bypass of `BOUNDARY_IFAY_USE_IFACTS` scope separation between `coFACTS` and `iFACTS`.

## Reporting a Vulnerability

**Please do NOT report undisclosed authorization, signature, or charter-validation vulnerabilities via public GitHub Issues or Pull Requests.**

- **Primary Channel (Recommended)**: Submit a report privately via **GitHub Private Vulnerability Reporting (Security Advisories)**:
  - https://github.com/ChainMode/coFay/security/advisories/new
- **Fallback Email Channel**: If GitHub Security Advisories is unavailable to you, email **[jah.g@ifay.ai](mailto:jah.g@ifay.ai)** with `[SECURITY][coFay]` in the subject line.

Please include minimal `RoleCharter` or `TransferEnvelope` JSON inputs, expected vs. actual validator error codes, and impact details.

## Coordinated Disclosure Policy

- **Acknowledgment**: Within **72 hours** of receiving your report.
- **Triage & Assessment**: Initial validation and severity classification within **7 calendar days**.
- **Coordinated Disclosure Window**: **90 days** from report submission to coordinated fix, conformance-vector update, and advisory publication.
- **Credit**: Researchers are credited in published advisories unless anonymity is requested.
