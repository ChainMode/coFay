# 02. Drei-Schichten-Architektur (ohne Ego-Schicht) und Rollencharta

## 2.1 Architektonischer Rückbau des Vier-Schichten-Stacks bei coFay

Die Dachspezifikation `ifay` definiert eine kanonische Vier-Schichten-Referenzarchitektur aus **Social Layer**, **Interaction Layer**, **Cognition Layer** und **Ego Layer**. Entlang dieser vier Schichten trennt eine scharfe strukturelle Grenze die beiden `Fay`-Gattungen: Während ein individueller `iFay` alle vier Schichten einbindet, **besteht ein `coFay` ausschließlich aus Social Layer, Interaction Layer und Cognition Layer – das Einbinden eines Ego Layer ist strikt untersagt**.

```text
┌───────────────────────────────────────────────────────────────────────┐
│  [ ENTFERNT / STRIKT VERBOTEN ] Ego Layer                             │
│  x Bildet niemals persönliches Persona-Gedächtnis nach                │
│  x Bindet niemals persönliche @ego-models/*-Pakete ein                │
├───────────────────────────────────────────────────────────────────────┤
│  Governance-Kappe: Normative RoleCharter 1.0 (Ed25519 + RFC 8785 JCS) │
│  + Leitauftrag        + SSP/CAP-Fähigkeitsgrenzen                     │
│  + Explizite Verbote  + Manipulationssichere Audit-Richtlinie         │
├───────────────────────────────────────────────────────────────────────┤
│  Schicht 3: Cognition Layer                                           │
│  - Fachliches Schließen und Workflow-Orchestrierung                   │
│  - Auswertung institutioneller Richtlinien und Skill-Routing          │
├───────────────────────────────────────────────────────────────────────┤
│  Schicht 2: Interaction Layer                                         │
│  - Strukturierter Dialog (ICP) und breitbandige Koordination (TP)     │
│  - Durch Charta begrenzte Endgeräte-Host-Steuerung via CAP und DTP    │
├───────────────────────────────────────────────────────────────────────┤
│  Schicht 1: Social Layer                                              │
│  - cofay_-Identität und Lebenszyklus der Nachweise                    │
│  - JWS-signierte SSP-Skill-Publikation und GMChain-MeritPocket-Anker  │
└───────────────────────────────────────────────────────────────────────┘
```

Warum darf ein `coFay` unter keinen Umständen eine Ego-Schicht besitzen? Dieses Verbot entspringt keiner technischen Beschränkung beim Laden feinabgestimmter Adapter, sondern drei unverhandelbaren Governance-Invarianten:

1. **Schutz vor anthropomorpher Täuschung der Öffentlichkeit**: Der einzige Zweck des Ego Layer (siehe `Ego`) besteht darin, Wertehierarchie, emotionale Tonlage und privates episodisches Gedächtnis eines konkreten **Human Prime** abzubilden. Würde das private Ego-Paket einer natürlichen Person in einen kommunalen Bürgerschalter oder eine gesetzliche Prüfstelle eingebunden, flössen private kognitive Verzerrungen in institutionelle Entscheidungen ein, während externe Aufrufer fälschlich annähmen, ein vertrauliches Gespräch mit genau dieser Einzelperson zu führen.
2. **Zustandslose Konsistenz über horizontale Replikate hinweg**: Öffentliche Rollenendpunkte verarbeiten regelmäßig Tausende gleichzeitiger Sitzungen. Stützten sich Worker-Instanzen auf eine Ego-Schicht mit subjektiver Drift oder lokalem Privatgedächtnis, kämen parallele Worker unter identischen institutionellen Regeln zu widersprüchlichen Entscheidungen. Durch den Verzicht auf die Ego-Schicht steuern dieselbe signierte `RoleCharter` und dieselbe Fachwissensbasis jedes Worker-Replikat deterministisch.
3. **Vermeidung privater Datenlecks beim Eigentümerwechsel**: Als institutionelles Rollen-Asset kann ein `coFay` auf einen neuen verantwortlichen Eigentümer übertragen werden. Blieben Fragmente des persönlichen Ego-Zustands eines früheren Stewards oder Operators in der Rollenlaufzeit zurück, würde ein Eigentümerwechsel unweigerlich hochsensible personenbezogene Daten offenlegen. Sobald der Validator daher auf ein verbotenes Replikationsfeld stößt (`ego_package`, `ego_model`, `ego_profile`, `human_prime_id` oder `personal_persona`), bricht die Prüfung sofort mit dem harten Fehlercode `COFAY_EGO_FORBIDDEN` ab.

---

