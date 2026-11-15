import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  ROLE_ARCHETYPES,
  COFACTS_L1_REPORT_VERSION,
  canonicalizeJcs,
  computeCharterDigestHex,
  deriveEd25519KeyPairFromSeedHex,
  signRoleCharter,
  verifyRoleCharterSignature,
  validateRoleCharter,
  validateManagerDelegation,
  validateActionAuditRecord,
  signTransferEnvelope,
  applyOwnershipTransfer,
  runCoFactsL1Check,
} from "../src/cofay-charter.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");

const OWNER_HUMAN_SEED = "0101010101010101010101010101010101010101010101010101010101010101";
const STEWARD_A_SEED = "0202020202020202020202020202020202020202020202020202020202020202";
const STEWARD_B_SEED = "0303030303030303030303030303030303030303030303030303030303030303";
const ATTACKER_SEED = "0404040404040404040404040404040404040404040404040404040404040404";

function makeBaseUnsignedCharter(overrides = {}) {
  return {
    schema_version: "1.0",
    charter_id: "chr_b4f2k7m5p3q6r4s2t4v6w3x2y4",
    charter_revision: 1,
    cofay_id: "cofay_c5g3m6n2q4r7s5t3v5w7x4y3z5",
    display_name: "Municipal Public Permit Desk",
    role_archetype: "org_service",
    owner: {
      type: "organization",
      id: "org_civic-service-bureau",
    },
    steward_human_id: "hid_a3d5f7g4j2k4m6n5p2q4r6s7t2",
    managers: [
      "ifay_m2n4p6q7r2s4t6v5w2x4y6z2a4",
      "ifay_k3m5p7q6r3s5t7v4w3x5y7z3b5",
    ],
    mission_statement:
      "Provide standardized public consultation and application intake on behalf of the Civic Service Bureau.",
    allowed_capabilities: {
      ssp_skills: [
        {
          skill_ref: "ssp://org_civic-service-bureau/permit-inquiry@1.0",
          visibility: "public",
          require_caller_auth: false,
        },
        {
          skill_ref: "ssp://org_civic-service-bureau/permit-filing@1.0",
          visibility: "restricted",
          require_caller_auth: true,
        },
      ],
      cap_bounds: {
        allowed_scopes: ["cap:document.verify", "cap:queue.dispatch"],
        max_autonomy_tier: "delegated",
        allow_irreversible_actions: false,
      },
    },
    prohibited_actions: [
      "Never impersonate any Human Prime or attach a personal Ego model.",
      "Never issue final statutory revocations without human steward countersignature.",
    ],
    audit_policy: {
      retention_days: 365,
      log_mode: "hash_chain",
      require_actor_trace: true,
      gmc_merit_pocket_ref: "mpk_c5g3m6n2q4r7s5t3v5w7x4y3z5",
    },
    lifecycle_state: "ACTIVE",
    transfer_nonce: 0,
    issued_at: "2026-11-16T00:00:00Z",
    ...overrides,
  };
}

test("Schema parity: schemas/cofay-role-charter-1.0.json matches schema/2025-10-25/schema.json", () => {
  const canonicalSchemaPath = path.join(ROOT_DIR, "schemas", "cofay-role-charter-1.0.json");
  const mirrorSchemaPath = path.join(ROOT_DIR, "schema", "2025-10-25", "schema.json");
  const tsSchemaPath = path.join(ROOT_DIR, "schema", "2025-10-25", "schema.ts");
  const mdxSchemaPath = path.join(ROOT_DIR, "schema", "2025-10-25", "schema.mdx");

  assert.equal(fs.existsSync(canonicalSchemaPath), true);
  assert.equal(fs.existsSync(mirrorSchemaPath), true);
  assert.equal(fs.existsSync(tsSchemaPath), true);
  assert.equal(fs.existsSync(mdxSchemaPath), true);

  const canonicalJson = JSON.parse(fs.readFileSync(canonicalSchemaPath, "utf8"));
  const mirrorJson = JSON.parse(fs.readFileSync(mirrorSchemaPath, "utf8"));
  assert.deepEqual(canonicalJson, mirrorJson);
  assert.equal(canonicalJson.$id, "https://ifay.ai/schemas/cofay-role-charter-1.0.json");
  assert.ok(fs.statSync(tsSchemaPath).size > 1000);
  assert.ok(fs.statSync(mdxSchemaPath).size > 1000);
});

