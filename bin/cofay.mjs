#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import {
  ROLE_ARCHETYPES,
  computeCharterDigestHex,
  runCoFactsL1Check,
} from "../src/cofay-charter.mjs";
import { packCoFayBuf, inspectCoFayBuf } from "../src/cofay-buf.mjs";
import {
  createSeatBundle,
  rotateSteward,
  executeDualSignedTransfer,
  generateBase32Id,
  generateEd25519SeedHex,
} from "../src/cofay-seat-wizard.mjs";

const USAGE = `coFay Toolkit & coFACTS L1 Validator CLI (@ifay/cofay v1.1.0)

Usage:
  cofay <command> [options]

Commands:
  create           Create a signed coFay public-role seat bundle (RoleCharter 1.0 + BUF\\0 v1)
  rotate-steward   Rotate natural-person steward (charter_revision + 1, continuous MeritPocket)
  transfer         Execute dual-signed atomic ownership transfer (TransferEnvelope 1.0)
  pack-buf         Emit a standards-compliant FayGer BUF\\0 v1 seat artifact (.buf)
  inspect-buf      Inspect and cryptographically verify a BUF\\0 v1 seat artifact (.buf)
  verify           Run coFACTS L1 conformance verification on JSON, bundle dir, or .buf
  demo             Run deterministic end-to-end 3-archetype + rotation + transfer + BUF\\0 demo

Examples:
  cofay create --archetype org_service --name "Civic Permit Desk" --owner-type organization --owner-id org_civic-bureau --out-dir ./my-seat
  cofay rotate-steward --charter ./my-seat/role-charter.json --new-steward hid_b2c3d4e5f6g7h2j3k4m5n6p7q2 --out ./my-seat/role-charter.json
  cofay transfer --charter ./my-seat/role-charter.json --to-owner-type organization --to-owner-id org_metro-agency --new-steward hid_z4y6x7w6v5t4s3r2q7p6n5m4k3 --from-seed-hex <64-hex> --to-seed-hex <64-hex> --out ./my-seat/role-charter.json
  cofay pack-buf --charter ./my-seat/role-charter.json --out ./my-seat/seat.buf
  cofay verify ./my-seat/seat.buf
  cofay demo
`;

function parseFlags(argv) {
  const positionals = [];
  const flags = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const eqIdx = arg.indexOf("=");
      if (eqIdx !== -1) {
        flags[arg.slice(2, eqIdx)] = arg.slice(eqIdx + 1);
      } else {
        const key = arg.slice(2);
        const next = argv[i + 1];
        if (next !== undefined && !next.startsWith("--")) {
          flags[key] = next;
          i += 1;
        } else {
          flags[key] = true;
        }
      }
    } else if (arg === "-h") {
      flags.help = true;
    } else {
      positionals.push(arg);
    }
  }
  return { positionals, flags };
}

function loadCharterFromTarget(targetPath) {
  const resolved = path.resolve(targetPath);
  const stat = fs.statSync(resolved);
  if (stat.isDirectory()) {
    const candidate = path.join(resolved, "role-charter.json");
    return JSON.parse(fs.readFileSync(candidate, "utf8"));
  }
  return JSON.parse(fs.readFileSync(resolved, "utf8"));
}

async function promptCreateOptionsIfInteractive(flags) {
  if (!flags.interactive || !input.isTTY) {
    return flags;
  }
  const rl = readline.createInterface({ input, output });
  try {
    const archetype =
      (
        await rl.question(
          `Role archetype (${ROLE_ARCHETYPES.join(" | ")}) [${flags.archetype || "org_service"}]: `
        )
      ).trim() ||
      flags.archetype ||
      "org_service";
    const name =
      (await rl.question(`Seat display name [${flags.name || "Public Service Desk"}]: `)).trim() ||
      flags.name ||
      "Public Service Desk";
    const ownerType =
      (
        await rl.question(
          `Single-layer owner type (organization | human) [${flags["owner-type"] || "organization"}]: `
        )
      ).trim() ||
      flags["owner-type"] ||
      "organization";
    const defaultOwnerId =
      ownerType === "organization"
        ? "org_open-civic-commons"
        : generateBase32Id("hid_", `interactive:${name}`);
    const ownerId =
      (await rl.question(`Owner ID [${flags["owner-id"] || defaultOwnerId}]: `)).trim() ||
      flags["owner-id"] ||
      defaultOwnerId;
    let stewardId = flags["steward-id"];
    if (ownerType === "organization") {
      const defSteward = stewardId || generateBase32Id("hid_", `steward:${ownerId}`);
      stewardId =
        (await rl.question(`Accountable natural-person steward HumanID [${defSteward}]: `)).trim() ||
        defSteward;
    }
    const outDir =
      (await rl.question(`Output bundle directory [${flags["out-dir"] || "./cofay-seat"}]: `)).trim() ||
      flags["out-dir"] ||
      "./cofay-seat";

    return {
      ...flags,
      archetype,
      name,
      "owner-type": ownerType,
      "owner-id": ownerId,
      ...(stewardId ? { "steward-id": stewardId } : {}),
      "out-dir": outDir,
    };
  } finally {
    rl.close();
  }
}

