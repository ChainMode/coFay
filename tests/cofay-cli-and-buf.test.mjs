import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
  ROLE_ARCHETYPES,
  BUF_MAGIC,
  encodeCanonicalCbor,
  decodeCanonicalCbor,
  createSeatCharter,
  createSeatBundle,
  rotateSteward,
  executeDualSignedTransfer,
  packCoFayBuf,
  inspectCoFayBuf,
  generateBase32Id,
} from "../src/cofay-charter.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_PATH = path.resolve(__dirname, "..", "bin", "cofay.mjs");

const SEED_A = "11".repeat(32);
const SEED_B = "22".repeat(32);
const SEED_C = "33".repeat(32);

test("Seat Wizard creates valid signed RoleCharter 1.0 + BUF\\0 v1 across all 3 archetypes", () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "cofay-test-archetypes-"));
  try {
    for (const archetype of ROLE_ARCHETYPES) {
      const outDir = path.join(tmpRoot, archetype);
      const bundle = createSeatBundle({
        roleArchetype: archetype,
        ownerType: "organization",
        ownerId: `org_${archetype.replace(/_/g, "-")}`,
        stewardHumanId: generateBase32Id("hid_", `steward:${archetype}`),
        managers: [generateBase32Id("ifay_", `mgr:${archetype}`)],
        privateKeySeedHex: SEED_A,
        issuedAt: "2026-11-20T00:00:00Z",
        outDir,
      });

      assert.equal(bundle.valid, true, JSON.stringify(bundle.errors));
      assert.equal(bundle.charter.role_archetype, archetype);
      assert.equal(bundle.cofactsReport.conformance, "PASS");
      assert.ok(fs.existsSync(bundle.files.charterPath));
      assert.ok(fs.existsSync(bundle.files.manifestPath));
      assert.ok(fs.existsSync(bundle.files.bufPath));

      const bufBytes = fs.readFileSync(bundle.files.bufPath);
      assert.equal(bufBytes.subarray(0, 4).equals(BUF_MAGIC), true);
      const inspected = inspectCoFayBuf(bufBytes);
      assert.equal(inspected.valid, true, JSON.stringify(inspected.errors));
      assert.equal(inspected.charter.cofay_id, bundle.charter.cofay_id);
      assert.equal(inspected.fayManifest.controlMode, "command");
      assert.equal(inspected.fayManifest.ego, undefined);
    }
  } finally {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
});

test("Seat Wizard strictly enforces COFAY_EGO_FORBIDDEN, OWNER_TYPE_FORBIDDEN, and ORG_STEWARD_REQUIRED", () => {
  const withEgo = createSeatCharter({
    roleArchetype: "org_service",
    ego: "@ego-models/personal-clone@1.0.0",
    privateKeySeedHex: SEED_A,
  });
  assert.equal(withEgo.valid, false);
  assert.ok(withEgo.errors.some((e) => e.code === "COFAY_EGO_FORBIDDEN"));

  const nestedIfayOwner = createSeatCharter({
    roleArchetype: "functional_post",
    ownerType: "human",
    ownerId: "ifay_m2n4p6q7r2s4t6v5w2x4y6z2a4",
    privateKeySeedHex: SEED_A,
  });
  assert.equal(nestedIfayOwner.valid, false);
  assert.ok(nestedIfayOwner.errors.some((e) => e.code === "OWNER_TYPE_FORBIDDEN"));

  const missingOrgSteward = createSeatCharter({
    roleArchetype: "project_collaborator",
    ownerType: "organization",
    ownerId: "org_research-alliance",
    stewardHumanId: null,
    privateKeySeedHex: SEED_A,
  });
  assert.equal(missingOrgSteward.valid, false);
  assert.ok(missingOrgSteward.errors.some((e) => e.code === "ORG_STEWARD_REQUIRED"));
});

test("Steward rotation (charter_revision + 1) and dual-signed transfer preserve cofay_id & MeritPocket without haircut", () => {
  const created = createSeatCharter({
    roleArchetype: "functional_post",
    ownerType: "organization",
    ownerId: "org_merit-council",
    stewardHumanId: generateBase32Id("hid_", "steward-1"),
    managers: [generateBase32Id("ifay_", "manager-1")],
    privateKeySeedHex: SEED_A,
    issuedAt: "2026-11-20T00:00:00Z",
  });
  assert.equal(created.valid, true);

  // Reject non-human steward during rotation
  const badRot = rotateSteward(created.charter, {
    newStewardHumanId: "ifay_m2n4p6q7r2s4t6v5w2x4y6z2a4",
    privateKeySeedHex: SEED_B,
  });
  assert.equal(badRot.valid, false);
  assert.ok(badRot.errors.some((e) => e.code === "STEWARD_MUST_BE_HUMAN"));

  const steward2 = generateBase32Id("hid_", "steward-2");
  const rotated = rotateSteward(created.charter, {
    newStewardHumanId: steward2,
    privateKeySeedHex: SEED_B,
    issuedAt: "2026-11-20T01:00:00Z",
  });
  assert.equal(rotated.valid, true, JSON.stringify(rotated.errors));
  assert.equal(rotated.nextCharter.charter_revision, 2);
  assert.equal(rotated.nextCharter.cofay_id, created.charter.cofay_id);
  assert.equal(
    rotated.nextCharter.audit_policy.gmc_merit_pocket_ref,
    created.charter.audit_policy.gmc_merit_pocket_ref
  );
  assert.equal(rotated.meritContinuity.inheritance_haircut, "0%");

  // Dual-signed ownership transfer to a human owner
  const incomingHuman = generateBase32Id("hid_", "incoming-human-owner");
  const transferred = executeDualSignedTransfer(rotated.nextCharter, {
    toOwner: { type: "human", id: incomingHuman },
    managerPolicy: "CLEAR_ALL",
    fromPrivateKeySeedHex: SEED_B,
    toPrivateKeySeedHex: SEED_C,
    initiatedAt: "2026-11-20T02:00:00Z",
    expiresAt: "2026-11-21T02:00:00Z",
  });
  assert.equal(transferred.valid, true, JSON.stringify(transferred.errors));
  assert.equal(transferred.nextCharter.cofay_id, created.charter.cofay_id);
  assert.equal(transferred.nextCharter.charter_revision, 3);
  assert.equal(transferred.nextCharter.transfer_nonce, 1);
  assert.deepEqual(transferred.nextCharter.managers, []);
  assert.equal(transferred.nextCharter.steward_human_id, undefined);
  assert.equal(
    transferred.nextCharter.audit_policy.gmc_merit_pocket_ref,
    created.charter.audit_policy.gmc_merit_pocket_ref
  );
});

