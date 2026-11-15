# 05. Zustandslose Laufzeitelastizität, Merit-Kontinuität und Doppelsignatur-Transfer

## 5.1 Auflösung des Grundkonflikts: Wie kurzlebige zustandslose Worker ein durchgängiges Beitragskonto tragen

Beim Entwurf einer öffentlichen Rolleninkarnation tritt zunächst ein scheinbarer Architekturwiderspruch zutage:

- **Aus Sicht hochverfügbarer verteilter Systeme**: Ein `coFay`, der im Netz öffentliche Skill-Aufrufe bedient, muss horizontales Autoscaling ohne lokalen Zustand, regionsübergreifendes Failover und laufenden Container-Austausch unterstützen. Das Beenden oder Ersetzen einzelner Worker-Prozesse darf aktive Aufrufer zu keinem Zeitpunkt beeinträchtigen.
- **Aus Sicht institutioneller Reputation**: Die **Global Merit Chain** (`GMChain`) bindet jede kanonische Kennung `cofay_<base32>` im Verhältnis 1:1 an ein eigenes `MeritPocket` (siehe `Global-Merit-Chain`), in dem sich über Jahre hinweg **MeriToken** (mit der kleinsten Einheit `μ` bzw. **Merit Unit**) und Governance-Stimmgewicht aus nachgewiesenen öffentlichen Leistungen ansammeln.

Wie können austauschbare, zustandslose Worker-Prozesse ein über Jahre hinweg lückenloses institutionelles Reputationskonto führen?

`coFay` löst dieses Spannungsfeld auf, indem **die Ausführungselastizität konsequent in die zustandslose Laufzeitebene verlagert wird, während Identität, Charta-Governance und Beitragszurechnung in der persistenten Identitäts- und Ledger-Ebene verankert bleiben**:

```text
                         ┌───────────────────────────────────────────────────┐
Identitäts- & Ledger-    │  Persistente Identität: cofay_orgservicedesk234567│
Ebene (kontinuierlicher, │  1:1 gebundenes Ledger: GMChain MeritPocket (mpk_)│
prüfbarer Zustand)       │  Governance-Anker:      RoleCharter 1.0 (JCS-Sig) │
                         └─────────────────────────┬─────────────────────────┘
                                                   │ Bindet identisch geprüfte Charta ein
                       ┌───────────────────────────┼───────────────────────────┐
                       ▼                           ▼                           ▼
Laufzeitebene      [FayGer Worker #1]        [FayGer Worker #2]        [FayGer Worker #N]
(zustandslose,     Kein Ego / skaliert       Kein Ego / laufender      Multi-Region-Failover /
elastische Worker) bei Bedarf                Hot-Austausch             Scale-to-Zero-fähig
```

1. **Zustandslose Laufzeitelastizität**: **FayGer**-Worker-Container für fachliches Schließen und Protokollauswertung speichern keinerlei lokales Persona-Gedächtnis, da sie keine Ego-Schicht besitzen. Beim Start bindet jedes Replikat die aktive, signaturgeprüfte `RoleCharter` 1.0 zusammen mit schreibgeschützten Fachwissenspaketen ein. Bei Lastspitzen skaliert eine Rolle binnen Sekunden auf Hunderte paralleler Replikate hoch und in Ruhephasen wieder bis auf null herunter.
2. **Einheitliche kryptografische Vertretungssignatur**: Zustandslose Worker geben niemals anonyme oder nicht zuordenbare Antworten aus. Stattdessen signieren sie ausgehende Quittungen und Ledger-Zurechnungen über HSM-geschützte oder schwellenwertverwaltete `cofay_`-Inhaberschlüssel (siehe `FayID`) beziehungsweise über delegierte Vertretungssignaturen autorisierter `managers: iFayID[]`.
3. **Merit gehört der Rolle, niemals dem Container**: Externe Aufrufer und Prüfende bewerten die Servicequalität der öffentlichen Rolle `cofay_`. Sämtliche daraus hervorgehenden, nicht-monetären `MeriToken`-Buchungen fließen direkt in das 1:1 an diese `cofay_`-Kennung gebundene `MeritPocket` – selbst dann, wenn das darunterliegende Container-Image im Laufe des Betriebs Hunderte Male aktualisiert wird.

---

## 5.2 Warum Eigentümerwechsel ein atomares Doppelsignatur-Protokoll erfordern

