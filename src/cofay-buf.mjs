import crypto from "node:crypto";
import {
  COFACTS_L1_REPORT_VERSION,
  validateRoleCharter,
  runCoFactsL1Check,
  computeCharterDigestHex,
} from "./cofay-charter.mjs";

export const BUF_MAGIC = Buffer.from("BUF\0", "ascii");
export const BUF_FORMAT_VERSION_V1 = 1;
export const BUF_HEADER_SIZE = 40;
export const BUF_TRAILER_SIZE = 44;
export const SOUL_PACKAGE_SCHEMA_VERSION = "fayger-soul-package/1.0";
export const TASK_IR_SCHEMA_VERSION = "fayger-task-ir/0.2";

// Precompute IEEE 802.3 CRC-32 lookup table (polynomial 0xEDB88320)
const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let k = 0; k < 8; k += 1) {
      c = (c & 1) !== 0 ? (0xedb88320 ^ (c >>> 1)) >>> 0 : (c >>> 1) >>> 0;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

/**
 * Computes IEEE CRC-32 unsigned 32-bit integer over a Buffer / Uint8Array.
 */
export function computeCrc32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = CRC32_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Computes SHA-256 raw 32-byte Buffer over bytes.
 */
export function sha256Buffer(bytes) {
  return crypto.createHash("sha256").update(bytes).digest();
}

// ============================================================================
// Minimal Zero-Dependency Canonical CBOR (RFC 8949 §4.2) Encoder & Decoder
// ============================================================================

function writeCborHead(major, value, chunks) {
  const initial = (major << 5) & 0xe0;
  const big = typeof value === "bigint" ? value : BigInt(value);
  if (big < 0n || big > 0xffffffffffffffffn) {
    throw new RangeError(`CBOR unsigned argument out of u64 range: ${String(value)}`);
  }
  if (big <= 23n) {
    chunks.push(Buffer.from([initial | Number(big)]));
  } else if (big <= 0xffn) {
    chunks.push(Buffer.from([initial | 0x18, Number(big)]));
  } else if (big <= 0xffffn) {
    const b = Buffer.alloc(3);
    b[0] = initial | 0x19;
    b.writeUInt16BE(Number(big), 1);
    chunks.push(b);
  } else if (big <= 0xffffffffn) {
    const b = Buffer.alloc(5);
    b[0] = initial | 0x1a;
    b.writeUInt32BE(Number(big), 1);
    chunks.push(b);
  } else {
    const b = Buffer.alloc(9);
    b[0] = initial | 0x1b;
    b.writeBigUInt64BE(big, 1);
    chunks.push(b);
  }
}

/**
 * Encodes a JS value into deterministic RFC 8949 §4.2 Canonical CBOR bytes
 * matching FayGer's `fayger-buf::canonical::canonical_encode` bit-for-bit:
 * - Shortest integer encoding (no floats permitted in BuF M0/v1)
 * - Definite-length strings, byte strings, arrays, and maps
 * - Map keys sorted strictly by canonical encoded key byte sequence
 * - Buffer / Uint8Array encoded as CBOR major type 2 (byte string)
 */
export function encodeCanonicalCbor(value) {
  const chunks = [];
  encodeValueInto(value, chunks);
  return Buffer.concat(chunks);
}

function encodeValueInto(value, chunks) {
  if (value === null) {
    chunks.push(Buffer.from([0xf6]));
    return;
  }
  if (typeof value === "boolean") {
    chunks.push(Buffer.from([value ? 0xf5 : 0xf4]));
    return;
  }
  if (typeof value === "number") {
    if (!Number.isInteger(value)) {
      throw new TypeError("BuF Canonical CBOR forbids floating-point numbers.");
    }
    if (value >= 0) {
      writeCborHead(0, BigInt(value), chunks);
    } else {
      writeCborHead(1, -1n - BigInt(value), chunks);
    }
    return;
  }
  if (typeof value === "bigint") {
    if (value >= 0n) {
      writeCborHead(0, value, chunks);
    } else {
      writeCborHead(1, -1n - value, chunks);
    }
    return;
  }
  if (Buffer.isBuffer(value) || value instanceof Uint8Array) {
    const buf = Buffer.isBuffer(value) ? value : Buffer.from(value);
    writeCborHead(2, buf.length, chunks);
    chunks.push(buf);
    return;
  }
  if (typeof value === "string") {
    const utf8 = Buffer.from(value, "utf8");
    writeCborHead(3, utf8.length, chunks);
    chunks.push(utf8);
    return;
  }
  if (Array.isArray(value)) {
    writeCborHead(4, value.length, chunks);
    for (const item of value) {
      encodeValueInto(item, chunks);
    }
    return;
  }
  if (typeof value === "object") {
    const entries = [];
    for (const [k, v] of Object.entries(value)) {
      if (v === undefined) continue;
      const kb = encodeCanonicalCbor(k);
      const vb = encodeCanonicalCbor(v);
      entries.push({ k, kb, vb });
    }
    entries.sort((a, b) => Buffer.compare(a.kb, b.kb));
    for (let i = 1; i < entries.length; i += 1) {
      if (Buffer.compare(entries[i - 1].kb, entries[i].kb) === 0) {
        throw new Error(`Duplicate canonical CBOR map key: ${entries[i].k}`);
      }
    }
    writeCborHead(5, entries.length, chunks);
    for (const entry of entries) {
      chunks.push(entry.kb, entry.vb);
    }
    return;
  }
  throw new TypeError(`Unsupported value in Canonical CBOR: ${typeof value}`);
}

/**
 * Decodes a definite-length Canonical CBOR buffer back into JS values
 * (Byte strings become Buffer; integer values within safe range become Number).
 */
export function decodeCanonicalCbor(buffer) {
  const buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  const state = { offset: 0 };
  const value = decodeItem(buf, state);
  if (state.offset !== buf.length) {
    throw new Error(`Trailing bytes after CBOR value at offset ${state.offset}/${buf.length}`);
  }
  // Verify canonical encoding via deterministic re-encode comparison
  const reencoded = encodeCanonicalCbor(value);
  if (!reencoded.equals(buf)) {
    throw new Error("Non-canonical CBOR encoding detected.");
  }
  return value;
}

function readCborArg(buf, state, info) {
  if (info <= 23) return BigInt(info);
  if (info === 24) {
    if (state.offset + 1 > buf.length) throw new Error("Truncated CBOR u8");
    const v = buf[state.offset];
    state.offset += 1;
    return BigInt(v);
  }
  if (info === 25) {
    if (state.offset + 2 > buf.length) throw new Error("Truncated CBOR u16");
    const v = buf.readUInt16BE(state.offset);
    state.offset += 2;
    return BigInt(v);
  }
  if (info === 26) {
    if (state.offset + 4 > buf.length) throw new Error("Truncated CBOR u32");
    const v = buf.readUInt32BE(state.offset);
    state.offset += 4;
    return BigInt(v);
  }
  if (info === 27) {
    if (state.offset + 8 > buf.length) throw new Error("Truncated CBOR u64");
    const v = buf.readBigUInt64BE(state.offset);
    state.offset += 8;
    return v;
  }
  if (info === 31) {
    throw new Error("Indefinite-length CBOR is forbidden in Canonical BuF.");
  }
  throw new Error(`Unsupported CBOR additional info: ${info}`);
}

function toSafeIntOrBigInt(big) {
  if (big >= BigInt(Number.MIN_SAFE_INTEGER) && big <= BigInt(Number.MAX_SAFE_INTEGER)) {
    return Number(big);
  }
  return big;
}

function decodeItem(buf, state) {
  if (state.offset >= buf.length) {
    throw new Error("Unexpected EOF while decoding CBOR");
  }
  const initial = buf[state.offset];
  state.offset += 1;
  const major = initial >>> 5;
  const info = initial & 0x1f;

  if (major === 0) {
    return toSafeIntOrBigInt(readCborArg(buf, state, info));
  }
  if (major === 1) {
    const v = readCborArg(buf, state, info);
    return toSafeIntOrBigInt(-1n - v);
  }
  if (major === 2) {
    const len = Number(readCborArg(buf, state, info));
    if (state.offset + len > buf.length) throw new Error("Truncated CBOR byte string");
    const out = Buffer.from(buf.subarray(state.offset, state.offset + len));
    state.offset += len;
    return out;
  }
  if (major === 3) {
    const len = Number(readCborArg(buf, state, info));
    if (state.offset + len > buf.length) throw new Error("Truncated CBOR text string");
    const out = buf.subarray(state.offset, state.offset + len).toString("utf8");
    state.offset += len;
    return out;
  }
  if (major === 4) {
    const len = Number(readCborArg(buf, state, info));
    const arr = new Array(len);
    for (let i = 0; i < len; i += 1) {
      arr[i] = decodeItem(buf, state);
    }
    return arr;
  }
  if (major === 5) {
    const len = Number(readCborArg(buf, state, info));
    const obj = {};
    for (let i = 0; i < len; i += 1) {
      const k = decodeItem(buf, state);
      if (typeof k !== "string") {
        throw new Error("BuF CBOR maps require text string keys.");
      }
      obj[k] = decodeItem(buf, state);
    }
    return obj;
  }
  if (major === 6) {
    throw new Error("CBOR tags are forbidden in Canonical BuF.");
  }
  if (major === 7) {
    if (info === 20) return false;
    if (info === 21) return true;
    if (info === 22) return null;
    if (info >= 25 && info <= 27) {
      throw new Error("CBOR floating-point values are forbidden in Canonical BuF.");
    }
    throw new Error(`Unsupported CBOR simple value: ${info}`);
  }
  throw new Error(`Unsupported CBOR major type: ${major}`);
}

// ============================================================================
// FayGer BUF\0 v1 Seat Artifact Builder & Inspector
// ============================================================================

function sanitizeManifestName(raw) {
  const cleaned = String(raw || "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "");
  return cleaned || "cofay-seat-package";
}

function mapCapabilitiesForFayger(charter, extraCapabilities = []) {
  const capSet = new Set(["fs.read", "net.http"]);
  const scopes = charter?.allowed_capabilities?.cap_bounds?.allowed_scopes;
  if (Array.isArray(scopes)) {
    for (const scope of scopes) {
      if (typeof scope === "string" && scope.trim()) {
        capSet.add(scope.trim());
      }
    }
  }
  for (const extra of extraCapabilities) {
    if (typeof extra === "string" && extra.trim()) {
      capSet.add(extra.trim());
    }
  }
  return Array.from(capSet).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

/**
 * Builds the embedded `FayManifest` JSON for a `coFay` seat.
 * Enforces `controlMode: "command"` and strictly omits any `ego` block (`COFAY_EGO_FORBIDDEN`).
 */
export function buildEmbeddedFayManifest(charter, requestedCapabilities) {
  const caps =
    Array.isArray(requestedCapabilities) && requestedCapabilities.length > 0
      ? requestedCapabilities
      : mapCapabilitiesForFayger(charter);

  return {
    name: sanitizeManifestName(charter.display_name),
    version: "1.0.0",
    description: `FayGer runnable cofay public role seat (${charter.cofay_id} · ${charter.role_archetype})`,
    vendor: "ifay-cofay-seat-wizard",
    fayId: charter.cofay_id,
    modules: [
      {
        id: "workspace_core",
        version: "^1.0.0",
      },
    ],
    protocols: [
      { id: "cap_protocol", version: "^1.0.0" },
      { id: "faying_protocol", version: "^1.0.0" },
      { id: "icp_protocol", version: "^1.0.0" },
      { id: "tp_protocol", version: "^1.0.0" },
      { id: "ssp_protocol", version: "^1.0.0" },
    ],
    controlMode: "command",
    drivers: [
      {
        name: "fayger_desktop_host",
        type: "host",
        driverPackage: "@cap-drivers/fayger-desktop-host",
      },
    ],
    permissions: {
      inherent: ["icp.reply"],
      persistent: caps,
      authMethods: ["fayid_mandate"],
    },
  };
}

/**
 * Packs a signed `RoleCharter 1.0` into a standards-compliant `FayGer` `BUF\0` v1
 * sealed binary seat artifact mountable by `fayger inspect` and `fayger up`.
 */
export function packCoFayBuf(charter, options = {}) {
  const validation = validateRoleCharter(charter, {
    verifySignature: options.verifySignature !== false,
  });
  if (!validation.valid) {
    const first = validation.errors[0];
    const err = new Error(
      `Cannot pack invalid RoleCharter into BUF\\0: [${first.code}] ${first.message}`
    );
    err.code = first.code;
    err.errors = validation.errors;
    throw err;
  }

  const requestedCapabilities = mapCapabilitiesForFayger(charter, options.capabilities || []);
  const stewardRef = charter.steward_human_id || charter.owner.id;
  const custodianCommitment =
    "sha256:" + crypto.createHash("sha256").update(String(stewardRef), "utf8").digest("hex");
  const charterDigestHex = computeCharterDigestHex(charter);

  // `soul_metadata` compatible with `fayger-cli/src/soul.rs` (`extract_soul_from_buf`)
  const soulMetadata = {
    schema_version: SOUL_PACKAGE_SCHEMA_VERSION,
    kind: "cofay",
    fay_id: charter.cofay_id,
    display_name: charter.display_name,
    public_key_hex:
      charter.owner_signature?.public_key_hex ||
      crypto.createHash("sha256").update(charter.cofay_id, "utf8").digest("hex"),
    requested_capabilities: requestedCapabilities,
    cofay_role_charter: {
      schema_version: "cofay-role-charter/1.0",
      cofay_id: charter.cofay_id,
      seat_name: charter.display_name,
      role_title: `${charter.display_name} (${charter.role_archetype})`,
      public_mandate_scope: charter.mission_statement,
      custodian_commitment: custodianCommitment,
      term_epoch: charter.charter_revision,
      dual_sig_handover_supported: true,
    },
  };

  const fayManifest = buildEmbeddedFayManifest(charter, requestedCapabilities);

  const taskProgram = {
    schema_version: TASK_IR_SCHEMA_VERSION,
    task_id: `boot-${charter.cofay_id}`,
    required_cells: [],
    steps: [
      {
        CryptoSha256: {
          utf8_payload: `soul-boot:cofay:${charter.cofay_id}`,
        },
      },
    ],
  };

  const rawSections = [
    {
      id: "code",
      kind: "code",
      payload: Buffer.from(JSON.stringify(taskProgram), "utf8"),
    },
    {
      id: "soul_metadata",
      kind: "data",
      payload: Buffer.from(JSON.stringify(soulMetadata, null, 2), "utf8"),
    },
    {
      id: "fay_manifest",
      kind: "data",
      payload: Buffer.from(JSON.stringify(fayManifest, null, 2), "utf8"),
    },
    {
      id: "cofay_charter",
      kind: "data",
      payload: Buffer.from(JSON.stringify(charter, null, 2), "utf8"),
    },
  ];

  const sectionDescriptors = [];
  const sectionIndexEntries = [];
  let currentOffset = 0;

  for (const sec of rawSections) {
    const digestBytes = sha256Buffer(sec.payload);
    // Rust serde serializes `Digest { algorithm: String, value: Vec<u8> }` as a CBOR array of u8 integers
    const digestObj = {
      algorithm: "sha256",
      value: Array.from(digestBytes),
    };
    sectionDescriptors.push({
      id: sec.id,
      kind: sec.kind,
      digest: digestObj,
      length: sec.payload.length,
      visibility: "required",
      profile_constraints: {},
    });
    sectionIndexEntries.push({
      section_id: sec.id,
      kind: sec.kind,
      offset: currentOffset,
      length: sec.payload.length,
      digest: digestObj,
      visibility: "required",
      profile_constraints: {},
    });
    currentOffset += sec.payload.length;
  }

  const bufManifest = {
    schema_version: "1.0.0",
    runtime_interface_min: "1.0.0",
    entry: "code",
    capabilities: requestedCapabilities,
    sections: sectionDescriptors,
    x_cofay_archetype: charter.role_archetype,
    x_cofay_charter_digest_hex: charterDigestHex,
    x_cofay_id: charter.cofay_id,
  };

  const manifestBytes = encodeCanonicalCbor(bufManifest);
  const sectionIndexBytes = encodeCanonicalCbor(sectionIndexEntries);

  const manifestOffset = BUF_HEADER_SIZE;
  const manifestLength = manifestBytes.length;
  const sectionIndexOffset = manifestOffset + manifestLength;
  const sectionIndexLength = sectionIndexBytes.length;
  const sectionsOffset = sectionIndexOffset + sectionIndexLength;
  const totalLength = sectionsOffset + currentOffset + BUF_TRAILER_SIZE;

  const headerBuf = Buffer.alloc(BUF_HEADER_SIZE);
  BUF_MAGIC.copy(headerBuf, 0);
  headerBuf.writeUInt32LE(BUF_FORMAT_VERSION_V1, 4);
  headerBuf.writeBigUInt64LE(BigInt(manifestOffset), 8);
  headerBuf.writeBigUInt64LE(BigInt(manifestLength), 16);
  headerBuf.writeBigUInt64LE(BigInt(sectionIndexOffset), 24);
  headerBuf.writeBigUInt64LE(BigInt(sectionIndexLength), 32);

  // `manifest_digest` covers `[0, sections_offset)` = Header || Manifest || Section_Index
  const skeletonBuf = Buffer.concat([headerBuf, manifestBytes, sectionIndexBytes]);
  const manifestDigest = sha256Buffer(skeletonBuf);

  const trailerWithoutCrc = Buffer.alloc(BUF_TRAILER_SIZE - 4);
  trailerWithoutCrc.writeBigUInt64LE(BigInt(totalLength), 0);
  manifestDigest.copy(trailerWithoutCrc, 8);

  const preCrcBytes = Buffer.concat([
    skeletonBuf,
    ...rawSections.map((s) => s.payload),
    trailerWithoutCrc,
  ]);
  const crc32 = computeCrc32(preCrcBytes);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32LE(crc32, 0);

  const bytes = Buffer.concat([preCrcBytes, crcBuf]);

  return {
    bytes,
    totalLength,
    manifestDigestHex: manifestDigest.toString("hex"),
    crc32,
    charterDigestHex,
    bufManifest,
    soulMetadata,
    fayManifest,
  };
}

/**
 * Parses and cryptographically verifies a `BUF\0` v1 seat artifact, checking:
 * 1. Magic `"BUF\0"`, `format_version == 1`, contiguous offsets, and `total_length`
 * 2. IEEE CRC-32 checksum over `[0, total - 4)`
 * 3. `manifest_digest` SHA-256 over `[0, sections_offset)`
 * 4. Every section's SHA-256 payload digest
 * 5. Embedded `cofay_charter` `coFACTS` L1 conformance (including `COFAY_EGO_FORBIDDEN`)
 */
export function inspectCoFayBuf(inputBytes, options = {}) {
  const buf = Buffer.isBuffer(inputBytes) ? inputBytes : Buffer.from(inputBytes);
  const errors = [];

  if (buf.length < BUF_HEADER_SIZE + BUF_TRAILER_SIZE) {
    return {
      valid: false,
      errors: [{ code: "BUF_TRUNCATED", message: "Buffer is shorter than Header + Trailer (84 bytes)." }],
    };
  }

  if (!buf.subarray(0, 4).equals(BUF_MAGIC)) {
    return {
      valid: false,
      errors: [{ code: "BUF_MAGIC_MISMATCH", message: "Leading 4 bytes do not match 'BUF\\0'." }],
    };
  }

  const formatVersion = buf.readUInt32LE(4);
  const manifestOffset = Number(buf.readBigUInt64LE(8));
  const manifestLength = Number(buf.readBigUInt64LE(16));
  const sectionIndexOffset = Number(buf.readBigUInt64LE(24));
  const sectionIndexLength = Number(buf.readBigUInt64LE(32));

  if (formatVersion !== BUF_FORMAT_VERSION_V1) {
    errors.push({
      code: "BUF_VERSION_UNSUPPORTED",
      message: `Expected format_version=1, got ${formatVersion}.`,
    });
  }

  if (
    manifestOffset !== BUF_HEADER_SIZE ||
    sectionIndexOffset !== manifestOffset + manifestLength
  ) {
    return {
      valid: false,
      errors: [
        ...errors,
        { code: "BUF_LAYOUT_INVALID", message: "Non-contiguous Header/Manifest/Section_Index offsets." },
      ],
    };
  }

  const sectionsOffset = sectionIndexOffset + sectionIndexLength;
  const trailerOffset = buf.length - BUF_TRAILER_SIZE;
  if (sectionsOffset > trailerOffset) {
    return {
      valid: false,
      errors: [
        ...errors,
        { code: "BUF_OFFSET_OUT_OF_BOUNDS", message: "Sections offset overlaps Trailer." },
      ],
    };
  }

  const totalLength = Number(buf.readBigUInt64LE(trailerOffset));
  const manifestDigest = buf.subarray(trailerOffset + 8, trailerOffset + 40);
  const expectedCrc32 = buf.readUInt32LE(trailerOffset + 40);

  if (totalLength !== buf.length) {
    errors.push({
      code: "BUF_TOTAL_LENGTH_MISMATCH",
      message: `Trailer total_length=${totalLength} disagrees with buffer length=${buf.length}.`,
    });
  }

  const actualCrc32 = computeCrc32(buf.subarray(0, trailerOffset + 40));
  if (actualCrc32 !== expectedCrc32) {
    errors.push({
      code: "BUF_CRC32_MISMATCH",
      message: `CRC-32 mismatch: expected 0x${expectedCrc32.toString(16)}, got 0x${actualCrc32.toString(16)}.`,
    });
  }

  const actualManifestDigest = sha256Buffer(buf.subarray(0, sectionsOffset));
  if (!actualManifestDigest.equals(manifestDigest)) {
    errors.push({
      code: "BUF_MANIFEST_DIGEST_MISMATCH",
      message: "SHA-256 manifest_digest mismatch over Header || Manifest || Section_Index.",
    });
  }

  let manifest;
  let sectionIndex;
  try {
    manifest = decodeCanonicalCbor(buf.subarray(manifestOffset, manifestOffset + manifestLength));
    sectionIndex = decodeCanonicalCbor(
      buf.subarray(sectionIndexOffset, sectionIndexOffset + sectionIndexLength)
    );
  } catch (err) {
    return {
      valid: false,
      errors: [
        ...errors,
        {
          code: "BUF_CBOR_INVALID",
          message: err instanceof Error ? err.message : String(err),
        },
      ],
    };
  }

  const sectionsRegion = buf.subarray(sectionsOffset, trailerOffset);
  const extractedSections = {};

  if (!Array.isArray(sectionIndex) || !Array.isArray(manifest?.sections)) {
    errors.push({
      code: "BUF_SECTION_INDEX_INVALID",
      message: "Manifest sections or Section_Index is not an array.",
    });
  } else {
    for (const entry of sectionIndex) {
      const slice = sectionsRegion.subarray(entry.offset, entry.offset + entry.length);
      const actualSecDigest = sha256Buffer(slice);
      const rawDigestVal = entry.digest?.value;
      const expectedSecDigest = Buffer.isBuffer(rawDigestVal)
        ? rawDigestVal
        : Array.isArray(rawDigestVal)
          ? Buffer.from(rawDigestVal)
          : null;
      if (!expectedSecDigest || !actualSecDigest.equals(expectedSecDigest)) {
        errors.push({
          code: "BUF_SECTION_DIGEST_MISMATCH",
          field: entry.section_id,
          message: `SHA-256 digest mismatch for section '${entry.section_id}'.`,
        });
      }
      extractedSections[entry.section_id] = slice;
    }
  }

  let soulMetadata = null;
  let fayManifest = null;
  let charter = null;
  let cofactsReport = null;

  if (extractedSections.soul_metadata) {
    try {
      soulMetadata = JSON.parse(extractedSections.soul_metadata.toString("utf8"));
    } catch {
      errors.push({ code: "SOUL_METADATA_INVALID_JSON", message: "Invalid soul_metadata JSON." });
    }
  }

  if (extractedSections.fay_manifest) {
    try {
      fayManifest = JSON.parse(extractedSections.fay_manifest.toString("utf8"));
      if (fayManifest.ego !== undefined && fayManifest.ego !== null) {
        errors.push({
          code: "COFAY_EGO_FORBIDDEN",
          field: "fay_manifest.ego",
          message: "Embedded fay_manifest in a coFay BUF artifact MUST NOT declare an ego model.",
        });
      }
    } catch {
      errors.push({ code: "FAY_MANIFEST_INVALID_JSON", message: "Invalid fay_manifest JSON." });
    }
  }

  if (extractedSections.cofay_charter) {
    try {
      charter = JSON.parse(extractedSections.cofay_charter.toString("utf8"));
      cofactsReport = runCoFactsL1Check(charter, {
        verifySignature: options.verifySignature !== false,
      });
      if (cofactsReport.conformance !== "PASS") {
        errors.push(...cofactsReport.errors);
      }
    } catch {
      errors.push({ code: "COFAY_CHARTER_INVALID_JSON", message: "Invalid cofay_charter JSON." });
    }
  } else if (soulMetadata?.kind === "ifay") {
    cofactsReport = {
      report_version: COFACTS_L1_REPORT_VERSION,
      suite: "coFACTS",
      level: "L1",
      target_id: soulMetadata.fay_id || "unknown",
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
    errors.push(...cofactsReport.errors);
  }

  return {
    valid: errors.length === 0,
    header: {
      magic: "BUF\\0",
      format_version: formatVersion,
      manifest_offset: manifestOffset,
      manifest_length: manifestLength,
      section_index_offset: sectionIndexOffset,
      section_index_length: sectionIndexLength,
    },
    trailer: {
      total_length: totalLength,
      manifest_digest_hex: manifestDigest.toString("hex"),
      crc32: expectedCrc32,
    },
    manifest,
    sections: Object.keys(extractedSections),
    soulMetadata,
    fayManifest,
    charter,
    cofactsReport,
    errors,
  };
}
