# 06. Konformitäts-Framework coFACTS und mehrphasige Roadmap

## 6.1 Warum `iFACTS` und `coFACTS` eine orthogonale Grenze durchsetzen

In einem offenen Protokoll-Ökosystem mit mehreren Anbietern entscheidet eine objektive, reproduzierbare und automatisierte Konformitätsprüfung darüber, ob Implementierungen verlässlich zusammenspielen oder in inkompatible Eigeninterpretationen zerfallen. Das Dach-Repository `ifay` definiert **iFACTS** (*iFay Architecture Conformance Test Suite*) sowie die Zertifizierungsstufen `iFay Ready` für individuelle digitale Avatare (siehe `ifay`). Weshalb führt das Ökosystem für `coFay` eine eigene Testsuite, statt öffentliche Rollen einfach in `iFACTS` einzugliedern?

Der Grund liegt darin, dass **ihre zentralen Sicherheitsinvarianten einander diametral gegenüberstehen**:

- Unter `iFACTS` muss eine konforme Implementierung eines individuellen Avatars nachweisen, dass sie das persönliche `Ego`-Modell ihres **Human Prime** korrekt einbindet, exklusive 1:1-Kopplungs-Handshakes mit dem Prime durchführt und treuhänderische Nachfolgeregeln einhält.
- Unter `coFay` stellt bereits das Einbinden irgendeines persönlichen `Ego`-Modells einen **schweren Sicherheitsverstoß (`COFAY_EGO_FORBIDDEN`)** dar. Umgekehrt existieren zentrale Pflichtinvarianten von `coFay` – darunter der Durchgriff auf einen natürlichen Steward (`steward_human_id`), einschichtiges Eigentum ohne Verschachtelung sowie das atomare Bereinigen alter Manager beim doppelt signierten Eigentümerwechsel – bei persönlichen `iFay`-Avataren überhaupt nicht.

Deshalb setzt das Ökosystem in beiden Richtungen eine strikte Zielgrenzenprüfung durch:

1. **`@ifay/ifacts` prüft ausschließlich individuelle `iFay`-Implementierungen und kompatible Host-Integrationen**, fängt `cofay_`-Zielobjekte explizit ab und verweist Betreiber auf `coFACTS` (siehe `ifay`).
2. **`coFACTS` (*Common Fay Architecture Conformance Test Suite*) prüft ausschließlich `coFay`-Rollenimplementierungen, Charta-Dokumente und Governance-Übergänge**. Sobald `runCoFactsL1Check` eine Eingabe mit einer `ifay_`-Kennung oder einer Artmarkierung `IFAY_MANIFEST` beziehungsweise `IFAY_ID` erkennt, bricht der Prüflauf sofort ab und gibt `conformance: "REJECTED_BOUNDARY"` samt dem Fehlercode `BOUNDARY_IFAY_USE_IFACTS` zurück.

---

## 6.2 Dreistufiges progressives Konformitätsmodell in `coFACTS`

Im Einklang mit der Prüfmethodik des Gesamtökosystems gliedert sich `coFACTS` in drei streng aufeinander aufbauende Konformitätsstufen (eine Implementierung muss 100 % der L1-Prüfungen bestehen, bevor sie L2- oder L3-Konformität beanspruchen darf):

| Stufe | Bezeichnung der Konformitätsstufe | Prüfgegenstand und zentraler Prüfumfang | Auslieferungsstand |
| :--- | :--- | :--- | :--- |
| **L1** | **Charta- und Zustandskonformität** | Deterministische Offline-Prüfung der JSON-Schema-Konformität von `RoleCharter` 1.0, des Ego-Schicht-Verbots, der kanonischen Rollenarchetypen, einschichtiger Eigentümerschaft und verpflichtender Bindung eines natürlichen Stewards, der SSP-Authentifizierungsschranken für nicht-öffentliche Skills, der Signaturintegrität nach RFC 8785 JCS + Ed25519, der Single-Hop-Delegation an `iFay` ohne Weiterdelegation sowie atomarer doppelt signierter Eigentümerwechsel nach `TransferEnvelope` 1.0 samt Replay-Schutz | **v1.0 ausgeliefert** (integriert in `@ifay/cofay`) |
| **L2** | **Protokollübergreifende Schnittstellenkonformität** | Live-Prüfung auf Leitungsebene gegen laufende `coFay`-Endpunkte: validiert JWS-signierte SSP-Deskriptoren unter `/.well-known/skill-sharing` und gegenseitige Aufruferauthentifizierung auf eingeschränkten Endpunkten, delegierte Stewardship-Nachweisketten nach `Faying 1.1`, das Blockieren nicht freigegebener CAP-Befehle außerhalb von `cap_bounds` auf Endgeräte-Hosts sowie die Offenlegung der Rollenidentität in ICP- und TP-Sitzungen | **Geplant für Phase 2** |
| **L3** | **Elastizitäts- und Revisionskontinuität** | Durchgehende Resilienz- und Governance-Belastungstests: prüft deterministisches Verhalten über parallele zustandslose FayGer-Worker hinweg, Manipulationssicherheit lokaler Hash-verketteter Audit-Protokolle mit `(cofay_id, owner_id, actor_signer_id)`, automatische Übergänge in die Bestandssperre `SUSPENDED_PENDING_SUCCESSION` bei Ausfall des Stewards sowie den lückenlosen Abgleich der Beitragszurechnung mit dem `MeritPocket`-Zustand auf der **Global Merit Chain** (`GMChain`) | **Geplant für Phase 3** |