## 2.2 Aufgabenteilung der drei aktiven Laufzeitschichten

Ohne Ego-Schicht arbeiten die verbleibenden drei Schichten auf ein einziges Ziel hin zusammen: die verlässliche Ausführung der öffentlichen `RoleCharter`.

### 1. Social Layer: Öffentliche Identität, kryptografische Nachweise und Servicefassade
Der Social Layer verwaltet die überprüfbare Netzwerkidentität sowie die externen Leistungsverträge des `coFay`:

- Schützt die kanonische Kennung `cofay_<base32>` samt den zugehörigen Holder-of-Key-Verifikationsnachweisen (siehe `FayID`).
- Veröffentlicht mit dem `cofay_`-Schlüssel signierte JWS-Skill-Deskriptoren über das **Skill Sharing Protocol** (`SSP`; siehe `Skill-Sharing-Protocol`) und gliedert bereitgestellte Endpunkte in drei Sichtbarkeitsstufen: `public` (offene, nicht authentifizierte Abfragen), `restricted` (authentifizierte Partner- oder Bürgeraufrufe) und `private` (interne Verwaltungsoperationen).
- Hält die Ledger-Referenz (`gmc_merit_pocket_ref`) auf das 1:1 gebundene `MeritPocket` der Rolle auf der **Global Merit Chain** (`GMChain`), in dem die durch bestätigte Zusammenarbeit erworbenen, nicht-monetären **MeriToken** verbucht werden (siehe `Global-Merit-Chain`).

### 2. Interaction Layer: Multimodale Kommunikation und begrenzte Host-Steuerung
Der Interaction Layer standardisiert sowohl eingehende Kommunikationskanäle mit externen Aufrufern als auch ausgehende Steuerbefehle auf bewohnte **Hosts** (wobei `Host` ausschließlich Endgeräte-Hardware oder Softwareanwendungen bezeichnet):

- **Eingehende Protokollinteraktion**: Unterstützt kontextreiche, strukturierte Annotations-Workflows über das **Interactive Conversation Protocol** (`ICP`; siehe `Interactive-Conversation-Protocol`) sowie breitbandige Zielabstimmungen und Konsultationen zwischen `Fay`-Instanzen über das **Telepathy Protocol** (`TP`; siehe `Telepathy-Protocol`).
- **Ausgehende, strikt begrenzte Host-Steuerung**: Bedient eine öffentliche Rolle betriebliche Software-Warteschlangen, Umweltsensoren oder dedizierte Kiosk-Hosts, läuft jeder Befehl zwingend über das **Control Authority Protocol** (`CAP`) und das **Data Tunnel Protocol** (`DTP`) innerhalb der in `RoleCharter.allowed_capabilities.cap_bounds` deklarierten Grenzen (siehe `Control-Authority-Protocol` und `Data-Tunnel-Protocol`). Nicht aufgeführte Host-Ressourcen bleiben konstruktionsbedingt unerreichbar.

### 3. Cognition Layer: Charta-geprüftes Fachschließen und Skill-Orchestrierung
Der Cognition Layer bildet das fachliche Entscheidungszentrum des `coFay` und wird deklarativ in der Container-Laufzeit **FayGer** zusammengesetzt (siehe `FayGer`):

- Bindet rollenspezifische Regelwerke, Architekturindizes oder Standardarbeitsanweisungen (SOPs) ein.
- Schaltet vor jede externe Zusage und jeden Host-Befehl ein verbindliches **Charter Policy Gate**, das jede geplante Aktion gegen die Positivliste `allowed_capabilities` und die Verbotsliste `prohibited_actions` prüft. Berührt ein Schritt eine Verbotsregel oder überschreitet er `max_autonomy_tier` (etwa durch eine unumkehrbare Zustandsänderung bei `allow_irreversible_actions: false`), hält die Ausführung automatisch an und eskaliert den Vorgang an den verantwortlichen menschlichen Steward oder einen autorisierten `iFay`-Betriebsmanager.

---

## 2.3 `RoleCharter` 1.0: Die institutionelle Verfassung anstelle der Ego-Schicht

Während ein `Ego`-Modell für einen `iFay` beantwortet, *„Wessen persönliches Abbild bin ich und welche individuellen Maßstäbe vertrete ich?“*, beantwortet **`RoleCharter` 1.0** (normativer Schema-URI: `https://ifay.ai/schemas/cofay-role-charter-1.0.json`) für einen `coFay`: *„Welches öffentliche Mandat erfülle ich, wem gehöre ich, welche natürliche Person trägt die Verantwortung, welche Fähigkeiten darf ich ausüben und welche roten Linien darf ich niemals überschreiten?“*