test("RFC 8785 JCS canonicalization is deterministic regardless of key insertion order", () => {
  const a = { z: 1, a: { d: true, b: [3, 2, 1] }, m: "coFay" };
  const b = { m: "coFay", a: { b: [3, 2, 1], d: true }, z: 1 };
  assert.equal(canonicalizeJcs(a), canonicalizeJcs(b));
  assert.equal(canonicalizeJcs(a), '{"a":{"b":[3,2,1],"d":true},"m":"coFay","z":1}');
});

test("RoleCharter Ed25519 JCS signing, verification, and tamper detection across all 3 archetypes", () => {
  assert.deepEqual(ROLE_ARCHETYPES, [
    "org_service",
    "functional_post",
    "project_collaborator",
  ]);

  for (const archetype of ROLE_ARCHETYPES) {
    const unsigned = makeBaseUnsignedCharter({ role_archetype: archetype });
    const signed = signRoleCharter(unsigned, {
      signerId: unsigned.steward_human_id,
      privateKeySeedHex: STEWARD_A_SEED,
    });
    const res = validateRoleCharter(signed);
    assert.equal(res.valid, true, `Expected ${archetype} charter to pass: ${JSON.stringify(res.errors)}`);

    const tampered = { ...signed, mission_statement: "Tampered mission statement after signing." };
    const sigCheck = verifyRoleCharterSignature(tampered);
    assert.equal(sigCheck.valid, false);
    assert.equal(sigCheck.code, "CHARTER_SIGNATURE_INVALID");
  }
});

test("Rejects Ego attachment, nested ifay_/cofay_ ownership, and missing org steward", () => {
  const withEgo = signRoleCharter(
    {
      ...makeBaseUnsignedCharter(),
      ego_package: "@ego-models/personal-clone@1.0.0",
    },
    {
      signerId: "hid_a3d5f7g4j2k4m6n5p2q4r6s7t2",
      privateKeySeedHex: STEWARD_A_SEED,
    }
  );
  const egoRes = validateRoleCharter(withEgo);
  assert.equal(egoRes.valid, false);
  assert.ok(egoRes.errors.some((e) => e.code === "COFAY_EGO_FORBIDDEN"));

  const nestedCoFayOwner = makeBaseUnsignedCharter({
    owner: { type: "organization", id: "cofay_c5g3m6n2q4r7s5t3v5w7x4y3z5" },
  });
  const nestedRes = validateRoleCharter(nestedCoFayOwner, { verifySignature: false });
  assert.equal(nestedRes.valid, false);
  assert.ok(nestedRes.errors.some((e) => e.code === "OWNER_TYPE_FORBIDDEN"));

  const missingSteward = makeBaseUnsignedCharter({ steward_human_id: undefined });
  delete missingSteward.steward_human_id;
  const stewardRes = validateRoleCharter(missingSteward, { verifySignature: false });
  assert.equal(stewardRes.valid, false);
  assert.ok(stewardRes.errors.some((e) => e.code === "ORG_STEWARD_REQUIRED"));
});