---

## 6.3 Sechs automatisierte `coFACTS`-L1-Prüfungen und maschinenlesbares Berichtsformat

Die aus `src/cofay-charter.mjs` exportierte Funktion `runCoFactsL1Check(subject)` stellt einen abhängigkeitsfreien Referenz-Prüflauf für Stufe L1 bereit und erzeugt deterministische JSON-Berichte im Format `report_version: "cofacts-l1-report/1.0"`:

```json
{
  "report_version": "cofacts-l1-report/1.0",
  "suite": "coFACTS",
  "level": "L1",
  "target_id": "cofay_orgservicedesk234567",
  "conformance": "PASS",
  "checks": [
    { "id": "L1-BOUNDARY-01", "name": "coFACTS vs iFACTS target boundary", "passed": true },
    { "id": "L1-NO-EGO-02", "name": "Absence of personal Ego layer attachment", "passed": true },
    { "id": "L1-TAXONOMY-03", "name": "Canonical public role archetype", "passed": true },
    { "id": "L1-OWNERSHIP-04", "name": "Single-layer ownership & natural-person steward accountability", "passed": true },
    { "id": "L1-CAPABILITIES-05", "name": "SSP caller auth gates, CAP bounds & explicit red lines", "passed": true },
    { "id": "L1-CRYPTO-06", "name": "Ed25519 JCS RoleCharter signature & actor traceability policy", "passed": true }
  ],
  "errors": []
}
```

Ergänzend zum Referenzprüfer liefert `vectors/cofay-role-charter-vectors.json` **20 normative positive und negative Testvektoren** (`V01` bis `V20`). Unabhängige Entwicklerteams, die `coFay`-Laufzeitumgebungen oder Governance-Gateways in Rust, Go, Python oder TypeScript implementieren, müssen jeden positiven Vektor akzeptieren und jeden negativen Vektor exakt mit dem zugehörigen normativen Fehlercode abweisen, bevor sie `coFACTS`-L1-Konformität geltend machen können.

---

## 6.4 Vierphasige Ökosystem-Roadmap

Die Weiterentwicklung von `coFay` führt schrittweise von kryptografischen Charta-Verträgen über protokollübergreifende Live-Interoperabilität bis hin zu großskaliger öffentlicher Governance:

### Phase 1: Normative Basisspezifikation und `coFACTS` L1 (ausgeliefert, Initial-Baseline `2025-10-25`)
- Festlegung der Ego-freien Drei-Schichten-Ontologie öffentlicher Rollen sowie der drei kanonischen Rollenarchetypen für Version 1.0 (`org_service`, `functional_post` und `project_collaborator`).
- Einfrieren des normativen JSON-Schemas für `RoleCharter` 1.0 und den atomaren doppelt signierten `TransferEnvelope` 1.0 (`schemas/cofay-role-charter-1.0.json` zusammen mit der byteidentischen Release-Triade unter `schema/2025-10-25/`).
- Auslieferung von 20 deterministischen Konformitäts-Testvektoren für Ed25519 + RFC 8785 JCS samt der abhängigkeitsfreien Referenzbibliothek `@ifay/cofay` zur Signierung und Validierung.
- Bereitstellung vollständiger Architektur-Blueprints und Schnellstartdokumentation in neun Sprachversionen.

### Phase 2: Protokollübergreifende Live-Endpunktintegration und `coFACTS` L2 (kurzfristig)
- Abschluss der Live-Interoperabilitätstests auf Leitungsebene zwischen `Faying 1.1` (`coFay` Delegated Stewardship Profile), `SSP 1.0`-Skill-Servern und statischen Indexverzeichnissen in `FayGer`.
- Veröffentlichung des automatisierten HTTP/TLS-Prüfwerkzeugs für `coFACTS` L2, das aktive `RoleCharter`-Bestätigungen inspiziert und die Durchsetzung der Aufruferauthentifizierung auf eingeschränkten SSP-Endpunkten verifiziert.

### Phase 3: Schwellenwert-Schlüsselverwahrung, Multi-Instanz-Elastizität und `coFACTS` L3 (mittelfristig)
- Einbindung organisatorischer N-von-M-Schwellenwert-Multisignaturrichtlinien aus `FayID`, um gremienbestätigte Charta-Änderungen und geordnete Notfall-Nachfolgeübungen großer öffentlicher Institutionen abzubilden.
- Bereitstellung zustandsloser `coFay`-Worker-Vorlagen für die Container-Orchestrierung in **FayGer** sowie verteilter, manipulationssicherer Hash-Chain-Audit-Aggregatoren als Grundlage für die vollständige `coFACTS`-L3-Zertifizierung.

### Phase 4: Öffentliches Service-Ökosystem im großen Maßstab auf der Global Merit Chain (`GMChain`) (Langfristperspektive)
- Branchenübergreifende Auffindbarkeit öffentlicher Rollenverzeichnisse und transparente Einsicht in historische `MeritPocket`-Leistungsbilanzen, damit kommunale Bürgerämter, wissenschaftliche Peer-Review-Stellen und Open-Source-Infrastruktureinheiten in einer vertrauenswürdigen, rechenschaftspflichtigen und nicht-monopolistischen Mensch-Agent-Gesellschaft auf Basis nicht-monetärer **MeriToken**-Zurechnung zusammenarbeiten können.
