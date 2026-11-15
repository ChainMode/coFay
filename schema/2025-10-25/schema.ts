/**
 * Normative TypeScript definitions for coFay RoleCharter 1.0 (2025-10-25 release baseline).
 * Mirrors https://ifay.ai/schemas/cofay-role-charter-1.0.json.
 */

export type RoleArchetype =
  | "org_service"
  | "functional_post"
  | "project_collaborator";

export type LifecycleState =
  | "ACTIVE"
  | "SUSPENDED_PENDING_SUCCESSION"
  | "REVOKED";

export type SspSkillVisibility = "public" | "restricted" | "private";

export type CapAutonomyTier = "assistive" | "delegated" | "official_post";

export type AuditLogMode = "hash_chain" | "append_only";

export type SigningDomain =
  | "ifay.cofay.role-charter.v1"
  | "ifay.cofay.ownership-transfer.v1";

/** Canonical identifier types referencing FayID 1.0 (see FayID). */
export type CharterIDString = `chr_${string}`;
export type HumanIDString = `hid_${string}`;
export type IFayIDString = `ifay_${string}`;
export type CoFayIDString = `cofay_${string}`;
export type OrganizationIDString = `org_${string}`;
export type MeritPocketRefString = `mpk_${string}`;

/** Single-layer owner reference. Strictly forbids ifay_ or cofay_ ownership nesting. */
export type SingleLayerOwnerRef =
  | { type: "human"; id: HumanIDString }
  | { type: "organization"; id: OrganizationIDString };

export interface SspSkillCapability {
  skill_ref: string;
  visibility: SspSkillVisibility;
  /** MUST be true whenever visibility is "restricted" or "private". */
  require_caller_auth: boolean;
}

export interface CapResourceBounds {
  allowed_scopes: string[];
  max_autonomy_tier: CapAutonomyTier;
  allow_irreversible_actions: boolean;
}

export interface AllowedCapabilities {
  ssp_skills: SspSkillCapability[];
  cap_bounds: CapResourceBounds;
}

export interface AuditPolicy {
  retention_days: number;
  log_mode: AuditLogMode;
  require_actor_trace: true;
  gmc_merit_pocket_ref?: MeritPocketRefString;
}

export interface Ed25519SignatureBlock {
  alg: "Ed25519";
  domain: SigningDomain;
  signer_id: HumanIDString | OrganizationIDString;
  public_key_hex: string;
  signature_hex: string;
}

/**
 * Normative RoleCharter 1.0 document defining a coFay public role incarnation.
 * Note: coFay possesses Social, Interaction, and Cognitive layers only;
 * attaching any personal Ego model or Human Prime replica package is strictly prohibited.
 */
export interface RoleCharter {
  schema_version: "1.0";
  charter_id: CharterIDString;
  charter_revision: number;
  cofay_id: CoFayIDString;
  display_name: string;
  role_archetype: RoleArchetype;
  owner: SingleLayerOwnerRef;
  /** REQUIRED when owner.type === "organization". Must be a natural-person HumanID. */
  steward_human_id?: HumanIDString;
  /** Orthogonal single-hop operational delegates (iFay instances only). */
  managers: IFayIDString[];
  mission_statement: string;
  allowed_capabilities: AllowedCapabilities;
  prohibited_actions: string[];
  audit_policy: AuditPolicy;
  lifecycle_state: LifecycleState;
  transfer_nonce: number;
  issued_at: string;
  expires_at?: string;
  owner_signature: Ed25519SignatureBlock;
}

export type ManagerTransferPolicy = "CLEAR_ALL" | "RATIFY_NEW";

export interface MeritContinuityPolicy {
  preserve_cofay_id: true;
  preserve_merit_pocket: true;
}

/**
 * Atomic Dual-Signed Ownership Transfer Envelope (TransferEnvelope 1.0).
 * Requires valid Ed25519 signatures from BOTH outgoing and incoming owners/stewards,
 * enforces monotonic transfer_nonce, and purges stale prior-owner managers.
 */
export interface TransferEnvelope {
  envelope_version: "1.0";
  cofay_id: CoFayIDString;
  prior_charter_digest_hex: string;
  transfer_nonce: number;
  from_owner: SingleLayerOwnerRef;
  to_owner: SingleLayerOwnerRef;
  /** REQUIRED when to_owner.type === "organization". */
  new_steward_human_id?: HumanIDString;
  manager_policy: ManagerTransferPolicy;
  ratified_managers: IFayIDString[];
  merit_continuity: MeritContinuityPolicy;
  initiated_at: string;
  expires_at: string;
  from_signature: Ed25519SignatureBlock;
  to_signature: Ed25519SignatureBlock;
}

export interface ManagerDelegationRequest {
  action: "GRANT" | "REVOKE";
  issuer_id: HumanIDString | OrganizationIDString;
  target_manager_id: IFayIDString;
}

export interface ActionAuditRecord {
  cofay_id: CoFayIDString;
  owner_id: HumanIDString | OrganizationIDString;
  actor_signer_id: CoFayIDString | IFayIDString | HumanIDString | OrganizationIDString;
  action_type: string;
  acting_as_natural_person?: false;
  timestamp: string;
}
