import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  ROLE_ARCHETYPES,
  ROLE_CHARTER_SCHEMA_VERSION,
  TRANSFER_ENVELOPE_VERSION,
  computeCharterDigestHex,
  deriveEd25519KeyPairFromSeedHex,
  signRoleCharter,
  validateRoleCharter,
  signTransferEnvelope,
  applyOwnershipTransfer,
  runCoFactsL1Check,
} from "./cofay-charter.mjs";
import { buildEmbeddedFayManifest, packCoFayBuf } from "./cofay-buf.mjs";

const BASE32_ALPHABET = "abcdefghijklmnopqrstuvwxyz234567";
const HUMAN_ID_RE = /^hid_[a-z2-7]+$/;

export const ARCHETYPE_TEMPLATES = Object.freeze({
  org_service: {
    defaultDisplayName: "Civic Public Service Desk",
    missionStatement:
      "Provide standardized, auditable public service consultation, intake routing, and CAP-gated form verification on behalf of the accountable organization without personal Ego persona attachment.",
    allowedCapabilities: {
      ssp_skills: [
        {
          skill_ref: "ssp://org_public-service/consultation-intake@1.0",
          visibility: "public",
          require_caller_auth: false,
        },
        {
          skill_ref: "ssp://org_public-service/case-submission@1.0",
          visibility: "restricted",
          require_caller_auth: true,
        },
      ],
      cap_bounds: {
        allowed_scopes: ["cap:document.verify", "cap:queue.dispatch", "fs.read"],
        max_autonomy_tier: "delegated",
        allow_irreversible_actions: false,
      },
    },
    prohibitedActions: [
      "Never attach or load any personal Ego model or impersonate a Human Prime.",
      "Never execute irreversible statutory revocations without human steward countersignature.",
    ],
  },
  functional_post: {
    defaultDisplayName: "Open Governance Treasury Auditor Seat",
    missionStatement:
      "Execute chartered institutional post duties, review non-monetary GMChain contribution attestations, and publish append-only audit summaries across steward term rotations.",
    allowedCapabilities: {
      ssp_skills: [
        {
          skill_ref: "ssp://org_governance/audit-summary@1.0",
          visibility: "public",
          require_caller_auth: false,
        },
        {
          skill_ref: "ssp://org_governance/compliance-attestation@1.0",
          visibility: "restricted",
          require_caller_auth: true,
        },
      ],
      cap_bounds: {
        allowed_scopes: ["cap:audit.inspect", "cap:report.publish", "fs.read", "net.http"],
        max_autonomy_tier: "official_post",
        allow_irreversible_actions: false,
      },
    },
    prohibitedActions: [
      "Never attach or load any personal Ego model or claim natural-person identity.",
      "Never initiate monetary transfers or speculative asset operations on GMChain.",
    ],
  },
  project_collaborator: {
    defaultDisplayName: "Cross-Entity Open Science Coordinator",
    missionStatement:
      "Coordinate multi-party research milestones, TP shared workspace synchronization, and reproducible artifact verification across collaborating institutions.",
    allowedCapabilities: {
      ssp_skills: [
        {
          skill_ref: "ssp://project_commons/milestone-status@1.0",
          visibility: "public",
          require_caller_auth: false,
        },
        {
          skill_ref: "ssp://project_commons/tp-workspace-sync@1.0",
          visibility: "restricted",
          require_caller_auth: true,
        },
      ],
      cap_bounds: {
        allowed_scopes: ["cap:workspace.sync", "cap:artifact.verify", "fs.read", "fs.write"],
        max_autonomy_tier: "assistive",
        allow_irreversible_actions: false,
      },
    },
    prohibitedActions: [
      "Never attach a personal Ego replica or expose private Human Prime credentials.",
      "Never re-delegate management authority beyond single-hop iFay managers.",
    ],
  },
});

/**
 * Deterministically encodes raw bytes into lowercase RFC 4648 base32 (`a-z2-7`).
 */