async function handleCreate(rawFlags) {
  const flags = await promptCreateOptionsIfInteractive(rawFlags);
  const managers =
    typeof flags.managers === "string" && flags.managers.trim()
      ? flags.managers
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
  const capabilities =
    typeof flags.capabilities === "string" && flags.capabilities.trim()
      ? flags.capabilities
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;

  let stewardHumanId;
  if (flags["no-steward"] === true) {
    stewardHumanId = null;
  } else if (typeof flags["steward-id"] === "string") {
    stewardHumanId = flags["steward-id"];
  }

  const bundle = createSeatBundle({
    roleArchetype: typeof flags.archetype === "string" ? flags.archetype : "org_service",
    displayName: typeof flags.name === "string" ? flags.name : undefined,
    ownerType: typeof flags["owner-type"] === "string" ? flags["owner-type"] : "organization",
    ownerId: typeof flags["owner-id"] === "string" ? flags["owner-id"] : undefined,
    stewardHumanId,
    managers,
    missionStatement: typeof flags.mission === "string" ? flags.mission : undefined,
    privateKeySeedHex: typeof flags["seed-hex"] === "string" ? flags["seed-hex"] : undefined,
    cofayId: typeof flags["cofay-id"] === "string" ? flags["cofay-id"] : undefined,
    ego: flags.ego,
    capabilities,
    packBuf: flags["no-buf"] !== true,
    outDir: typeof flags["out-dir"] === "string" ? flags["out-dir"] : undefined,
    issuedAt: typeof flags["issued-at"] === "string" ? flags["issued-at"] : undefined,
  });

  if (!bundle.valid) {
    const outPayload = { valid: false, errors: bundle.errors };
    console.error(JSON.stringify(outPayload, null, 2));
    process.exitCode = 1;
    return;
  }

  const summary = {
    ok: true,
    command: "create",
    cofay_id: bundle.charter.cofay_id,
    role_archetype: bundle.charter.role_archetype,
    owner: bundle.charter.owner,
    steward_human_id: bundle.charter.steward_human_id || null,
    merit_pocket_ref: bundle.charter.audit_policy.gmc_merit_pocket_ref,
    charter_revision: bundle.charter.charter_revision,
    cofacts_conformance: bundle.cofactsReport.conformance,
    buf_bytes: bundle.bufArtifact ? bundle.bufArtifact.totalLength : null,
    files: bundle.files,
  };
  console.log(JSON.stringify(summary, null, 2));
}

function handleRotateSteward(flags) {
  const charterInput = flags.charter;
  if (typeof charterInput !== "string") {
    throw new Error("Missing required --charter <role-charter.json>");
  }
  const currentCharter = loadCharterFromTarget(charterInput);
  const seedHex =
    typeof flags["seed-hex"] === "string" ? flags["seed-hex"] : generateEd25519SeedHex();
  const managers =
    typeof flags.managers === "string"
      ? flags.managers
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;

  const res = rotateSteward(currentCharter, {
    newStewardHumanId: typeof flags["new-steward"] === "string" ? flags["new-steward"] : undefined,
    signerId: typeof flags["signer-id"] === "string" ? flags["signer-id"] : undefined,
    privateKeySeedHex: seedHex,
    managers,
    issuedAt: typeof flags["issued-at"] === "string" ? flags["issued-at"] : undefined,
  });

  if (!res.valid) {
    console.error(JSON.stringify({ valid: false, errors: res.errors }, null, 2));
    process.exitCode = 1;
    return;
  }

  let outPath = null;
  if (typeof flags.out === "string") {
    outPath = path.resolve(flags.out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, `${JSON.stringify(res.nextCharter, null, 2)}\n`, "utf8");
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        command: "rotate-steward",
        cofay_id: res.nextCharter.cofay_id,
        charter_revision: res.nextCharter.charter_revision,
        new_steward_human_id: res.nextCharter.steward_human_id,
        merit_continuity: res.meritContinuity,
        out: outPath,
      },
      null,
      2
    )
  );
}