test("Single-hop manager delegation allows owner/steward and rejects manager re-delegation", () => {
  const signedCharter = signRoleCharter(makeBaseUnsignedCharter(), {
    signerId: "hid_a3d5f7g4j2k4m6n5p2q4r6s7t2",
    privateKeySeedHex: STEWARD_A_SEED,
  });

  const validGrant = validateManagerDelegation(signedCharter, {
    action: "GRANT",
    issuer_id: signedCharter.steward_human_id,
    target_manager_id: "ifay_p7q6r3s5t7v4w3x5y7z3b5c7d4",
  });
  assert.equal(validGrant.valid, true);

  const redelegationAttempt = validateManagerDelegation(signedCharter, {
    action: "GRANT",
    issuer_id: signedCharter.managers[0],
    target_manager_id: "ifay_p7q6r3s5t7v4w3x5y7z3b5c7d4",
  });
  assert.equal(redelegationAttempt.valid, false);
  assert.ok(redelegationAttempt.errors.some((e) => e.code === "MANAGER_REDELEGATION_FORBIDDEN"));
});

test("Audit traceability requires cofay_id, owner_id, authorized actor_signer_id, and forbids human impersonation", () => {
  const signedCharter = signRoleCharter(makeBaseUnsignedCharter(), {
    signerId: "hid_a3d5f7g4j2k4m6n5p2q4r6s7t2",
    privateKeySeedHex: STEWARD_A_SEED,
  });

  const validRecord = validateActionAuditRecord(signedCharter, {
    cofay_id: signedCharter.cofay_id,
    owner_id: signedCharter.owner.id,
    actor_signer_id: signedCharter.managers[0],
    action_type: "ssp.skill.invoke",
    timestamp: "2026-11-16T01:00:00Z",
  });
  assert.equal(validRecord.valid, true);

  const impersonationRecord = validateActionAuditRecord(signedCharter, {
    cofay_id: signedCharter.cofay_id,
    owner_id: signedCharter.owner.id,
    actor_signer_id: signedCharter.managers[0],
    acting_as_natural_person: true,
    action_type: "ssp.skill.invoke",
    timestamp: "2026-11-16T01:00:00Z",
  });
  assert.equal(impersonationRecord.valid, false);
  assert.ok(
    impersonationRecord.errors.some((e) => e.code === "NATURAL_PERSON_IMPERSONATION_FORBIDDEN")
  );
});

