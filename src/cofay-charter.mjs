import crypto from "node:crypto";

export const ROLE_CHARTER_SCHEMA_VERSION = "1.0";
export const TRANSFER_ENVELOPE_VERSION = "1.0";
export const ROLE_ARCHETYPES = Object.freeze([
  "org_service",
  "functional_post",
  "project_collaborator",
]);
export const LIFECYCLE_STATES = Object.freeze([
  "ACTIVE",
  "SUSPENDED_PENDING_SUCCESSION",
  "REVOKED",
]);
export const ROLE_CHARTER_SIGNING_DOMAIN = "ifay.cofay.role-charter.v1";
export const OWNERSHIP_TRANSFER_SIGNING_DOMAIN = "ifay.cofay.ownership-transfer.v1";
export const COFACTS_L1_REPORT_VERSION = "cofacts-l1-report/1.0";

const ED25519_PKCS8_PREFIX_HEX = "302e020100300506032b657004220420";
const ED25519_SPKI_PREFIX_HEX = "302a300506032b6570032100";

const CHARTER_ID_RE = /^chr_[a-z2-7]{16,64}$/;
const COFAY_ID_RE = /^cofay_[a-z2-7]+$/;
const IFAY_ID_RE = /^ifay_[a-z2-7]+$/;
const HUMAN_ID_RE = /^hid_[a-z2-7]+$/;
const ORG_ID_RE = /^org_[a-z0-9-]+$/;
const MERIT_POCKET_REF_RE = /^mpk_[a-z2-7]+$/;
const HEX32_RE = /^[0-9a-f]{64}$/;
const HEX64_RE = /^[0-9a-f]{128}$/;

const FORBIDDEN_EGO_KEYS = new Set([
  "ego_package",
  "ego_model",
  "ego_profile",
  "human_prime_id",
  "personal_persona",
]);

const ALLOWED_CHARTER_KEYS = new Set([
  "schema_version",
  "charter_id",
  "charter_revision",
  "cofay_id",
  "display_name",
  "role_archetype",
  "owner",
  "steward_human_id",
  "managers",
  "mission_statement",
  "allowed_capabilities",
  "prohibited_actions",
  "audit_policy",
  "lifecycle_state",
  "transfer_nonce",
  "issued_at",
  "expires_at",
  "owner_signature",
]);

function isPlainObject(val) {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

function isRfc3339Timestamp(val) {
  if (typeof val !== "string" || val.length < 10) return false;
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(val)) {
    return false;
  }
  return !Number.isNaN(Date.parse(val));
}

/**
 * Deterministic RFC 8785 JSON Canonicalization Scheme (JCS) serializer.
 */
export function canonicalizeJcs(value) {
  if (value === null || typeof value === "boolean" || typeof value === "string") {
    return JSON.stringify(value);
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new TypeError("Non-finite number is not permitted in RFC 8785 JCS.");
    }
    return Object.is(value, -0) ? "0" : JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    const items = value.map((item) => canonicalizeJcs(item === undefined ? null : item));
    return `[${items.join(",")}]`;
  }
  if (isPlainObject(value)) {
    const keys = Object.keys(value)
      .filter((k) => value[k] !== undefined)
      .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    const props = keys.map((k) => `${JSON.stringify(k)}:${canonicalizeJcs(value[k])}`);
    return `{${props.join(",")}}`;
  }
  throw new TypeError(`Unsupported type in JCS canonicalization: ${typeof value}`);
}

/**
 * Derives an Ed25519 KeyObject pair and raw hex public key from a 32-byte hex seed.
 */
export function deriveEd25519KeyPairFromSeedHex(seedHex) {
  if (typeof seedHex !== "string" || !HEX32_RE.test(seedHex)) {
    throw new TypeError("Ed25519 seed must be a 64-character lowercase hex string (32 bytes).");
  }
  const pkcs8Der = Buffer.from(ED25519_PKCS8_PREFIX_HEX + seedHex, "hex");
  const privateKey = crypto.createPrivateKey({
    key: pkcs8Der,
    format: "der",
    type: "pkcs8",
  });
  const publicKey = crypto.createPublicKey(privateKey);
  const spkiDer = publicKey.export({ format: "der", type: "spki" });
  const publicKeyHex = spkiDer.subarray(12).toString("hex");
  return {
    privateKeySeedHex: seedHex,
    publicKeyHex,
    privateKey,
    publicKey,
  };
}

function createEd25519PublicKeyFromHex(publicKeyHex) {
  const spkiDer = Buffer.from(ED25519_SPKI_PREFIX_HEX + publicKeyHex, "hex");
  return crypto.createPublicKey({
    key: spkiDer,
    format: "der",
    type: "spki",
  });
}

function buildDomainSigningBytes(domain, payloadWithoutSig) {
  const canonicalJson = canonicalizeJcs(payloadWithoutSig);
  return Buffer.from(`${domain}\0${canonicalJson}`, "utf8");
}

/**
 * Computes SHA-256 lowercase hex digest over the JCS-canonicalized RoleCharter.
 */
export function computeCharterDigestHex(charter) {
  const canonical = canonicalizeJcs(charter);
  return crypto.createHash("sha256").update(canonical, "utf8").digest("hex");
}