Anders als ein individueller `iFay`, der lebenslang an einen einzigen **Human Prime** gebunden bleibt, ist ein `coFay` ein institutionelles Rollen-Asset mit legitimen Übergabeszenarien über seinen Lebenszyklus hinweg. Typische Fälle sind die Übergabe eines gereiften Open-Source-`coFay` vom Typ `project_collaborator` von der persönlichen `HumanID` des Gründers an die `OrganizationID` einer Open-Source-Stiftung oder die Ausgliederung eines öffentlichen Serviceschalters aus einem Unternehmensteil in eine neu gegründete Betreibergesellschaft.

Ein schlichter Transfermechanismus mit nur einer Signatur würde dabei drei gravierende Sicherheitslücken öffnen:

1. **Einseitige Übernahme oder Abwälzung von Haftungsrisiken**: Genügte die Signatur nur einer Seite, könnte entweder ein Angreifer fremde Rollen kapern oder ein bisheriger Inhaber einen mit laufenden Compliance-Verstößen belasteten `coFay` ungefragt einer unbeteiligten Person oder Organisation zuschieben.
2. **Verwaiste Alt-Manager im Übergabefenster**: Vor einer Übergabe hat der bisherige Eigentümer meist interne Schichtdelegierte in `managers: iFayID[]` eingetragen. Würde ein Eigentümerwechsel diese Liste stillschweigend zur späteren manuellen Bereinigung übernehmen, entstünde zum Umschaltzeitpunkt ein kritisches Zeitfenster, in dem die `iFay`-Delegierten des früheren Eigentümers weiterhin rechtsverbindliche Handlungen unter der Haftung des neuen Eigentümers signieren könnten.
3. **Replay-Angriffe mit historischen Transferdaten**: Ohne streng monoton steigenden Anti-Replay-Zähler und kryptografische Bindung an den exakten Prüfsummewert der Vorgänger-Charta ließen sich abgefangene ältere Transferpakete erneut einspielen, um Eigentumsverhältnisse zurückzudrehen.

---

## 5.3 `TransferEnvelope` 1.0: Normativer Ablauf des atomaren doppelt signierten Eigentümerwechsels

Um alle drei Fehlerklassen konstruktiv auszuschließen, spezifiziert `coFay` die normative Struktur **`TransferEnvelope` 1.0** (definiert unter `$defs.TransferEnvelope` in `schemas/cofay-role-charter-1.0.json`):

### Schritt 1: Vorgänger-Charta und monotonen Anti-Replay-Zähler fixieren
Jeder Transferumschlag muss folgende Werte explizit binden:

- `prior_charter_digest_hex`: Kleingeschriebener SHA-256-Hex-Digest über der kanonischen RFC-8785-JCS-Serialisierung der aktuell aktiven `RoleCharter` (jede Abweichung schlägt sofort mit `PRIOR_CHARTER_DIGEST_MISMATCH` fehl).
- `transfer_nonce`: Exakt gleich `currentCharter.transfer_nonce + 1` (das Wiedereinspielen alter Zählerstände oder das Überspringen von Werten schlägt sofort mit `TRANSFER_NONCE_MISMATCH` fehl).
- `from_owner` und `to_owner`: Beide Seiten müssen die Regeln einschichtiger Eigentümerschaft erfüllen (ausschließlich `HumanID` oder `OrganizationID`; verschachtelte `ifay_`- oder `cofay_`-Eigentümer schlagen mit `OWNER_TYPE_FORBIDDEN` fehl, ein Transfer an denselben Eigentümer mit `SELF_TRANSFER_REDUNDANT`). Gilt `to_owner.type === "organization"`, muss der Umschlag zugleich in `new_steward_human_id` den künftigen natürlichen Steward benennen.

### Schritt 2: Alt-Manager bereinigen oder explizit neu ratifizieren (`manager_policy`)
`TransferEnvelope` 1.0 **verbietet jede stillschweigende Übernahme bisheriger `managers`** und erzwingt die Wahl zwischen zwei sich gegenseitig ausschließenden Richtlinien:

- **`"CLEAR_ALL"` (empfohlener sicherer Standard)**: `ratified_managers` muss ein leeres Array `[]` sein (nicht-leere Arrays schlagen mit `CLEAR_ALL_NON_EMPTY_MANAGERS` fehl). Damit erlöschen im exakten Moment des Eigentumsübergangs sämtliche bisherigen `iFay`-Betriebsdelegationen atomar.
- **`"RATIFY_NEW"` (unterbrechungsfreie Umschaltung)**: Führt die künftigen `iFay`-Betriebsdelegierten explizit in `ratified_managers` auf. Da die Signatur des übernehmenden Eigentümers beziehungsweise Stewards den gesamten Transferumschlag abdeckt, bleiben ausschließlich ausdrücklich von der Übernahmeseite bestätigte `iFay`-Delegierte aktiv; alle nicht bestätigten Alt-Delegierten werden atomar entfernt.