export function encodeBase32Lower(bytes, length = 26) {
  let bits = 0;
  let value = 0;
  let out = "";
  for (let i = 0; i < bytes.length && out.length < length; i += 1) {
    value = (value << 8) | bytes[i];
    bits += 8;
    while (bits >= 5 && out.length < length) {
      out += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0 && out.length < length) {
    out += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return out;
}

/**
 * Generates a canonical prefixed base32 identifier (`cofay_`, `chr_`, `hid_`, `ifay_`, `mpk_`).
 */
export function generateBase32Id(prefix, seedMaterial) {
  const source =
    seedMaterial !== undefined
      ? crypto.createHash("sha256").update(String(seedMaterial), "utf8").digest()
      : crypto.randomBytes(20);
  return `${prefix}${encodeBase32Lower(source, 26)}`;
}

/**
 * Generates a random 32-byte Ed25519 seed hex when none is supplied.
 */
export function generateEd25519SeedHex() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Builds, validates, and Ed25519-signs a `RoleCharter 1.0` for any of the 3 archetypes
 * (`org_service`, `functional_post`, `project_collaborator`).
 */
export function createSeatCharter(options = {}) {
  const archetype = options.roleArchetype || "org_service";
  const template = ARCHETYPE_TEMPLATES[archetype] || ARCHETYPE_TEMPLATES.org_service;

  const seedHex = options.privateKeySeedHex || generateEd25519SeedHex();
  const keyPair = deriveEd25519KeyPairFromSeedHex(seedHex);

  const ownerType = options.ownerType ?? "organization";
  const ownerId =
    options.ownerId ??
    (ownerType === "organization"
      ? "org_open-civic-commons"
      : generateBase32Id("hid_", `owner:${keyPair.publicKeyHex}`));

  const cofayId =
    options.cofayId ||
    generateBase32Id("cofay_", `cofay:${archetype}:${ownerId}:${keyPair.publicKeyHex}`);
  const charterId =
    options.charterId || generateBase32Id("chr_", `charter:${cofayId}:rev1`);
  const meritPocketRef =
    options.meritPocketRef ||
    `mpk_${cofayId.startsWith("cofay_") ? cofayId.slice("cofay_".length) : encodeBase32Lower(Buffer.from(cofayId), 26)}`;

  const unsignedCharter = {
    schema_version: ROLE_CHARTER_SCHEMA_VERSION,
    charter_id: charterId,
    charter_revision: 1,
    cofay_id: cofayId,
    display_name: options.displayName || template.defaultDisplayName,
    role_archetype: archetype,
    owner: {
      type: ownerType,
      id: ownerId,
    },
    managers: Array.isArray(options.managers) ? [...options.managers] : [],
    mission_statement: options.missionStatement || template.missionStatement,
    allowed_capabilities: options.allowedCapabilities
      ? structuredClone(options.allowedCapabilities)
      : structuredClone(template.allowedCapabilities),
    prohibited_actions: Array.isArray(options.prohibitedActions)
      ? [...options.prohibitedActions]
      : [...template.prohibitedActions],
    audit_policy: {
      retention_days: options.retentionDays ?? 365,
      log_mode: options.logMode || "hash_chain",
      require_actor_trace: true,
      gmc_merit_pocket_ref: meritPocketRef,
    },
    lifecycle_state: "ACTIVE",
    transfer_nonce: 0,
    issued_at: options.issuedAt || new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
  };

  if (options.expiresAt) {
    unsignedCharter.expires_at = options.expiresAt;
  }

  // Explicitly populate or omit steward_human_id so ORG_STEWARD_REQUIRED triggers if omitted when explicitly null
  if (options.stewardHumanId !== undefined) {
    if (options.stewardHumanId !== null && options.stewardHumanId !== "") {
      unsignedCharter.steward_human_id = options.stewardHumanId;
    }
  } else if (ownerType === "organization") {
    unsignedCharter.steward_human_id = generateBase32Id(
      "hid_",
      `steward:${ownerId}:${keyPair.publicKeyHex}`
    );
  }

  // Forward any caller-injected extra fields (e.g. ego_package in negative tests) so validateRoleCharter catches COFAY_EGO_FORBIDDEN
  if (options.extraFields && typeof options.extraFields === "object") {
    Object.assign(unsignedCharter, options.extraFields);
  }
  if (options.ego !== undefined) {
    unsignedCharter.ego_package = options.ego;
  }

  // Structural/semantic pre-validation before signing
  const preCheck = validateRoleCharter(unsignedCharter, { verifySignature: false });
  if (!preCheck.valid) {
    return {
      valid: false,
      errors: preCheck.errors,
    };
  }

  const signerId =
    options.signerId ||
    (unsignedCharter.owner.type === "organization"
      ? unsignedCharter.steward_human_id
      : unsignedCharter.owner.id);

  const charter = signRoleCharter(unsignedCharter, {
    signerId,
    privateKeySeedHex: seedHex,
  });

  const fullCheck = validateRoleCharter(charter, { verifySignature: true });
  if (!fullCheck.valid) {
    return {
      valid: false,
      errors: fullCheck.errors,
    };
  }

  const cofactsReport = runCoFactsL1Check(charter);

  return {
    valid: true,
    errors: [],
    charter,
    cofactsReport,
    signerId,
    publicKeyHex: keyPair.publicKeyHex,
    privateKeySeedHex: seedHex,
  };
}

/**
 * Writes a ready-to-deploy `coFay` seat bundle directory (`role-charter.json`,
 * `fay-manifest.json`, `cofacts-l1-report.json`, `seat-metadata.json`, and optional `seat.buf`).
 */
export function createSeatBundle(options = {}) {
  const res = createSeatCharter(options);
  if (!res.valid) {
    return res;
  }

  const { charter, cofactsReport, signerId, publicKeyHex } = res;
  const fayManifest = buildEmbeddedFayManifest(charter, options.capabilities);
  const packBuf = options.packBuf !== false;
  const bufArtifact = packBuf
    ? packCoFayBuf(charter, { capabilities: options.capabilities })
    : null;

  const seatMetadata = {
    bundle_version: "cofay-seat-bundle/1.0",
    cofay_id: charter.cofay_id,
    display_name: charter.display_name,
    role_archetype: charter.role_archetype,
    owner: charter.owner,
    steward_human_id: charter.steward_human_id || null,
    managers: charter.managers,
    merit_pocket_ref: charter.audit_policy.gmc_merit_pocket_ref,
    charter_revision: charter.charter_revision,
    transfer_nonce: charter.transfer_nonce,
    charter_digest_hex: computeCharterDigestHex(charter),
    signer_id: signerId,
    public_key_hex: publicKeyHex,
    cofacts_conformance: cofactsReport.conformance,
    buf_artifact: bufArtifact
      ? {
          file: "seat.buf",
          total_bytes: bufArtifact.totalLength,
          manifest_digest_hex: bufArtifact.manifestDigestHex,
          crc32_hex: `0x${bufArtifact.crc32.toString(16).padStart(8, "0")}`,
        }
      : null,
  };

  let files = null;
  if (options.outDir) {
    const outDir = path.resolve(options.outDir);
    fs.mkdirSync(outDir, { recursive: true });
    const charterPath = path.join(outDir, "role-charter.json");
    const manifestPath = path.join(outDir, "fay-manifest.json");
    const reportPath = path.join(outDir, "cofacts-l1-report.json");
    const metaPath = path.join(outDir, "seat-metadata.json");

    fs.writeFileSync(charterPath, `${JSON.stringify(charter, null, 2)}\n`, "utf8");
    fs.writeFileSync(manifestPath, `${JSON.stringify(fayManifest, null, 2)}\n`, "utf8");
    fs.writeFileSync(reportPath, `${JSON.stringify(cofactsReport, null, 2)}\n`, "utf8");
    fs.writeFileSync(metaPath, `${JSON.stringify(seatMetadata, null, 2)}\n`, "utf8");

    files = {
      outDir,
      charterPath,
      manifestPath,
      reportPath,
      metaPath,
    };

    if (bufArtifact) {
      const bufPath = path.join(outDir, "seat.buf");
      fs.writeFileSync(bufPath, bufArtifact.bytes);
      files.bufPath = bufPath;
    }
  }

  return {
    ...res,
    fayManifest,
    seatMetadata,
    bufArtifact,
    files,
  };
}

/**
 * Rotates the accountable natural-person steward (`steward_human_id`) of an
 * organization-owned `coFay` seat (`charter_revision + 1`), preserving `cofay_id`,
 * `owner`, `transfer_nonce`, and `GMChain` `MeritPocket` continuity without haircutting.
 */
export function rotateSteward(currentCharter, options = {}) {
  const errors = [];
  const baseCheck = validateRoleCharter(currentCharter, {
    verifySignature: options.verifySignature !== false,
  });
  if (!baseCheck.valid) {
    return { valid: false, errors: baseCheck.errors };
  }

  if (currentCharter.lifecycle_state === "REVOKED") {
    return {
      valid: false,
      errors: [
        {
          code: "CHARTER_REVOKED_NOT_ROTATABLE",
          field: "lifecycle_state",
          message: "Cannot rotate steward on a REVOKED RoleCharter.",
        },
      ],
    };
  }

  if (currentCharter.owner?.type !== "organization") {
    return {
      valid: false,
      errors: [
        {
          code: "STEWARD_ROTATION_REQUIRES_ORG_OWNER",
          field: "owner.type",
          message:
            "Steward rotation applies to organization-owned coFay seats; for human-owned seats, use dual-signed ownership transfer.",
        },
      ],
    };
  }

  const { newStewardHumanId, privateKeySeedHex } = options;
  if (!newStewardHumanId) {
    errors.push({
      code: "ORG_STEWARD_REQUIRED",
      field: "steward_human_id",
      message: "newStewardHumanId is required when rotating an organization coFay steward.",
    });
  } else if (typeof newStewardHumanId !== "string" || !HUMAN_ID_RE.test(newStewardHumanId)) {
    errors.push({
      code: "STEWARD_MUST_BE_HUMAN",
      field: "steward_human_id",
      message: "newStewardHumanId must be a natural-person HumanID (hid_<base32>), never ifay_ or cofay_.",
    });
  } else if (newStewardHumanId === currentCharter.steward_human_id) {
    errors.push({
      code: "STEWARD_ROTATION_UNCHANGED",
      field: "steward_human_id",
      message: "newStewardHumanId must differ from the current steward_human_id.",
    });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const nextUnsigned = {
    ...currentCharter,
    charter_revision: currentCharter.charter_revision + 1,
    steward_human_id: newStewardHumanId,
    managers: Array.isArray(options.managers)
      ? [...options.managers]
      : [...currentCharter.managers],
    lifecycle_state: "ACTIVE",
    issued_at: options.issuedAt || new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
  };
  delete nextUnsigned.owner_signature;

  const signerId = options.signerId || newStewardHumanId;
  const nextCharter = signRoleCharter(nextUnsigned, {
    signerId,
    privateKeySeedHex,
  });

  const postCheck = validateRoleCharter(nextCharter, { verifySignature: true });
  if (!postCheck.valid) {
    return { valid: false, errors: postCheck.errors };
  }

  return {
    valid: true,
    errors: [],
    priorCharterDigestHex: computeCharterDigestHex(currentCharter),
    nextCharter,
    meritContinuity: {
      cofay_id: nextCharter.cofay_id,
      gmc_merit_pocket_ref: nextCharter.audit_policy.gmc_merit_pocket_ref,
      retention_ratio: "1.0",
      inheritance_haircut: "0%",
    },
  };
}

/**
 * Constructs, dual-signs, and atomically applies an ownership `TransferEnvelope 1.0`,
 * preserving `cofay_id` and its `GMChain` `MeritPocket` (`100%` retention, `0%` haircut).
 */
export function executeDualSignedTransfer(currentCharter, options = {}) {
  const initiatedAt =
    options.initiatedAt || new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const expiresAt =
    options.expiresAt ||
    new Date(Date.parse(initiatedAt) + 24 * 3600 * 1000)
      .toISOString()
      .replace(/\.\d{3}Z$/, "Z");

  const managerPolicy = options.managerPolicy || "CLEAR_ALL";
  const ratifiedManagers =
    managerPolicy === "CLEAR_ALL"
      ? []
      : Array.isArray(options.ratifiedManagers)
        ? [...options.ratifiedManagers]
        : [];

  const unsignedEnvelope = {
    envelope_version: TRANSFER_ENVELOPE_VERSION,
    cofay_id: currentCharter?.cofay_id,
    prior_charter_digest_hex: computeCharterDigestHex(currentCharter),
    transfer_nonce: (currentCharter?.transfer_nonce ?? 0) + 1,
    from_owner: currentCharter?.owner,
    to_owner: options.toOwner,
    manager_policy: managerPolicy,
    ratified_managers: ratifiedManagers,
    merit_continuity: {
      preserve_cofay_id: true,
      preserve_merit_pocket: true,
    },
    initiated_at: initiatedAt,
    expires_at: expiresAt,
  };

  if (options.newStewardHumanId !== undefined) {
    unsignedEnvelope.new_steward_human_id = options.newStewardHumanId;
  }

  const fromSignerId =
    options.fromSignerId ||
    (currentCharter?.owner?.type === "organization"
      ? currentCharter.steward_human_id
      : currentCharter?.owner?.id);
  const toSignerId =
    options.toSignerId ||
    (options.toOwner?.type === "organization"
      ? options.newStewardHumanId
      : options.toOwner?.id);

  const envelope = signTransferEnvelope(unsignedEnvelope, {
    fromSignerId,
    fromPrivateKeySeedHex: options.fromPrivateKeySeedHex,
    toSignerId,
    toPrivateKeySeedHex: options.toPrivateKeySeedHex,
  });

  const applied = applyOwnershipTransfer(currentCharter, envelope, {
    verifySignatures: true,
    nextOwnerSignerId: toSignerId,
    nextOwnerPrivateKeySeedHex: options.toPrivateKeySeedHex,
  });

  if (!applied.valid) {
    return {
      valid: false,
      errors: applied.errors,
      envelope,
    };
  }

  return {
    valid: true,
    errors: [],
    envelope,
    nextCharter: applied.nextCharter,
    meritContinuity: {
      cofay_id: applied.nextCharter.cofay_id,
      gmc_merit_pocket_ref: applied.nextCharter.audit_policy.gmc_merit_pocket_ref,
      retention_ratio: "1.0",
      inheritance_haircut: "0%",
    },
  };
}

export { ROLE_ARCHETYPES };
