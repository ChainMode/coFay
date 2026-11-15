import type {
  RoleArchetype,
  LifecycleState,
  RoleCharter,
  TransferEnvelope,
  ManagerDelegationRequest,
  ActionAuditRecord,
} from "../schema/2025-10-25/schema.ts";

export {
  RoleArchetype,
  LifecycleState,
  RoleCharter,
  TransferEnvelope,
  ManagerDelegationRequest,
  ActionAuditRecord,
};

export const ROLE_CHARTER_SCHEMA_VERSION: "1.0";
export const TRANSFER_ENVELOPE_VERSION: "1.0";
export const ROLE_ARCHETYPES: readonly RoleArchetype[];
export const LIFECYCLE_STATES: readonly LifecycleState[];
export const ROLE_CHARTER_SIGNING_DOMAIN: "ifay.cofay.role-charter.v1";
export const OWNERSHIP_TRANSFER_SIGNING_DOMAIN: "ifay.cofay.ownership-transfer.v1";
export const COFACTS_L1_REPORT_VERSION: "cofacts-l1-report/1.0";

export interface ValidationError {
  code: string;
  field?: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface SignatureVerificationResult {
  valid: boolean;
  code?: string;
  message?: string;
}

export interface Ed25519DerivedKeyPair {
  privateKeySeedHex: string;
  publicKeyHex: string;
  privateKey: import("node:crypto").KeyObject;
  publicKey: import("node:crypto").KeyObject;
}

export interface OwnershipTransferResult extends ValidationResult {
  nextCharter?: RoleCharter | Omit<RoleCharter, "owner_signature">;
}

export interface CoFactsCheckEntry {
  id: string;
  name: string;
  passed: boolean;
}

export interface CoFactsL1Report {
  report_version: "cofacts-l1-report/1.0";
  suite: "coFACTS";
  level: "L1";
  target_id: string;
  conformance: "PASS" | "FAIL" | "REJECTED_BOUNDARY";
  checks: CoFactsCheckEntry[];
  errors: ValidationError[];
}

export function canonicalizeJcs(value: unknown): string;
export function deriveEd25519KeyPairFromSeedHex(seedHex: string): Ed25519DerivedKeyPair;
export function computeCharterDigestHex(charter: unknown): string;

export function signRoleCharter(
  unsignedCharter: Omit<RoleCharter, "owner_signature">,
  options: { signerId: string; privateKeySeedHex: string }
): RoleCharter;

export function verifyRoleCharterSignature(charter: unknown): SignatureVerificationResult;

export function validateRoleCharter(
  charter: unknown,
  options?: { verifySignature?: boolean }
): ValidationResult;

export function validateManagerDelegation(
  charter: RoleCharter,
  request: ManagerDelegationRequest | Record<string, unknown>
): ValidationResult;

export function validateActionAuditRecord(
  charter: RoleCharter,
  record: ActionAuditRecord | Record<string, unknown>
): ValidationResult;

export function signTransferEnvelope(
  unsignedEnvelope: Omit<TransferEnvelope, "from_signature" | "to_signature">,
  options: {
    fromSignerId: string;
    fromPrivateKeySeedHex: string;
    toSignerId: string;
    toPrivateKeySeedHex: string;
  }
): TransferEnvelope;

export function applyOwnershipTransfer(
  currentCharter: RoleCharter,
  envelope: TransferEnvelope | Record<string, unknown>,
  options?: {
    verifySignatures?: boolean;
    nextOwnerSignerId?: string;
    nextOwnerPrivateKeySeedHex?: string;
  }
): OwnershipTransferResult;

export function runCoFactsL1Check(
  subject: unknown,
  options?: { verifySignature?: boolean }
): CoFactsL1Report;