Ein konformes `RoleCharter`-1.0-Dokument gliedert sich in fünf normative Strukturblöcke:

### (1) Block für Identitäts- und Revisionsmetadaten
- `schema_version`: Fest auf die zweigliedrige Zeichenkette `"1.0"` gesetzt.
- `charter_id` (`chr_<base32>`) und die strikt positive Ganzzahl `charter_revision`: Verankern jede Charta-Fassung versionssicher.
- `cofay_id` (`cofay_<base32>`), lesbarer Anzeigename `display_name` sowie `role_archetype` (einer der drei kanonischen öffentlichen Rollenarchetypen).
- `lifecycle_state`: Deklariert explizit `"ACTIVE"`, `"SUSPENDED_PENDING_SUCCESSION"` (Bestandssperre bis zur Nachfolgeregelung) oder `"REVOKED"` (dauerhaft stillgelegt).
- `transfer_nonce`: Startet bei `0` und erhöht sich ausschließlich bei jedem gültigen, doppelt signierten Eigentümerwechsel um genau `1`.

### (2) Block für Verantwortungsverankerung und orthogonale Delegation
- `owner`: Einschichtige Eigentümerreferenz vom Typ `human` (`hid_<base32>`) oder `organization` (`org_<slug|base32>`).
- `steward_human_id`: Verpflichtende Kennung eines natürlichen Stewards (`hid_<base32>`), sobald `owner.type === "organization"` gilt, damit organisatorische Verantwortung unmittelbar auf einen identifizierbaren Menschen durchgreift.
- `managers`: Null oder mehr orthogonale Betriebsdelegierte (`ifay_<base32>[]`).

### (3) Block für Leitauftrag, Fähigkeits-Positivliste und Verhaltensgrenzen
- `mission_statement`: Öffentlich einsehbare Beschreibung des institutionellen Zwecks und Leistungsumfangs.
- `allowed_capabilities.ssp_skills`: Einzeldeklarationen je Skill mit URI (`skill_ref`), Sichtbarkeitsstufe (`visibility`) und Authentifizierungsschranke (`require_caller_auth`). Als harte normative Regel **muss** jeder Skill mit `visibility` gleich `"restricted"` oder `"private"` zwingend `require_caller_auth: true` setzen (Verstöße schlagen sofort mit `SSP_AUTH_REQUIRED_FOR_NON_PUBLIC` fehl). So lässt sich kryptografische Aufruferauthentifizierung niemals durch bloßes Verstecken von Verzeichniseinträgen umgehen.
- `allowed_capabilities.cap_bounds`: Begrenzt zulässige CAP-Berechtigungsbereiche (`allowed_scopes`), die maximale Autonomiestufe (`assistive`, `delegated` oder `official_post`) sowie die Freigabe unumkehrbarer Eingriffe (`allow_irreversible_actions`).
- `prohibited_actions`: Nicht-leeres Array maschinenlesbarer Verbotsregeln.

### (4) Block für eigenständige lokale Revisionsrichtlinien (`audit_policy`)
- Legt die Mindestaufbewahrungsdauer (`retention_days`), den manipulationssicheren Speichermodus (`hash_chain` oder `append_only`) und die verpflichtende Akteurszuordnung (`require_actor_trace: true`) fest.
- Verlangt für jeden ausgehenden Vertretungseintrag im Audit-Protokoll das kanonische Tripel `(cofay_id, owner_id, actor_signer_id)` und verbietet `acting_as_natural_person: true` strikt (`NATURAL_PERSON_IMPERSONATION_FORBIDDEN`). Damit bleibt die volle Beweiskraft auch in isolierten lokalen Netzen erhalten.

### (5) Eigentümersignatur nach RFC 8785 JCS + Ed25519 (`owner_signature`)
Damit Signaturprüfungen über Sprachgrenzen hinweg niemals an abweichender JSON-Schlüsselreihenfolge oder Leerzeichenformatierung scheitern, schreibt `RoleCharter` 1.0 ein deterministisches Signaturverfahren vor: Der Unterzeichner serialisiert die Charta-Nutzlast (ohne das Feld `owner_signature`) nach **RFC 8785 JSON Canonicalization Scheme (JCS)** in kanonische UTF-8-Bytes, stellt das explizite Domain-Separation-Präfix `"ifay.cofay.role-charter.v1\0"` voran und signiert die Bytefolge mit dem privaten Ed25519-Schlüssel von `owner.id` beziehungsweise `steward_human_id`. Jede nachträgliche Änderung auch nur eines einzigen Zeichens löst deterministisch `CHARTER_SIGNATURE_INVALID` aus.