test("Canonical CBOR & BUF\\0 v1 integrity catches CRC-32 and section tampering", () => {
  const encoded = encodeCanonicalCbor({ z: 2, a: [0, 23, 24, 256, -1, -100], flag: true });
  const decoded = decodeCanonicalCbor(encoded);
  assert.deepEqual(decoded, { a: [0, 23, 24, 256, -1, -100], flag: true, z: 2 });

  const { charter } = createSeatCharter({
    roleArchetype: "org_service",
    privateKeySeedHex: SEED_A,
  });
  const packed = packCoFayBuf(charter);
  const tampered = Buffer.from(packed.bytes);
  // Flip one byte in the middle of sections payload
  tampered[Math.floor(tampered.length / 2)] ^= 0xff;

  const res = inspectCoFayBuf(tampered);
  assert.equal(res.valid, false);
  assert.ok(
    res.errors.some(
      (e) => e.code === "BUF_CRC32_MISMATCH" || e.code === "BUF_SECTION_DIGEST_MISMATCH"
    )
  );
});

test("CLI end-to-end: create -> rotate-steward -> transfer -> pack-buf -> verify -> demo", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "cofay-cli-e2e-"));
  try {
    const seatDir = path.join(tmpDir, "seat");
    const createOut = JSON.parse(
      execFileSync(
        process.execPath,
        [
          CLI_PATH,
          "create",
          "--archetype",
          "org_service",
          "--name",
          "Public Intake Seat",
          "--owner-type",
          "organization",
          "--owner-id",
          "org_intake-dept",
          "--steward-id",
          "hid_a3d5f7g4j2k4m6n5p2q4r6s7t2",
          "--seed-hex",
          SEED_A,
          "--out-dir",
          seatDir,
        ],
        { encoding: "utf8" }
      )
    );
    assert.equal(createOut.ok, true);
    assert.equal(createOut.cofacts_conformance, "PASS");

    const charterPath = path.join(seatDir, "role-charter.json");
    const rotOut = JSON.parse(
      execFileSync(
        process.execPath,
        [
          CLI_PATH,
          "rotate-steward",
          "--charter",
          charterPath,
          "--new-steward",
          "hid_b4f6g7h2j4k6m7n2p4q6r7s2t4",
          "--seed-hex",
          SEED_B,
          "--out",
          charterPath,
        ],
        { encoding: "utf8" }
      )
    );
    assert.equal(rotOut.ok, true);
    assert.equal(rotOut.charter_revision, 2);

    const xferOut = JSON.parse(
      execFileSync(
        process.execPath,
        [
          CLI_PATH,
          "transfer",
          "--charter",
          charterPath,
          "--to-owner-type",
          "organization",
          "--to-owner-id",
          "org_city-digital-commons",
          "--new-steward",
          "hid_c5g7h2j4k6m7n2p4q6r7s2t4v6",
          "--from-seed-hex",
          SEED_B,
          "--to-seed-hex",
          SEED_C,
          "--out",
          charterPath,
        ],
        { encoding: "utf8" }
      )
    );
    assert.equal(xferOut.ok, true);
    assert.equal(xferOut.charter_revision, 3);
    assert.equal(xferOut.transfer_nonce, 1);

    const bufPath = path.join(seatDir, "transferred.buf");
    const packOut = JSON.parse(
      execFileSync(
        process.execPath,
        [CLI_PATH, "pack-buf", "--charter", charterPath, "--out", bufPath],
        { encoding: "utf8" }
      )
    );
    assert.equal(packOut.ok, true);

    const verifyOut = JSON.parse(
      execFileSync(process.execPath, [CLI_PATH, "verify", bufPath], {
        encoding: "utf8",
      })
    );
    assert.equal(verifyOut.conformance, "PASS");
    assert.equal(verifyOut.buf_integrity_valid, true);

    const demoOut = JSON.parse(
      execFileSync(
        process.execPath,
        [CLI_PATH, "demo", "--out-dir", path.join(tmpDir, "demo")],
        { encoding: "utf8" }
      )
    );
    assert.equal(demoOut.demo, "ok");
    assert.equal(demoOut.created_archetypes.length, 3);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
