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

export const BUF_MAGIC: Buffer;
export const BUF_FORMAT_VERSION_V1: 1;
export const BUF_HEADER_SIZE: 40;
export const BUF_TRAILER_SIZE: 44;
export const SOUL_PACKAGE_SCHEMA_VERSION: "fayger-soul-package/1.0";
export const TASK_IR_SCHEMA_VERSION: "fayger-task-ir/0.2";

export function computeCrc32(bytes: Uint8Array): number;
export function encodeCanonicalCbor(value: unknown): Buffer;
export function decodeCanonicalCbor(buffer: Uint8Array): unknown;
export function buildEmbeddedFayManifest(
  charter: RoleCharter,
  requestedCapabilities?: string[]
): Record<string, unknown>;

export interface PackedCoFayBuf {
  bytes: Buffer;
  totalLength: number;
  manifestDigestHex: string;
  crc32: number;
  charterDigestHex: string;
  bufManifest: Record<string, unknown>;
  soulMetadata: Record<string, unknown>;
  fayManifest: Record<string, unknown>;
}

export function packCoFayBuf(
  charter: RoleCharter,
  options?: { verifySignature?: boolean; capabilities?: string[] }
): PackedCoFayBuf;

export function inspectCoFayBuf(
  inputBytes: Uint8Array,
  options?: { verifySignature?: boolean }
): {
  valid: boolean;
  header?: Record<string, unknown>;
  trailer?: Record<string, unknown>;
  manifest?: Record<string, unknown>;
  sections?: string[];
  soulMetadata?: Record<string, unknown> | null;
  fayManifest?: Record<string, unknown> | null;
  charter?: RoleCharter | null;
  cofactsReport?: CoFactsL1Report | null;
  errors: ValidationError[];
};

export function generateBase32Id(prefix: string, seedMaterial?: string): string;
export function generateEd25519SeedHex(): string;

export function createSeatCharter(options?: {
  roleArchetype?: RoleArchetype;
  displayName?: string;
  ownerType?: "human" | "organization";
  ownerId?: string;
  stewardHumanId?: string | null;
  managers?: string[];
  missionStatement?: string;
  privateKeySeedHex?: string;
  cofayId?: string;
  outDir?: string;
}): ValidationResult & {
  charter?: RoleCharter;
  cofactsReport?: CoFactsL1Report;
  signerId?: string;
  publicKeyHex?: string;
  privateKeySeedHex?: string;
};

export function createSeatBundle(options?: Record<string, unknown>): ValidationResult & {
  charter?: RoleCharter;
  cofactsReport?: CoFactsL1Report;
  fayManifest?: Record<string, unknown>;
  seatMetadata?: Record<string, unknown>;
  bufArtifact?: PackedCoFayBuf | null;
  files?: Record<string, string> | null;
};

export function rotateSteward(
  currentCharter: RoleCharter,
  options: {
    newStewardHumanId: string;
    signerId?: string;
    privateKeySeedHex: string;
    managers?: string[];
    issuedAt?: string;
    verifySignature?: boolean;
  }
): ValidationResult & {
  priorCharterDigestHex?: string;
  nextCharter?: RoleCharter;
  meritContinuity?: {
    cofay_id: string;
    gmc_merit_pocket_ref?: string;
    retention_ratio: "1.0";
    inheritance_haircut: "0%";
  };
};

export function executeDualSignedTransfer(
  currentCharter: RoleCharter,
  options: {
    toOwner: { type: "human" | "organization"; id: string };
    newStewardHumanId?: string;
    managerPolicy?: "CLEAR_ALL" | "RATIFY_NEW";
    ratifiedManagers?: string[];
    fromSignerId?: string;
    fromPrivateKeySeedHex: string;
    toSignerId?: string;
    toPrivateKeySeedHex: string;
    initiatedAt?: string;
    expiresAt?: string;
  }
): ValidationResult & {
  envelope?: TransferEnvelope;
  nextCharter?: RoleCharter;
  meritContinuity?: {
    cofay_id: string;
    gmc_merit_pocket_ref?: string;
    retention_ratio: "1.0";
    inheritance_haircut: "0%";
  };
};