function handleTransfer(flags) {
  const charterInput = flags.charter;
  if (typeof charterInput !== "string") {
    throw new Error("Missing required --charter <role-charter.json>");
  }
  const currentCharter = loadCharterFromTarget(charterInput);
  const toOwnerType =
    typeof flags["to-owner-type"] === "string" ? flags["to-owner-type"] : "organization";
  const toOwnerId = flags["to-owner-id"];
  if (typeof toOwnerId !== "string") {
    throw new Error("Missing required --to-owner-id <hid_...|org_...>");
  }

  const fromSeedHex =
    typeof flags["from-seed-hex"] === "string"
      ? flags["from-seed-hex"]
      : generateEd25519SeedHex();
  const toSeedHex =
    typeof flags["to-seed-hex"] === "string" ? flags["to-seed-hex"] : generateEd25519SeedHex();

  const ratifiedManagers =
    typeof flags["ratified-managers"] === "string" && flags["ratified-managers"].trim()
      ? flags["ratified-managers"]
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

  const res = executeDualSignedTransfer(currentCharter, {
    toOwner: { type: toOwnerType, id: toOwnerId },
    newStewardHumanId:
      typeof flags["new-steward"] === "string" ? flags["new-steward"] : undefined,
    managerPolicy:
      typeof flags["manager-policy"] === "string" ? flags["manager-policy"] : "CLEAR_ALL",
    ratifiedManagers,
    fromSignerId: typeof flags["from-signer-id"] === "string" ? flags["from-signer-id"] : undefined,
    fromPrivateKeySeedHex: fromSeedHex,
    toSignerId: typeof flags["to-signer-id"] === "string" ? flags["to-signer-id"] : undefined,
    toPrivateKeySeedHex: toSeedHex,
    initiatedAt: typeof flags["initiated-at"] === "string" ? flags["initiated-at"] : undefined,
    expiresAt: typeof flags["expires-at"] === "string" ? flags["expires-at"] : undefined,
  });

  if (!res.valid) {
    console.error(JSON.stringify({ valid: false, errors: res.errors }, null, 2));
    process.exitCode = 1;
    return;
  }

  let outPath = null;
  let envelopeOutPath = null;
  if (typeof flags.out === "string") {
    outPath = path.resolve(flags.out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, `${JSON.stringify(res.nextCharter, null, 2)}\n`, "utf8");
  }
  if (typeof flags["envelope-out"] === "string") {
    envelopeOutPath = path.resolve(flags["envelope-out"]);
    fs.mkdirSync(path.dirname(envelopeOutPath), { recursive: true });
    fs.writeFileSync(envelopeOutPath, `${JSON.stringify(res.envelope, null, 2)}\n`, "utf8");
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        command: "transfer",
        cofay_id: res.nextCharter.cofay_id,
        charter_revision: res.nextCharter.charter_revision,
        transfer_nonce: res.nextCharter.transfer_nonce,
        from_owner: res.envelope.from_owner,
        to_owner: res.nextCharter.owner,
        steward_human_id: res.nextCharter.steward_human_id || null,
        managers: res.nextCharter.managers,
        merit_continuity: res.meritContinuity,
        out: outPath,
        envelope_out: envelopeOutPath,
      },
      null,
      2
    )
  );
}

function handlePackBuf(flags, positionals) {
  const charterInput = flags.charter || positionals[0];
  if (typeof charterInput !== "string") {
    throw new Error("Usage: cofay pack-buf --charter <role-charter.json> --out <seat.buf>");
  }
  const outFile =
    typeof flags.out === "string" ? path.resolve(flags.out) : path.resolve("./seat.buf");
  const charter = loadCharterFromTarget(charterInput);
  const capabilities =
    typeof flags.capabilities === "string" && flags.capabilities.trim()
      ? flags.capabilities
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

  const artifact = packCoFayBuf(charter, { capabilities });
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, artifact.bytes);

  console.log(
    JSON.stringify(
      {
        ok: true,
        command: "pack-buf",
        out: outFile,
        cofay_id: charter.cofay_id,
        format: "BUF\\0 v1",
        total_bytes: artifact.totalLength,
        manifest_digest_hex: artifact.manifestDigestHex,
        crc32_hex: `0x${artifact.crc32.toString(16).padStart(8, "0")}`,
        charter_digest_hex: artifact.charterDigestHex,
        sections: artifact.bufManifest.sections.map((s) => s.id),
      },
      null,
      2
    )
  );
}

