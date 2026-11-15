# Schnellstart: coFay verstehen und integrieren

Willkommen zur offiziellen Dokumentation und zum Referenz-Toolkit für **coFay** (**Common Fay**, die digitale Inkarnation öffentlicher Rollen). Innerhalb der grundlegenden binären Ontologie des **Fay**-Ökosystems, **`Fay = iFay + coFay`**, ist ein `iFay` (**Individual Fay**) ein persönlicher digitaler Avatar, der von einem einzelnen **Human Prime** abgeleitet wird und dauerhaft an dessen Werte und Präferenzen gebunden bleibt. Im Gegensatz dazu ist ein `coFay` eine **öffentlich adressierbare, funktionale soziale Rolleninkarnation, die durch eine normative `RoleCharter` definiert und gesteuert wird**.

Unabhängig davon, ob ein Human Prime über seinen gesteuerten `iFay` eine Serviceanfrage stellt oder ein anderer `Fay` organisationsübergreifend eine kollaborative Fähigkeit aufruft: Aufrufer müssen im Hintergrund niemals eine bestimmte natürliche Person als Operator kennen oder nachverfolgen. Allein über den stabilen öffentlichen Rollenendpunkt `cofay_<base32>` entsteht eine verlässliche, kryptografisch prüfbare und durchgehend revisionssichere Zusammenarbeit.

---

## 1. Das mentale Kernmodell in drei Minuten

Vier strukturelle und ethische Grenzen unterscheiden eine öffentliche Rolleninkarnation `coFay` grundlegend von einem individuellen `iFay`:

| Dimension | `iFay` (Individueller digitaler Avatar) | `coFay` (Öffentliche Rolleninkarnation) |
| :--- | :--- | :--- |
| **Ontologische Natur** | Digitale Erweiterung der Persönlichkeit, Präferenzen und Handlungsfähigkeit eines Human Prime | Übertragbares öffentliches Amt, institutioneller Serviceschalter oder kollaborative Arbeitseinheit |
| **Architekturschichten** | Social Layer + Interaction Layer + Cognition Layer + **Ego Layer** | **Social Layer + Interaction Layer + Cognition Layer (Ego Layer strikt verboten)** |
| **Eigentümerschaft und Transfer** | Dauerhaft 1:1 an einen einzigen Human Prime gebunden; niemals verkäuflich, handelbar oder übertragbar | Einschichtige Eigentümerschaft unter `HumanID` oder `OrganizationID`; unterstützt atomaren doppelt signierten Transfer |
| **Konformitätsprüfung** | Geprüft durch die Testsuite **iFACTS** | Ausschließlich geprüft durch das Konformitäts-Framework **coFACTS** |

> **Verbindliche Design-Richtlinie**: Im gesamten `Fay`-Ökosystem bezeichnet der Begriff **Host** ausschließlich ein bewohntes Endgerät (Hardware) oder eine Softwareanwendung, niemals einen Menschen. Die rechtliche und ethische Verantwortung für jeden `coFay` ist letztlich immer bei einer natürlichen Person verankert: entweder direkt bei der besitzenden `HumanID` oder – bei organisatorischer Eigentümerschaft – bei dem verpflichtend in `steward_human_id` eingetragenen natürlichen Steward.

---

## 2. Voraussetzungen und lokale Verifikation in einer Minute

Dieses Repository kommt ohne externe Laufzeitabhängigkeiten aus und enthält das normative JSON-Schema für `RoleCharter` 1.0, 20 positive und negative kryptografische Konformitäts-Testvektoren sowie den `coFACTS`-L1-Prüfer. Mit installiertem **Node.js 20+** lässt sich die gesamte Verifikationssuite lokal ausführen:

```bash
git clone https://github.com/ChainMode/coFay.git
cd coFay
npm test
```

Bei erfolgreichem Durchlauf prüft die automatisierte Testsuite nacheinander sieben normative Invarianten:

1. Bytegenaue Übereinstimmung zwischen `schemas/cofay-role-charter-1.0.json` und dem eingefrorenen Referenzspiegel unter `schema/2025-10-25/schema.json`.
2. Deterministische JSON-Serialisierung gemäß RFC 8785 JSON Canonicalization Scheme (JCS).
3. Erzeugung und manipulationssichere Prüfung von Ed25519-Signaturen über alle drei kanonischen öffentlichen Rollenarchetypen (`org_service`, `functional_post` und `project_collaborator`) hinweg.
4. Striktes Verbot einer Ego-Schicht (Blockieren jeglicher `ego_package`- oder persönlicher Persona-Einbindung), Durchsetzung einschichtiger Eigentümerschaft (Ablehnung verschachtelter `ifay_`- oder `cofay_`-Eigentümer) sowie verpflichtende Bindung eines natürlichen Stewards bei organisatorischen Eigentümern.
5. Orthogonale Single-Hop-Betriebsdelegation an `iFay`-Instanzen (Erteilen und Widerrufen durch Eigentümer oder Steward erlaubt, sekundäre Weiterdelegation durch aktive Manager strikt abgelehnt).
6. Atomarer, doppelt signierter Eigentümerwechsel (`TransferEnvelope` 1.0) mit erzwungener Bereinigung alter Manager oder expliziter Neuratifizierung, streng monoton steigendem Anti-Replay-Zähler `transfer_nonce` sowie lückenloser On-Chain-Bindung des `MeritPocket` auf der **Global Merit Chain** (`GMChain`).
7. Erzeugung maschinenlesbarer `coFACTS`-L1-Konformitätsberichte sowie deterministische Grenzablehnung, sobald ein `iFay`-Zielobjekt an `coFACTS` übergeben wird.