function stripOwnerSignature(charter) {
  const copy = { ...charter };
  delete copy.owner_signature;
  return copy;
}

function stripTransferSignatures(envelope) {
  const copy = { ...envelope };
  delete copy.from_signature;
  delete copy.to_signature;
  return copy;
}

/**
 * Signs an unsigned RoleCharter 1.0 object with Ed25519 over RFC 8785 JCS.
 */
export function signRoleCharter(unsignedCharter, { signerId, privateKeySeedHex }) {
  const { publicKeyHex, privateKey } = deriveEd25519KeyPairFromSeedHex(privateKeySeedHex);
  const payload = stripOwnerSignature(unsignedCharter);
  const signingBytes = buildDomainSigningBytes(ROLE_CHARTER_SIGNING_DOMAIN, payload);
  const sigHex = crypto.sign(null, signingBytes, privateKey).toString("hex");

  return {
    ...payload,
    owner_signature: {
      alg: "Ed25519",
      domain: ROLE_CHARTER_SIGNING_DOMAIN,
      signer_id: signerId,
      public_key_hex: publicKeyHex,
      signature_hex: sigHex,
    },
  };
}

/**
 * Verifies the Ed25519 signature block on a RoleCharter 1.0 document.
 */
export function verifyRoleCharterSignature(charter) {
  if (!isPlainObject(charter) || !isPlainObject(charter.owner_signature)) {
    return {
      valid: false,
      code: "CHARTER_SIGNATURE_MISSING",
      message: "RoleCharter is missing owner_signature object.",
    };
  }
  const sig = charter.owner_signature;
  if (sig.alg !== "Ed25519" || sig.domain !== ROLE_CHARTER_SIGNING_DOMAIN) {
    return {
      valid: false,
      code: "CHARTER_SIGNATURE_DOMAIN_INVALID",
      message: "owner_signature must declare alg='Ed25519' and domain='ifay.cofay.role-charter.v1'.",
    };
  }
  if (!HEX32_RE.test(sig.public_key_hex || "") || !HEX64_RE.test(sig.signature_hex || "")) {
    return {
      valid: false,
      code: "CHARTER_SIGNATURE_FORMAT_INVALID",
      message: "owner_signature public_key_hex or signature_hex has invalid hex length.",
    };
  }

  const allowedSigners = new Set();
  if (isPlainObject(charter.owner) && typeof charter.owner.id === "string") {
    allowedSigners.add(charter.owner.id);
  }
  if (typeof charter.steward_human_id === "string") {
    allowedSigners.add(charter.steward_human_id);
  }
  if (!allowedSigners.has(sig.signer_id)) {
    return {
      valid: false,
      code: "CHARTER_SIGNER_UNAUTHORIZED",
      message: "owner_signature.signer_id must match owner.id or steward_human_id.",
    };
  }

  try {
    const pubKey = createEd25519PublicKeyFromHex(sig.public_key_hex);
    const signingBytes = buildDomainSigningBytes(
      ROLE_CHARTER_SIGNING_DOMAIN,
      stripOwnerSignature(charter)
    );
    const verified = crypto.verify(
      null,
      signingBytes,
      pubKey,
      Buffer.from(sig.signature_hex, "hex")
    );
    if (!verified) {
      return {
        valid: false,
        code: "CHARTER_SIGNATURE_INVALID",
        message: "Ed25519 signature verification failed over JCS RoleCharter payload.",
      };
    }
    return { valid: true };
  } catch (err) {
    return {
      valid: false,
      code: "CHARTER_SIGNATURE_INVALID",
      message: err instanceof Error ? err.message : String(err),
    };
  }
}

function validateOwnerRef(ownerRef, fieldPrefix, errors) {
  if (!isPlainObject(ownerRef)) {
    errors.push({
      code: "OWNER_INVALID",
      field: fieldPrefix,
      message: `${fieldPrefix} must be an object with { type, id }.`,
    });
    return false;
  }
  const { type, id } = ownerRef;
  if (typeof id === "string" && (id.startsWith("ifay_") || id.startsWith("cofay_"))) {
    errors.push({
      code: "OWNER_TYPE_FORBIDDEN",
      field: `${fieldPrefix}.id`,
      message: "Single-layer ownership strictly forbids ifay_ or cofay_ as an owner.",
    });
    return false;
  }
  if (type === "human") {
    if (typeof id !== "string" || !HUMAN_ID_RE.test(id)) {
      errors.push({
        code: "OWNER_TYPE_FORBIDDEN",
        field: `${fieldPrefix}.id`,
        message: "Human owner id must match canonical hid_<base32>.",
      });
      return false;
    }
    return true;
  }
  if (type === "organization") {
    if (typeof id !== "string" || !ORG_ID_RE.test(id)) {
      errors.push({
        code: "OWNER_TYPE_FORBIDDEN",
        field: `${fieldPrefix}.id`,
        message: "Organization owner id must match canonical org_<slug|base32>.",
      });
      return false;
    }
    return true;
  }
  errors.push({
    code: "OWNER_TYPE_FORBIDDEN",
    field: `${fieldPrefix}.type`,
    message: "Owner type must be 'human' or 'organization' (never 'ifay' or 'cofay').",
  });
  return false;
}