function handleInspectBuf(flags, positionals) {
  const target = flags.buf || positionals[0];
  if (typeof target !== "string") {
    throw new Error("Usage: cofay inspect-buf <seat.buf>");
  }
  const bytes = fs.readFileSync(path.resolve(target));
  const inspected = inspectCoFayBuf(bytes);
  if (!inspected.valid) {
    console.error(JSON.stringify(inspected, null, 2));
    process.exitCode = 1;
    return;
  }
  console.log(
    JSON.stringify(
      {
        ok: true,
        command: "inspect-buf",
        header: inspected.header,
        trailer: inspected.trailer,
        sections: inspected.sections,
        fay_id: inspected.soulMetadata?.fay_id || inspected.charter?.cofay_id,
        role_archetype: inspected.charter?.role_archetype || null,
        cofacts_conformance: inspected.cofactsReport?.conformance || null,
      },
      null,
      2
    )
  );
}

function handleVerify(flags, positionals) {
  const target = flags.target || flags.charter || positionals[0];
  if (typeof target !== "string") {
    throw new Error("Usage: cofay verify <role-charter.json | seat-dir | seat.buf>");
  }
  const resolved = path.resolve(target);
  const stat = fs.statSync(resolved);

  if (stat.isFile()) {
    const rawBytes = fs.readFileSync(resolved);
    if (rawBytes.length >= 4 && rawBytes.subarray(0, 4).equals(Buffer.from("BUF\0", "ascii"))) {
      const bufRes = inspectCoFayBuf(rawBytes);
      const report = bufRes.cofactsReport || {
        report_version: "cofacts-l1-report/1.0",
        suite: "coFACTS",
        level: "L1",
        target_id: bufRes.soulMetadata?.fay_id || "unknown",
        conformance: bufRes.valid ? "PASS" : "FAIL",
        checks: [],
        errors: bufRes.errors,
      };
      const combinedValid = bufRes.valid && report.conformance === "PASS";
      const outputReport = {
        ...report,
        artifact_type: "fayger-buf-v1",
        buf_integrity_valid: bufRes.valid,
        errors: bufRes.errors,
      };
      console.log(JSON.stringify(outputReport, null, 2));
      if (!combinedValid) {
        process.exitCode = 1;
      }
      return;
    }
  }

  const subject = loadCharterFromTarget(resolved);
  const report = runCoFactsL1Check(subject);
  console.log(JSON.stringify(report, null, 2));
  if (report.conformance !== "PASS") {
    process.exitCode = 1;
  }
}