test("Atomic Dual-Signed Ownership Transfer clears stale managers, preserves cofay_id & MeritPocket, and blocks single-sig or replay nonce", () => {
  const currentCharter = signRoleCharter(makeBaseUnsignedCharter(), {
    signerId: "hid_a3d5f7g4j2k4m6n5p2q4r6s7t2",
    privateKeySeedHex: STEWARD_A_SEED,
  });
  assert.equal(currentCharter.managers.length, 2);

  const unsignedTransfer = {
    envelope_version: "1.0",
    cofay_id: currentCharter.cofay_id,
    prior_charter_digest_hex: computeCharterDigestHex(currentCharter),
    transfer_nonce: 1,
    from_owner: currentCharter.owner,
    to_owner: {
      type: "organization",
      id: "org_metro-digital-agency",
    },
    new_steward_human_id: "hid_z4y6x7w6v5t4s3r2q7p6n5m4k3",
    manager_policy: "CLEAR_ALL",
    ratified_managers: [],
    merit_continuity: {
      preserve_cofay_id: true,
      preserve_merit_pocket: true,
    },
    initiated_at: "2026-11-16T02:00:00Z",
    expires_at: "2026-11-17T02:00:00Z",
  };

  const dualSigned = signTransferEnvelope(unsignedTransfer, {
    fromSignerId: currentCharter.steward_human_id,
    fromPrivateKeySeedHex: STEWARD_A_SEED,
    toSignerId: unsignedTransfer.new_steward_human_id,
    toPrivateKeySeedHex: STEWARD_B_SEED,
  });

  const transferRes = applyOwnershipTransfer(currentCharter, dualSigned, {
    nextOwnerSignerId: unsignedTransfer.new_steward_human_id,
    nextOwnerPrivateKeySeedHex: STEWARD_B_SEED,
  });
  assert.equal(transferRes.valid, true, JSON.stringify(transferRes.errors));
  assert.equal(transferRes.nextCharter.cofay_id, currentCharter.cofay_id);
  assert.deepEqual(transferRes.nextCharter.owner, unsignedTransfer.to_owner);
  assert.equal(transferRes.nextCharter.steward_human_id, unsignedTransfer.new_steward_human_id);
  assert.deepEqual(transferRes.nextCharter.managers, []);
  assert.equal(transferRes.nextCharter.transfer_nonce, 1);
  assert.equal(
    transferRes.nextCharter.audit_policy.gmc_merit_pocket_ref,
    currentCharter.audit_policy.gmc_merit_pocket_ref
  );
  assert.equal(validateRoleCharter(transferRes.nextCharter).valid, true);

  // Unilateral single-signed transfer must fail
  const singleSigned = { ...dualSigned };
  delete singleSigned.to_signature;
  const singleRes = applyOwnershipTransfer(currentCharter, singleSigned);
  assert.equal(singleRes.valid, false);
  assert.ok(singleRes.errors.some((e) => e.code === "TRANSFER_DUAL_SIGNATURE_REQUIRED"));

  // Replay with transfer_nonce = 1 against already-transferred charter (nonce 1) must fail
  const replayEnvelope = signTransferEnvelope(
    {
      ...unsignedTransfer,
      prior_charter_digest_hex: computeCharterDigestHex(transferRes.nextCharter),
      from_owner: transferRes.nextCharter.owner,
      to_owner: { type: "human", id: "hid_h2j4k6m7n2p4q6r5s2t4v6w7x2" },
      new_steward_human_id: undefined,
      transfer_nonce: 1, // stale nonce! should be 2
    },
    {
      fromSignerId: transferRes.nextCharter.steward_human_id,
      fromPrivateKeySeedHex: STEWARD_B_SEED,
      toSignerId: "hid_h2j4k6m7n2p4q6r5s2t4v6w7x2",
      toPrivateKeySeedHex: OWNER_HUMAN_SEED,
    }
  );
  const replayRes = applyOwnershipTransfer(transferRes.nextCharter, replayEnvelope);
  assert.equal(replayRes.valid, false);
  assert.ok(replayRes.errors.some((e) => e.code === "TRANSFER_NONCE_MISMATCH"));

  // Forged signature with attacker key must fail
  const forged = signTransferEnvelope(unsignedTransfer, {
    fromSignerId: currentCharter.steward_human_id,
    fromPrivateKeySeedHex: STEWARD_A_SEED,
    toSignerId: unsignedTransfer.new_steward_human_id,
    toPrivateKeySeedHex: ATTACKER_SEED,
  });
  // Tamper public key back to expected steward B key to simulate forged signature bytes
  forged.to_signature.public_key_hex = deriveEd25519KeyPairFromSeedHex(STEWARD_B_SEED).publicKeyHex;
  const forgedRes = applyOwnershipTransfer(currentCharter, forged);
  assert.equal(forgedRes.valid, false);
  assert.ok(forgedRes.errors.some((e) => e.code === "TRANSFER_SIGNATURE_INVALID"));
});

test("coFACTS L1 checker passes valid coFay RoleCharter and enforces coFACTS vs iFACTS boundary", () => {
  const validCharter = signRoleCharter(makeBaseUnsignedCharter(), {
    signerId: "hid_a3d5f7g4j2k4m6n5p2q4r6s7t2",
    privateKeySeedHex: STEWARD_A_SEED,
  });

  const passReport = runCoFactsL1Check(validCharter);
  assert.equal(passReport.report_version, COFACTS_L1_REPORT_VERSION);
  assert.equal(passReport.suite, "coFACTS");
  assert.equal(passReport.level, "L1");
  assert.equal(passReport.conformance, "PASS");
  assert.equal(passReport.errors.length, 0);

  const ifayBoundaryReport = runCoFactsL1Check({
    cofay_id: "ifay_m2n4p6q7r2s4t6v5w2x4y6z2a4",
    kind: "IFAY_MANIFEST",
  });
  assert.equal(ifayBoundaryReport.conformance, "REJECTED_BOUNDARY");
  assert.ok(ifayBoundaryReport.errors.some((e) => e.code === "BOUNDARY_IFAY_USE_IFACTS"));
});