---

## 3. Erste eigene `RoleCharter` 1.0 erstellen und validieren

Jede produktive `coFay`-Instanz muss ein `RoleCharter`-1.0-Dokument mitführen, das per Ed25519 vom verantwortlichen einschichtigen Eigentümer – beziehungsweise bei organisatorischer Eigentümerschaft vom benannten natürlichen Steward – signiert wurde:

```js
import {
  signRoleCharter,
  validateRoleCharter,
  runCoFactsL1Check,
} from "@ifay/cofay";

const unsignedCharter = {
  schema_version: "1.0",
  charter_id: "chr_b4f2k7m5p3q6r4s2t4v6w3x2y4",
  charter_revision: 1,
  cofay_id: "cofay_c5g3m6n2q4r7s5t3v5w7x4y3z5",
  display_name: "Municipal Public Permit Intake Desk",
  role_archetype: "org_service",
  owner: {
    type: "organization",
    id: "org_civic-service-bureau",
  },
  steward_human_id: "hid_a3d5f7g4j2k4m6n5p2q4r6s7t2",
  managers: ["ifay_m2n4p6q7r2s4t6v5w2x4y6z2a4"],
  mission_statement:
    "Provide standardized municipal permit guidance, preliminary document verification, and application status inquiries on behalf of the Civic Service Bureau.",
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
    "Never impersonate any Human Prime or mount a personal Ego persona package.",
    "Never issue final administrative permit revocations without countersignature from the accountable human steward.",
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
};

const signedCharter = signRoleCharter(unsignedCharter, {
  signerId: unsignedCharter.steward_human_id,
  privateKeySeedHex:
    "0202020202020202020202020202020202020202020202020202020202020202",
});

console.log(validateRoleCharter(signedCharter)); // { valid: true, errors: [] }
console.log(runCoFactsL1Check(signedCharter).conformance); // "PASS"
```

---

## 4. Wegweiser durch den Architektur-Blueprint

Die sechs normativen Blueprint-Kapitel führen schrittweise durch das ontologische Fundament, die kryptografischen Governance-Verträge und das protokollübergreifende Integrationsmodell von `coFay`:

1. **[Kapitel 01: Überblick und Ontologie](./blueprint/01-Ueberblick-und-Ontologie.md)**: Untersucht die binäre gesellschaftliche Arbeitsteilung in `Fay = iFay + coFay` und zieht die ontologische Grenze zwischen übertragbaren institutionellen Rollen-Assets und nicht übertragbaren persönlichen Erweiterungen.
2. **[Kapitel 02: Drei-Schichten-Architektur und Rollencharta](./blueprint/02-Drei-Schichten-Architektur-und-Rollencharta.md)**: Erläutert, warum `coFay` die persönliche Ego-Schicht entfernt und seine Social-, Interaction- und Cognition-Schichten vollständig über `RoleCharter` 1.0 steuert.
3. **[Kapitel 03: Taxonomie öffentlicher Rollen und Szenarien](./blueprint/03-Taxonomie-oeffentlicher-Rollen-und-Szenarien.md)**: Beschreibt Fähigkeitsprofile und produktive Einsatzmuster der drei kanonischen Archetypen `org_service`, `functional_post` und `project_collaborator`.
4. **[Kapitel 04: Einschichtige Eigentümerschaft und Steward-Verantwortung](./blueprint/04-Einschichtige-Eigentuemerschaft-und-Steward-Verantwortung.md)**: Zeigt durchgehende Autoritätsketten, orthogonale Single-Hop-Betriebsdelegation und die Zurechnung auf natürliche Personen über `FayID`, `Faying 1.1`, `SSP`, `CAP` und `GMChain` hinweg.
5. **[Kapitel 05: Zustandslose Laufzeit, Merit-Kontinuität und Doppelsignatur-Transfer](./blueprint/05-Zustandslose-Laufzeit-Merit-Kontinuitaet-und-Doppelsignatur-Transfer.md)**: Verbindet horizontale Skalierung zustandsloser Worker mit kontinuierlicher `MeritPocket`-Zurechnung und spezifiziert atomare, doppelt signierte Eigentümerwechsel mittels `TransferEnvelope` 1.0.
6. **[Kapitel 06: coFACTS-Konformität und Roadmap](./blueprint/06-coFACTS-Konformitaet-und-Roadmap.md)**: Definiert das dreistufige `coFACTS`-Prüfmodell, die orthogonale Abgrenzung zu `iFACTS` sowie die vierphasige Ökosystem-Roadmap.