### Schritt 3: Gemeinsame Ed25519-Signaturen von abgebender und aufnehmender Seite einholen
Nach Entfernen der Signaturfelder, kanonischer Serialisierung nach RFC 8785 JCS und Voranstellen des Domain-Separation-Präfixes `"ifay.cofay.ownership-transfer.v1\0"` verlangt die Transaktion **beide** gültigen Ed25519-Signaturen gleichzeitig:

- `from_signature`: Signiert vom bisherigen `owner.id` beziehungsweise dem bisherigen `steward_human_id`.
- `to_signature`: Signiert vom künftigen `to_owner.id` beziehungsweise dem künftigen `new_steward_human_id`.

Fehlt eine der beiden Signaturen, schlägt die Prüfung sofort mit `TRANSFER_DUAL_SIGNATURE_REQUIRED` fehl; unberechtigte Unterzeichner oder manipulierte Nutzdaten führen deterministisch zu `TRANSFER_SIGNER_UNAUTHORIZED` oder `TRANSFER_SIGNATURE_INVALID`.

---

## 5.4 Abschlagsfreie `MeritPocket`-Kontinuität und Bestandssperre bei Handlungsunfähigkeit

### 1. Rollenkontinuität ohne Vererbungsabschlag auf das `MeritPocket`
Nach den Regeln der `GMChain` unterliegt die postmortale Weitergabe persönlicher Reputation eines Menschen einem fünfstufigen Intimitätsabschlag (und ist unterhalb eines Intimitätswerts von `0.1` vollständig ausgeschlossen), damit persönliche Verdienste niemals kommerzialisiert werden können. Bei einem gültigen, doppelt signierten `coFay`-Transfer gehört das `MeritPocket` jedoch **der öffentlichen Rolle `cofay_` selbst** und keiner ausscheidenden Einzelperson. Sofern `merit_continuity` sowohl `preserve_cofay_id: true` als auch `preserve_merit_pocket: true` setzt (Abweichungen schlagen mit `MERIT_CONTINUITY_VIOLATION` fehl), geht der historisch durch die Rolle erworbene `MeriToken`-Bestand ohne jeden Vererbungsabschlag unter die Verantwortung des neuen Eigentümers über (siehe `Global-Merit-Chain`). Selbstverständlich unterliegen `MeriToken` weiterhin der nicht-monetären Zeitabklingkurve der `GMChain` bis auf ihren Grundsockel: Keine Organisation kann durch bloßen Erwerb einer etablierten Rolle dauerhaftes Governance-Gewicht horten; anhaltendes öffentliches Vertrauen setzt stets laufende bestätigte Beiträge voraus.

### 2. Bestandssperre bei Organisationsauflösung oder Ausfall des Stewards (`SUSPENDED_PENDING_SUCCESSION`)
Was geschieht, wenn sich eine besitzende Organisation auflöst oder ihr eingetragener natürlicher Steward plötzlich handlungsunfähig wird, bevor ein doppelt signierter Transfer abgeschlossen werden konnte? Nach den mit `FayID` ADR `0003` abgestimmten Governance-Regeln gilt:

- Der `coFay` **fällt niemals stillschweigend** an eine Mutterorganisation zurück, **wandelt sich niemals in einen unkontrollierten autonomen Agenten** und **löscht niemals seine historische Merit-Historie**.
- Stattdessen wechselt sein `lifecycle_state` deterministisch auf **`"SUSPENDED_PENDING_SUCCESSION"`**: Während dieser Bestandssperre sind Änderungen an den operativen `managers` blockiert (`CHARTER_NOT_ACTIVE`), und ausgehende eingeschränkte Geschäftsaktionen ruhen.
- Erst nach Abschluss eines vorab hinterlegten Schwellenwert-Wiederherstellungsverfahrens oder einer gültigen, doppelt signierten Übergabe per `TransferEnvelope` 1.0 kehrt die Rolle in den Zustand `"ACTIVE"` zurück und nimmt den öffentlichen Dienst wieder auf.