/**
 * Validates a RoleCharter 1.0 document against all structural, semantic, and cryptographic rules.
 */
export function validateRoleCharter(charter, options = {}) {
  const { verifySignature = true } = options;
  const errors = [];

  if (!isPlainObject(charter)) {
    return {
      valid: false,
      errors: [{ code: "CHARTER_NOT_OBJECT", message: "RoleCharter must be a JSON object." }],
    };
  }

  for (const key of Object.keys(charter)) {
    if (FORBIDDEN_EGO_KEYS.has(key)) {
      errors.push({
        code: "COFAY_EGO_FORBIDDEN",
        field: key,
        message: `coFay possesses no Ego layer; personal replica field '${key}' is strictly forbidden.`,
      });
    } else if (!ALLOWED_CHARTER_KEYS.has(key)) {
      errors.push({
        code: "CHARTER_UNKNOWN_PROPERTY",
        field: key,
        message: `Unknown property '${key}' is not permitted in RoleCharter 1.0.`,
      });
    }
  }

  if (charter.schema_version !== ROLE_CHARTER_SCHEMA_VERSION) {
    errors.push({
      code: "SCHEMA_VERSION_INVALID",
      field: "schema_version",
      message: "schema_version must be '1.0'.",
    });
  }

  if (typeof charter.charter_id !== "string" || !CHARTER_ID_RE.test(charter.charter_id)) {
    errors.push({
      code: "CHARTER_ID_INVALID",
      field: "charter_id",
      message: "charter_id must match ^chr_[a-z2-7]{16,64}$.",
    });
  }

  if (!Number.isInteger(charter.charter_revision) || charter.charter_revision < 1) {
    errors.push({
      code: "CHARTER_REVISION_INVALID",
      field: "charter_revision",
      message: "charter_revision must be an integer >= 1.",
    });
  }

  if (typeof charter.cofay_id !== "string" || !COFAY_ID_RE.test(charter.cofay_id)) {
    errors.push({
      code: charter.cofay_id?.startsWith("ifay_")
        ? "BOUNDARY_IFAY_USE_IFACTS"
        : "COFAY_ID_INVALID",
      field: "cofay_id",
      message: "cofay_id must match canonical ^cofay_[a-z2-7]+$.",
    });
  }

  if (
    typeof charter.display_name !== "string" ||
    charter.display_name.trim().length < 2 ||
    charter.display_name.length > 160
  ) {
    errors.push({
      code: "DISPLAY_NAME_INVALID",
      field: "display_name",
      message: "display_name must be between 2 and 160 characters.",
    });
  }

  if (!ROLE_ARCHETYPES.includes(charter.role_archetype)) {
    errors.push({
      code: "ROLE_ARCHETYPE_INVALID",
      field: "role_archetype",
      message: `role_archetype must be one of ${ROLE_ARCHETYPES.join(", ")}.`,
    });
  }

  const ownerValid = validateOwnerRef(charter.owner, "owner", errors);
  if (ownerValid) {
    if (charter.owner.type === "organization") {
      if (charter.steward_human_id === undefined || charter.steward_human_id === null) {
        errors.push({
          code: "ORG_STEWARD_REQUIRED",
          field: "steward_human_id",
          message: "Organization-owned coFay MUST declare a natural-person steward_human_id.",
        });
      } else if (
        typeof charter.steward_human_id !== "string" ||
        !HUMAN_ID_RE.test(charter.steward_human_id)
      ) {
        errors.push({
          code: "STEWARD_MUST_BE_HUMAN",
          field: "steward_human_id",
          message: "steward_human_id must be a natural-person HumanID (hid_<base32>), never ifay_ or cofay_.",
        });
      }
    } else if (charter.owner.type === "human" && charter.steward_human_id !== undefined) {
      if (charter.steward_human_id !== charter.owner.id) {
        errors.push({
          code: "HUMAN_STEWARD_MISMATCH",
          field: "steward_human_id",
          message: "When owner.type is 'human', steward_human_id if present must equal owner.id.",
        });
      }
    }
  }

  if (!Array.isArray(charter.managers)) {
    errors.push({
      code: "MANAGERS_INVALID",
      field: "managers",
      message: "managers must be an array of canonical ifay_<base32> identifiers.",
    });
  } else {
    const seenManagers = new Set();
    for (const mgr of charter.managers) {
      if (typeof mgr !== "string" || !IFAY_ID_RE.test(mgr)) {
        errors.push({
          code: "MANAGER_ID_INVALID",
          field: "managers",
          message: `Manager '${String(mgr)}' must be an iFay identifier (^ifay_[a-z2-7]+$).`,
        });
      } else if (seenManagers.has(mgr)) {
        errors.push({
          code: "MANAGER_DUPLICATE",
          field: "managers",
          message: `Duplicate manager '${mgr}' is not allowed.`,
        });
      } else {
        seenManagers.add(mgr);
      }
    }
  }

  if (
    typeof charter.mission_statement !== "string" ||
    charter.mission_statement.trim().length < 10 ||
    charter.mission_statement.length > 2000
  ) {
    errors.push({
      code: "MISSION_STATEMENT_INVALID",
      field: "mission_statement",
      message: "mission_statement must be between 10 and 2000 characters.",
    });
  }

  if (!isPlainObject(charter.allowed_capabilities)) {
    errors.push({
      code: "CAPABILITIES_INVALID",
      field: "allowed_capabilities",
      message: "allowed_capabilities must declare ssp_skills and cap_bounds.",
    });
  } else {
    const { ssp_skills: sspSkills, cap_bounds: capBounds } = charter.allowed_capabilities;
    if (!Array.isArray(sspSkills)) {
      errors.push({
        code: "SSP_SKILLS_INVALID",
        field: "allowed_capabilities.ssp_skills",
        message: "ssp_skills must be an array.",
      });
    } else {
      for (const skill of sspSkills) {
        if (
          !isPlainObject(skill) ||
          typeof skill.skill_ref !== "string" ||
          skill.skill_ref.length < 6 ||
          !["public", "restricted", "private"].includes(skill.visibility) ||
          typeof skill.require_caller_auth !== "boolean"
        ) {
          errors.push({
            code: "SSP_SKILL_ENTRY_INVALID",
            field: "allowed_capabilities.ssp_skills",
            message: "Each SSP skill entry must specify skill_ref, visibility, and require_caller_auth.",
          });
        } else if (
          (skill.visibility === "restricted" || skill.visibility === "private") &&
          skill.require_caller_auth !== true
        ) {
          errors.push({
            code: "SSP_AUTH_REQUIRED_FOR_NON_PUBLIC",
            field: "allowed_capabilities.ssp_skills",
            message: "Restricted and private SSP skills MUST enforce require_caller_auth: true.",
          });
        }
      }
    }

    if (
      !isPlainObject(capBounds) ||
      !Array.isArray(capBounds.allowed_scopes) ||
      !["assistive", "delegated", "official_post"].includes(capBounds.max_autonomy_tier) ||
      typeof capBounds.allow_irreversible_actions !== "boolean"
    ) {
      errors.push({
        code: "CAP_BOUNDS_INVALID",
        field: "allowed_capabilities.cap_bounds",
        message: "cap_bounds must declare allowed_scopes, max_autonomy_tier, and allow_irreversible_actions.",
      });
    }
  }

  if (
    !Array.isArray(charter.prohibited_actions) ||
    charter.prohibited_actions.length < 1 ||
    charter.prohibited_actions.some((item) => typeof item !== "string" || item.trim().length < 5)
  ) {
    errors.push({
      code: "PROHIBITED_ACTIONS_INVALID",
      field: "prohibited_actions",
      message: "prohibited_actions must be a non-empty array of red-line strings.",
    });
  }

  if (!isPlainObject(charter.audit_policy)) {
    errors.push({
      code: "AUDIT_POLICY_INVALID",
      field: "audit_policy",
      message: "audit_policy must be an object.",
    });
  } else {
    const ap = charter.audit_policy;
    if (!Number.isInteger(ap.retention_days) || ap.retention_days < 1) {
      errors.push({
        code: "AUDIT_RETENTION_INVALID",
        field: "audit_policy.retention_days",
        message: "audit_policy.retention_days must be an integer >= 1.",
      });
    }
    if (!["hash_chain", "append_only"].includes(ap.log_mode)) {
      errors.push({
        code: "AUDIT_LOG_MODE_INVALID",
        field: "audit_policy.log_mode",
        message: "audit_policy.log_mode must be 'hash_chain' or 'append_only'.",
      });
    }
    if (ap.require_actor_trace !== true) {
      errors.push({
        code: "AUDIT_ACTOR_TRACE_REQUIRED",
        field: "audit_policy.require_actor_trace",
        message: "audit_policy.require_actor_trace MUST be true.",
      });
    }
    if (
      ap.gmc_merit_pocket_ref !== undefined &&
      (typeof ap.gmc_merit_pocket_ref !== "string" || !MERIT_POCKET_REF_RE.test(ap.gmc_merit_pocket_ref))
    ) {
      errors.push({
        code: "MERIT_POCKET_REF_INVALID",
        field: "audit_policy.gmc_merit_pocket_ref",
        message: "gmc_merit_pocket_ref must match ^mpk_[a-z2-7]+$.",
      });
    }
  }

  if (!LIFECYCLE_STATES.includes(charter.lifecycle_state)) {
    errors.push({
      code: "LIFECYCLE_STATE_INVALID",
      field: "lifecycle_state",
      message: `lifecycle_state must be one of ${LIFECYCLE_STATES.join(", ")}.`,
    });
  }

  if (!Number.isInteger(charter.transfer_nonce) || charter.transfer_nonce < 0) {
    errors.push({
      code: "TRANSFER_NONCE_INVALID",
      field: "transfer_nonce",
      message: "transfer_nonce must be an integer >= 0.",
    });
  }

  if (!isRfc3339Timestamp(charter.issued_at)) {
    errors.push({
      code: "ISSUED_AT_INVALID",
      field: "issued_at",
      message: "issued_at must be a valid RFC 3339 timestamp.",
    });
  }

  if (charter.expires_at !== undefined && !isRfc3339Timestamp(charter.expires_at)) {
    errors.push({
      code: "EXPIRES_AT_INVALID",
      field: "expires_at",
      message: "expires_at must be a valid RFC 3339 timestamp when present.",
    });
  }

  if (verifySignature) {
    const sigRes = verifyRoleCharterSignature(charter);
    if (!sigRes.valid) {
      errors.push({
        code: sigRes.code,
        field: "owner_signature",
        message: sigRes.message,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates single-hop orthogonal manager delegation requests.
 * Managers (iFayID[]) can only be granted or revoked by owner.id or steward_human_id;
 * active managers are strictly prohibited from re-delegating management authority.
 */
export function validateManagerDelegation(charter, request) {
  const errors = [];
  const charterRes = validateRoleCharter(charter, { verifySignature: false });
  if (!charterRes.valid) {
    return charterRes;
  }

  if (charter.lifecycle_state !== "ACTIVE") {
    errors.push({
      code: "CHARTER_NOT_ACTIVE",
      field: "lifecycle_state",
      message: "Cannot modify manager delegations when RoleCharter is not ACTIVE.",
    });
  }

  if (!isPlainObject(request)) {
    return {
      valid: false,
      errors: [{ code: "DELEGATION_INVALID", message: "Delegation request must be an object." }],
    };
  }

  if (!["GRANT", "REVOKE"].includes(request.action)) {
    errors.push({
      code: "DELEGATION_ACTION_INVALID",
      field: "action",
      message: "action must be 'GRANT' or 'REVOKE'.",
    });
  }

  if (typeof request.target_manager_id !== "string" || !IFAY_ID_RE.test(request.target_manager_id)) {
    errors.push({
      code: "MANAGER_TARGET_INVALID",
      field: "target_manager_id",
      message: "target_manager_id must be a canonical ifay_<base32> identifier.",
    });
  }

  if (typeof request.issuer_id === "string" && request.issuer_id.startsWith("ifay_")) {
    errors.push({
      code: "MANAGER_REDELEGATION_FORBIDDEN",
      field: "issuer_id",
      message: "Single-hop delegation rule: an iFay manager MUST NOT re-delegate management authority.",
    });
  } else {
    const authorizedIssuers = new Set([charter.owner.id]);
    if (charter.steward_human_id) {
      authorizedIssuers.add(charter.steward_human_id);
    }
    if (!authorizedIssuers.has(request.issuer_id)) {
      errors.push({
        code: "DELEGATION_ISSUER_UNAUTHORIZED",
        field: "issuer_id",
        message: "Only owner.id or steward_human_id may grant or revoke coFay managers.",
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates that an outbound representational action record satisfies traceability invariants
 * without requiring GMChain online availability.
 */
export function validateActionAuditRecord(charter, record) {
  const errors = [];
  if (!isPlainObject(record)) {
    return {
      valid: false,
      errors: [{ code: "AUDIT_RECORD_INVALID", message: "Audit record must be an object." }],
    };
  }

  if (record.acting_as_natural_person === true) {
    errors.push({
      code: "NATURAL_PERSON_IMPERSONATION_FORBIDDEN",
      field: "acting_as_natural_person",
      message: "coFay acts in the name of its accountable owner role, never impersonating a natural person.",
    });
  }

  if (record.cofay_id !== charter.cofay_id) {
    errors.push({
      code: "AUDIT_COFAY_MISMATCH",
      field: "cofay_id",
      message: "Audit record cofay_id must match charter.cofay_id.",
    });
  }

  if (record.owner_id !== charter.owner?.id) {
    errors.push({
      code: "AUDIT_OWNER_MISMATCH",
      field: "owner_id",
      message: "Audit record owner_id must match current charter.owner.id.",
    });
  }

  const authorizedSigners = new Set([
    charter.cofay_id,
    charter.owner?.id,
    ...(charter.steward_human_id ? [charter.steward_human_id] : []),
    ...(Array.isArray(charter.managers) ? charter.managers : []),
  ]);
  if (!authorizedSigners.has(record.actor_signer_id)) {
    errors.push({
      code: "AUDIT_ACTOR_UNAUTHORIZED",
      field: "actor_signer_id",
      message: "actor_signer_id is not an authorized holder, steward, or active iFay manager of this coFay.",
    });
  }

  if (typeof record.action_type !== "string" || record.action_type.trim().length < 3) {
    errors.push({
      code: "AUDIT_ACTION_TYPE_INVALID",
      field: "action_type",
      message: "action_type must be a non-empty string.",
    });
  }

  if (!isRfc3339Timestamp(record.timestamp)) {
    errors.push({
      code: "AUDIT_TIMESTAMP_INVALID",
      field: "timestamp",
      message: "timestamp must be a valid RFC 3339 timestamp.",
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Dual-signs an ownership TransferEnvelope 1.0 with outgoing and incoming owner/steward keys.
 */
export function signTransferEnvelope(
  unsignedEnvelope,
  { fromSignerId, fromPrivateKeySeedHex, toSignerId, toPrivateKeySeedHex }
) {
  const payload = stripTransferSignatures(unsignedEnvelope);
  const signingBytes = buildDomainSigningBytes(OWNERSHIP_TRANSFER_SIGNING_DOMAIN, payload);

  const fromPair = deriveEd25519KeyPairFromSeedHex(fromPrivateKeySeedHex);
  const toPair = deriveEd25519KeyPairFromSeedHex(toPrivateKeySeedHex);

  const fromSigHex = crypto.sign(null, signingBytes, fromPair.privateKey).toString("hex");
  const toSigHex = crypto.sign(null, signingBytes, toPair.privateKey).toString("hex");

  return {
    ...payload,
    from_signature: {
      alg: "Ed25519",
      domain: OWNERSHIP_TRANSFER_SIGNING_DOMAIN,
      signer_id: fromSignerId,
      public_key_hex: fromPair.publicKeyHex,
      signature_hex: fromSigHex,
    },
    to_signature: {
      alg: "Ed25519",
      domain: OWNERSHIP_TRANSFER_SIGNING_DOMAIN,
      signer_id: toSignerId,
      public_key_hex: toPair.publicKeyHex,
      signature_hex: toSigHex,
    },
  };
}

function verifyTransferSideSignature(sig, expectedSigners, signingBytes, sideLabel, errors) {
  if (!isPlainObject(sig)) {
    errors.push({
      code: "TRANSFER_DUAL_SIGNATURE_REQUIRED",
      field: sideLabel,
      message: `Atomic ownership transfer requires both from_signature and to_signature (missing ${sideLabel}).`,
    });
    return;
  }
  if (sig.alg !== "Ed25519" || sig.domain !== OWNERSHIP_TRANSFER_SIGNING_DOMAIN) {
    errors.push({
      code: "TRANSFER_SIGNATURE_DOMAIN_INVALID",
      field: sideLabel,
      message: `${sideLabel} must declare alg='Ed25519' and domain='${OWNERSHIP_TRANSFER_SIGNING_DOMAIN}'.`,
    });
    return;
  }
  if (!expectedSigners.has(sig.signer_id)) {
    errors.push({
      code: "TRANSFER_SIGNER_UNAUTHORIZED",
      field: `${sideLabel}.signer_id`,
      message: `${sideLabel}.signer_id '${String(sig.signer_id)}' is not authorized for this transfer side.`,
    });
    return;
  }
  if (!HEX32_RE.test(sig.public_key_hex || "") || !HEX64_RE.test(sig.signature_hex || "")) {
    errors.push({
      code: "TRANSFER_SIGNATURE_INVALID",
      field: sideLabel,
      message: `${sideLabel} has malformed public_key_hex or signature_hex.`,
    });
    return;
  }
  try {
    const pubKey = createEd25519PublicKeyFromHex(sig.public_key_hex);
    const ok = crypto.verify(
      null,
      signingBytes,
      pubKey,
      Buffer.from(sig.signature_hex, "hex")
    );
    if (!ok) {
      errors.push({
        code: "TRANSFER_SIGNATURE_INVALID",
        field: sideLabel,
        message: `${sideLabel} Ed25519 signature verification failed.`,
      });
    }
  } catch (err) {
    errors.push({
      code: "TRANSFER_SIGNATURE_INVALID",
      field: sideLabel,
      message: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * Validates and applies an Atomic Dual-Signed Ownership Transfer (TransferEnvelope 1.0),
 * clearing or explicitly re-ratifying managers while preserving cofay_id and MeritPocket continuity.
 */
export function applyOwnershipTransfer(currentCharter, envelope, options = {}) {
  const {
    verifySignatures = true,
    nextOwnerSignerId,
    nextOwnerPrivateKeySeedHex,
  } = options;
  const errors = [];

  const currentRes = validateRoleCharter(currentCharter, { verifySignature: verifySignatures });
  if (!currentRes.valid) {
    return { valid: false, errors: currentRes.errors };
  }

  if (currentCharter.lifecycle_state === "REVOKED") {
    return {
      valid: false,
      errors: [
        {
          code: "CHARTER_REVOKED_NOT_TRANSFERABLE",
          field: "lifecycle_state",
          message: "A REVOKED coFay RoleCharter cannot be transferred.",
        },
      ],
    };
  }

  if (!isPlainObject(envelope)) {
    return {
      valid: false,
      errors: [{ code: "TRANSFER_ENVELOPE_INVALID", message: "TransferEnvelope must be an object." }],
    };
  }

  if (envelope.envelope_version !== TRANSFER_ENVELOPE_VERSION) {
    errors.push({
      code: "TRANSFER_VERSION_INVALID",
      field: "envelope_version",
      message: "envelope_version must be '1.0'.",
    });
  }

  if (envelope.cofay_id !== currentCharter.cofay_id) {
    errors.push({
      code: "TRANSFER_COFAY_MISMATCH",
      field: "cofay_id",
      message: "TransferEnvelope.cofay_id must match currentCharter.cofay_id.",
    });
  }

  const expectedDigest = computeCharterDigestHex(currentCharter);
  if (envelope.prior_charter_digest_hex !== expectedDigest) {
    errors.push({
      code: "PRIOR_CHARTER_DIGEST_MISMATCH",
      field: "prior_charter_digest_hex",
      message: "prior_charter_digest_hex does not match JCS SHA-256 digest of currentCharter.",
    });
  }

  if (envelope.transfer_nonce !== currentCharter.transfer_nonce + 1) {
    errors.push({
      code: "TRANSFER_NONCE_MISMATCH",
      field: "transfer_nonce",
      message: `Expected monotonic transfer_nonce=${currentCharter.transfer_nonce + 1}, got ${String(envelope.transfer_nonce)}.`,
    });
  }

  const fromValid = validateOwnerRef(envelope.from_owner, "from_owner", errors);
  const toValid = validateOwnerRef(envelope.to_owner, "to_owner", errors);

  if (
    fromValid &&
    (envelope.from_owner.type !== currentCharter.owner.type ||
      envelope.from_owner.id !== currentCharter.owner.id)
  ) {
    errors.push({
      code: "TRANSFER_FROM_OWNER_MISMATCH",
      field: "from_owner",
      message: "from_owner must match currentCharter.owner.",
    });
  }

  if (
    fromValid &&
    toValid &&
    envelope.from_owner.type === envelope.to_owner.type &&
    envelope.from_owner.id === envelope.to_owner.id
  ) {
    errors.push({
      code: "SELF_TRANSFER_REDUNDANT",
      field: "to_owner",
      message: "to_owner must differ from from_owner.",
    });
  }

  if (toValid) {
    if (envelope.to_owner.type === "organization") {
      if (envelope.new_steward_human_id === undefined || envelope.new_steward_human_id === null) {
        errors.push({
          code: "ORG_STEWARD_REQUIRED",
          field: "new_steward_human_id",
          message: "Incoming organization owner MUST specify a natural-person new_steward_human_id.",
        });
      } else if (
        typeof envelope.new_steward_human_id !== "string" ||
        !HUMAN_ID_RE.test(envelope.new_steward_human_id)
      ) {
        errors.push({
          code: "STEWARD_MUST_BE_HUMAN",
          field: "new_steward_human_id",
          message: "new_steward_human_id must match ^hid_[a-z2-7]+$.",
        });
      }
    } else if (
      envelope.to_owner.type === "human" &&
      envelope.new_steward_human_id !== undefined &&
      envelope.new_steward_human_id !== envelope.to_owner.id
    ) {
      errors.push({
        code: "HUMAN_STEWARD_MISMATCH",
        field: "new_steward_human_id",
        message: "When to_owner is 'human', new_steward_human_id if present must equal to_owner.id.",
      });
    }
  }

  if (!["CLEAR_ALL", "RATIFY_NEW"].includes(envelope.manager_policy)) {
    errors.push({
      code: "MANAGER_POLICY_INVALID",
      field: "manager_policy",
      message: "manager_policy must be 'CLEAR_ALL' or 'RATIFY_NEW'.",
    });
  }

  if (!Array.isArray(envelope.ratified_managers)) {
    errors.push({
      code: "RATIFIED_MANAGERS_INVALID",
      field: "ratified_managers",
      message: "ratified_managers must be an array.",
    });
  } else {
    if (envelope.manager_policy === "CLEAR_ALL" && envelope.ratified_managers.length > 0) {
      errors.push({
        code: "CLEAR_ALL_NON_EMPTY_MANAGERS",
        field: "ratified_managers",
        message: "ratified_managers MUST be empty when manager_policy is 'CLEAR_ALL'.",
      });
    }
    const seen = new Set();
    for (const mgr of envelope.ratified_managers) {
      if (typeof mgr !== "string" || !IFAY_ID_RE.test(mgr) || seen.has(mgr)) {
        errors.push({
          code: "RATIFIED_MANAGERS_INVALID",
          field: "ratified_managers",
          message: "ratified_managers must contain unique canonical ifay_<base32> identifiers.",
        });
      }
      seen.add(mgr);
    }
  }

  if (
    !isPlainObject(envelope.merit_continuity) ||
    envelope.merit_continuity.preserve_cofay_id !== true ||
    envelope.merit_continuity.preserve_merit_pocket !== true
  ) {
    errors.push({
      code: "MERIT_CONTINUITY_VIOLATION",
      field: "merit_continuity",
      message: "Ownership transfer MUST preserve both cofay_id and its continuous MeritPocket.",
    });
  }

  if (!isRfc3339Timestamp(envelope.initiated_at) || !isRfc3339Timestamp(envelope.expires_at)) {
    errors.push({
      code: "TRANSFER_TIMESTAMP_INVALID",
      field: "initiated_at",
      message: "initiated_at and expires_at must be valid RFC 3339 timestamps.",
    });
  } else if (Date.parse(envelope.expires_at) <= Date.parse(envelope.initiated_at)) {
    errors.push({
      code: "TRANSFER_WINDOW_INVALID",
      field: "expires_at",
      message: "expires_at must be strictly after initiated_at.",
    });
  }

  if (verifySignatures) {
    if (!isPlainObject(envelope.from_signature) || !isPlainObject(envelope.to_signature)) {
      errors.push({
        code: "TRANSFER_DUAL_SIGNATURE_REQUIRED",
        field: !isPlainObject(envelope.from_signature) ? "from_signature" : "to_signature",
        message: "Atomic ownership transfer requires valid Ed25519 signatures from BOTH outgoing and incoming owners/stewards.",
      });
    } else {
      const signingBytes = buildDomainSigningBytes(
        OWNERSHIP_TRANSFER_SIGNING_DOMAIN,
        stripTransferSignatures(envelope)
      );
      const allowedFromSigners = new Set([currentCharter.owner.id]);
      if (currentCharter.steward_human_id) {
        allowedFromSigners.add(currentCharter.steward_human_id);
      }
      const allowedToSigners = new Set();
      if (toValid) {
        allowedToSigners.add(envelope.to_owner.id);
      }
      if (typeof envelope.new_steward_human_id === "string") {
        allowedToSigners.add(envelope.new_steward_human_id);
      }

      verifyTransferSideSignature(
        envelope.from_signature,
        allowedFromSigners,
        signingBytes,
        "from_signature",
        errors
      );
      verifyTransferSideSignature(
        envelope.to_signature,
        allowedToSigners,
        signingBytes,
        "to_signature",
        errors
      );
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const nextUnsigned = {
    ...stripOwnerSignature(currentCharter),
    charter_revision: currentCharter.charter_revision + 1,
    owner: { ...envelope.to_owner },
    managers:
      envelope.manager_policy === "CLEAR_ALL" ? [] : [...envelope.ratified_managers],
    lifecycle_state: "ACTIVE",
    transfer_nonce: envelope.transfer_nonce,
    issued_at: envelope.initiated_at,
  };

  if (envelope.to_owner.type === "organization") {
    nextUnsigned.steward_human_id = envelope.new_steward_human_id;
  } else {
    delete nextUnsigned.steward_human_id;
  }

  let nextCharter = nextUnsigned;
  if (nextOwnerPrivateKeySeedHex) {
    const signerId =
      nextOwnerSignerId ||
      (envelope.to_owner.type === "organization"
        ? envelope.new_steward_human_id
        : envelope.to_owner.id);
    nextCharter = signRoleCharter(nextUnsigned, {
      signerId,
      privateKeySeedHex: nextOwnerPrivateKeySeedHex,
    });
  }

  return {
    valid: true,
    errors: [],
    nextCharter,
  };
}

/**
 * Minimal coFACTS L1 conformance checker.
 * Enforces the coFay <-> iFay boundary (rejecting iFay targets with BOUNDARY_IFAY_USE_IFACTS)
 * and evaluates RoleCharter 1.0 invariants + cryptographic integrity.
 */
export function runCoFactsL1Check(subject, options = {}) {
  const targetId = isPlainObject(subject)
    ? String(subject.cofay_id || subject.id || "unknown")
    : "unknown";

  if (
    isPlainObject(subject) &&
    (subject.kind === "IFAY_MANIFEST" ||
      subject.kind === "IFAY_ID" ||
      (typeof subject.cofay_id === "string" && subject.cofay_id.startsWith("ifay_")) ||
      (typeof subject.id === "string" && subject.id.startsWith("ifay_")))
  ) {
    return {
      report_version: COFACTS_L1_REPORT_VERSION,
      suite: "coFACTS",
      level: "L1",
      target_id: targetId,
      conformance: "REJECTED_BOUNDARY",
      checks: [
        {
          id: "L1-BOUNDARY-01",
          name: "coFACTS vs iFACTS target boundary",
          passed: false,
        },
      ],
      errors: [
        {
          code: "BOUNDARY_IFAY_USE_IFACTS",
          message: "iFay personal avatars are outside coFACTS scope; verify with iFACTS instead.",
        },
      ],
    };
  }

  const validation = validateRoleCharter(subject, {
    verifySignature: options.verifySignature !== false,
  });

  const errorCodes = new Set(validation.errors.map((e) => e.code));
  const checks = [
    {
      id: "L1-BOUNDARY-01",
      name: "coFACTS vs iFACTS target boundary",
      passed: !errorCodes.has("BOUNDARY_IFAY_USE_IFACTS"),
    },
    {
      id: "L1-NO-EGO-02",
      name: "Absence of personal Ego layer attachment",
      passed: !errorCodes.has("COFAY_EGO_FORBIDDEN"),
    },
    {
      id: "L1-TAXONOMY-03",
      name: "Canonical public role archetype",
      passed: !errorCodes.has("ROLE_ARCHETYPE_INVALID"),
    },
    {
      id: "L1-OWNERSHIP-04",
      name: "Single-layer ownership & natural-person steward accountability",
      passed:
        !errorCodes.has("OWNER_TYPE_FORBIDDEN") &&
        !errorCodes.has("OWNER_INVALID") &&
        !errorCodes.has("ORG_STEWARD_REQUIRED") &&
        !errorCodes.has("STEWARD_MUST_BE_HUMAN"),
    },
    {
      id: "L1-CAPABILITIES-05",
      name: "SSP caller auth gates, CAP bounds & explicit red lines",
      passed:
        !errorCodes.has("CAPABILITIES_INVALID") &&
        !errorCodes.has("SSP_AUTH_REQUIRED_FOR_NON_PUBLIC") &&
        !errorCodes.has("CAP_BOUNDS_INVALID") &&
        !errorCodes.has("PROHIBITED_ACTIONS_INVALID"),
    },
    {
      id: "L1-CRYPTO-06",
      name: "Ed25519 JCS RoleCharter signature & actor traceability policy",
      passed: validation.valid,
    },
  ];

  return {
    report_version: COFACTS_L1_REPORT_VERSION,
    suite: "coFACTS",
    level: "L1",
    target_id: targetId,
    conformance: validation.valid ? "PASS" : "FAIL",
    checks,
    errors: validation.errors,
  };
}