test("Official conformance vectors suite (>= 16 positive & negative vectors) passes 100%", () => {
  const vectorsPath = path.join(ROOT_DIR, "vectors", "cofay-role-charter-vectors.json");
  assert.equal(fs.existsSync(vectorsPath), true);
  const suite = JSON.parse(fs.readFileSync(vectorsPath, "utf8"));

  assert.equal(suite.suite, "cofay-role-charter-conformance");
  assert.equal(suite.version, "1.0");
  assert.ok(Array.isArray(suite.vectors));
  assert.ok(
    suite.vectors.length >= 16,
    `Expected >= 16 conformance vectors, found ${suite.vectors.length}`
  );

  for (const vec of suite.vectors) {
    if (vec.kind === "role_charter") {
      const res = validateRoleCharter(vec.input, {
        verifySignature: vec.verify_signature !== false,
      });
      assert.equal(
        res.valid,
        vec.expected.valid,
        `Vector ${vec.id} (${vec.description}) expected valid=${vec.expected.valid}, got errors=${JSON.stringify(res.errors)}`
      );
      if (!vec.expected.valid && vec.expected.error_code) {
        assert.ok(
          res.errors.some((e) => e.code === vec.expected.error_code),
          `Vector ${vec.id} expected error_code=${vec.expected.error_code}, got ${JSON.stringify(res.errors)}`
        );
      }
    } else if (vec.kind === "manager_delegation") {
      const res = validateManagerDelegation(vec.charter, vec.input);
      assert.equal(
        res.valid,
        vec.expected.valid,
        `Vector ${vec.id} expected valid=${vec.expected.valid}, got ${JSON.stringify(res.errors)}`
      );
      if (!vec.expected.valid && vec.expected.error_code) {
        assert.ok(
          res.errors.some((e) => e.code === vec.expected.error_code),
          `Vector ${vec.id} expected error_code=${vec.expected.error_code}, got ${JSON.stringify(res.errors)}`
        );
      }
    } else if (vec.kind === "ownership_transfer") {
      const res = applyOwnershipTransfer(vec.current_charter, vec.input, {
        verifySignatures: vec.verify_signatures !== false,
        nextOwnerSignerId: vec.next_owner_signer_id,
        nextOwnerPrivateKeySeedHex: vec.next_owner_seed_hex,
      });
      assert.equal(
        res.valid,
        vec.expected.valid,
        `Vector ${vec.id} expected valid=${vec.expected.valid}, got ${JSON.stringify(res.errors)}`
      );
      if (vec.expected.valid && Array.isArray(vec.expected.resulting_managers)) {
        assert.deepEqual(res.nextCharter.managers, vec.expected.resulting_managers);
      }
      if (!vec.expected.valid && vec.expected.error_code) {
        assert.ok(
          res.errors.some((e) => e.code === vec.expected.error_code),
          `Vector ${vec.id} expected error_code=${vec.expected.error_code}, got ${JSON.stringify(res.errors)}`
        );
      }
    } else if (vec.kind === "cofacts_l1") {
      const report = runCoFactsL1Check(vec.input);
      assert.equal(report.conformance, vec.expected.conformance, `Vector ${vec.id} failed`);
      if (vec.expected.error_code) {
        assert.ok(
          report.errors.some((e) => e.code === vec.expected.error_code),
          `Vector ${vec.id} expected error_code=${vec.expected.error_code}, got ${JSON.stringify(report.errors)}`
        );
      }
    } else {
      assert.fail(`Unknown vector kind: ${vec.kind} in ${vec.id}`);
    }
  }
});