function handleDemo(flags) {
  const demoRoot =
    typeof flags["out-dir"] === "string"
      ? path.resolve(flags["out-dir"])
      : fs.mkdtempSync(path.join(os.tmpdir(), "cofay-demo-"));

  const seedStewardA = "11".repeat(32);
  const seedStewardB = "22".repeat(32);
  const seedAgencySteward = "33".repeat(32);

  // 1. Create seat bundles across all 3 canonical archetypes
  const createdArchetypes = [];
  let primaryBundle = null;
  for (const archetype of ROLE_ARCHETYPES) {
    const subDir = path.join(demoRoot, archetype);
    const bundle = createSeatBundle({
      roleArchetype: archetype,
      ownerType: "organization",
      ownerId: `org_${archetype.replace(/_/g, "-")}-commons`,
      stewardHumanId: generateBase32Id("hid_", `demo-steward-a:${archetype}`),
      managers: [generateBase32Id("ifay_", `demo-mgr:${archetype}`)],
      privateKeySeedHex: seedStewardA,
      issuedAt: "2026-11-20T00:00:00Z",
      outDir: subDir,
    });
    if (!bundle.valid) {
      throw new Error(`Demo failed creating ${archetype}: ${JSON.stringify(bundle.errors)}`);
    }
    if (archetype === "org_service") {
      primaryBundle = bundle;
    }
    createdArchetypes.push({
      archetype,
      cofay_id: bundle.charter.cofay_id,
      merit_pocket_ref: bundle.charter.audit_policy.gmc_merit_pocket_ref,
      cofacts: bundle.cofactsReport.conformance,
      buf_bytes: bundle.bufArtifact.totalLength,
    });
  }

  // 2. Steward rotation (charter_revision: 1 -> 2)
  const newStewardB = generateBase32Id("hid_", "demo-steward-b:org_service");
  const rotated = rotateSteward(primaryBundle.charter, {
    newStewardHumanId: newStewardB,
    privateKeySeedHex: seedStewardB,
    issuedAt: "2026-11-20T01:00:00Z",
  });
  if (!rotated.valid) {
    throw new Error(`Demo steward rotation failed: ${JSON.stringify(rotated.errors)}`);
  }

  // 3. Atomic dual-signed ownership transfer (charter_revision: 2 -> 3, transfer_nonce: 0 -> 1)
  const incomingSteward = generateBase32Id("hid_", "demo-agency-steward:metro");
  const transferred = executeDualSignedTransfer(rotated.nextCharter, {
    toOwner: { type: "organization", id: "org_metro-public-digital-service" },
    newStewardHumanId: incomingSteward,
    managerPolicy: "CLEAR_ALL",
    fromPrivateKeySeedHex: seedStewardB,
    toPrivateKeySeedHex: seedAgencySteward,
    initiatedAt: "2026-11-20T02:00:00Z",
    expiresAt: "2026-11-21T02:00:00Z",
  });
  if (!transferred.valid) {
    throw new Error(`Demo ownership transfer failed: ${JSON.stringify(transferred.errors)}`);
  }

  // 4. Pack post-transfer RoleCharter into BUF\0 v1 & verify via coFACTS L1
  const postTransferBufPath = path.join(demoRoot, "transferred-seat.buf");
  const packed = packCoFayBuf(transferred.nextCharter);
  fs.writeFileSync(postTransferBufPath, packed.bytes);
  const inspected = inspectCoFayBuf(packed.bytes);
  if (!inspected.valid || inspected.cofactsReport?.conformance !== "PASS") {
    throw new Error("Demo post-transfer BUF\\0 verification failed.");
  }

  console.log(
    JSON.stringify(
      {
        demo: "ok",
        output_dir: demoRoot,
        created_archetypes: createdArchetypes,
        steward_rotation: {
          cofay_id: rotated.nextCharter.cofay_id,
          charter_revision: rotated.nextCharter.charter_revision,
          rotated_to_steward: rotated.nextCharter.steward_human_id,
        },
        dual_signed_transfer: {
          cofay_id: transferred.nextCharter.cofay_id,
          charter_revision: transferred.nextCharter.charter_revision,
          transfer_nonce: transferred.nextCharter.transfer_nonce,
          new_owner: transferred.nextCharter.owner,
          preserved_merit_pocket: transferred.nextCharter.audit_policy.gmc_merit_pocket_ref,
          inheritance_haircut: "0%",
          cleared_stale_managers: transferred.nextCharter.managers.length === 0,
          final_charter_digest_hex: computeCharterDigestHex(transferred.nextCharter),
        },
        fayger_buf_v1: {
          path: postTransferBufPath,
          total_bytes: packed.totalLength,
          manifest_digest_hex: packed.manifestDigestHex,
          cofacts_l1: inspected.cofactsReport.conformance,
        },
      },
      null,
      2
    )
  );
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0 || argv[0] === "--help" || argv[0] === "-h" || argv[0] === "help") {
    console.log(USAGE);
    return;
  }
  const command = argv[0];
  const { positionals, flags } = parseFlags(argv.slice(1));
  if (flags.help) {
    console.log(USAGE);
    return;
  }

  switch (command) {
    case "create":
      await handleCreate(flags);
      break;
    case "rotate-steward":
      handleRotateSteward(flags);
      break;
    case "transfer":
      handleTransfer(flags);
      break;
    case "pack-buf":
      handlePackBuf(flags, positionals);
      break;
    case "inspect-buf":
      handleInspectBuf(flags, positionals);
      break;
    case "verify":
      handleVerify(flags, positionals);
      break;
    case "demo":
      handleDemo(flags);
      break;
    default:
      console.error(`Unknown subcommand: ${command}\n\n${USAGE}`);
      process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(
    JSON.stringify(
      {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
        ...(err?.code ? { code: err.code } : {}),
      },
      null,
      2
    )
  );
  process.exitCode = 1;
});
