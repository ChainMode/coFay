# 03. Taxonomie öffentlicher Rollen und Anwendungsszenarien

## 3.1 Warum `RoleCharter` 1.0 eine kanonische Rollentaxonomie festlegt

In realen Institutionen reichen öffentliche Rollen von kommunalen Genehmigungsstellen und Unternehmenskundendienst über regulatorische Prüfämter bis hin zu gemeinschaftlicher Forschung und Open-Source-Governance. Würde `RoleCharter` 1.0 sämtliche Rollen als undifferenzierte Masse behandeln – oder im anderen Extrem Hunderte branchenspezifischer Einzeltypen fest verdrahten –, litte darunter die Protokollintegrität: Ein untypisiertes Modell kann keine abgestuften Sicherheitsprofile für unterschiedlich weitreichende Befugnisse durchsetzen, während ein ausufernder Branchenkatalog die domänenübergreifende Interoperabilität zersplittern würde.

Um Präzision und Erweiterbarkeit ins Gleichgewicht zu bringen, klassifiziert `coFay` öffentliche Rollen anhand dreier orthogonaler Strukturmerkmale: **externe Servicetopologie, Ermessensspielraum und Lebenszyklus des Amts**. Aus ihrer Kombination ergeben sich in Version 1.0 drei kanonische Werte für `role_archetype`:

1. **`org_service` (Öffentlicher Serviceschalter einer Organisation)**
2. **`functional_post` (Satzungsmäßiges oder regulatorisches Funktionsamt)**
3. **`project_collaborator` (Projekt- oder zweckgebundene Kooperationseinheit)**

Jedes gültige `RoleCharter`-1.0-Dokument muss in `role_archetype` genau einen dieser drei Werte angeben; jede unbekannte Zeichenkette schlägt bei der Validierung sofort mit `ROLE_ARCHETYPE_INVALID` fehl.

---

## 3.2 Archetyp 1: `org_service` (Öffentlicher Serviceschalter einer Organisation)

### Einordnung und wesentliche Merkmale
`org_service` bildet eine **standardisierte Beratungs-, Annahme- und Skill-Bereitstellungsfassade** ab, die ein Unternehmen, eine Behörde, ein Verband oder ein Einzelbetrieb nach außen betreibt. Mit diesem Archetyp kommen externe Aufrufer im Alltag am häufigsten in Berührung.

- **Typische Eigentümerstruktur**: Meist im Eigentum einer `OrganizationID` (etwa `org_civic-service-bureau`) in Verbindung mit einem verpflichtenden natürlichen Steward (`steward_human_id`); unabhängige Büros oder zugelassene Einzelpraktiker können `owner` auch direkt an ihre `HumanID` binden.
- **Empfohlenes CAP-Autonomieprofil**: In der Regel auf `assistive` oder `delegated` bei `allow_irreversible_actions: false` eingestellt. Dieses Profil erlaubt automatisierte Richtlinienauskünfte, Ticket-Vorprüfung, Terminplanung und standardisierte Skill-Ausführung, eskaliert jedoch unumkehrbare rechtliche oder behördliche Zusagen an den menschlichen Steward oder einen autorisierten `iFay`-Manager.
- **SSP-Freigabemuster**: Kombiniert nicht authentifizierte `public`-Auskunfts-Skills (wie Gebührentabellen oder Checklisten) mit aufruferauthentifizierten (`require_caller_auth: true`) `restricted`-Skills für Antragseinreichung und Bearbeitungsstand.

### Praxisszenario: Kommunaler Genehmigungs- und Bürgerschalter
Eine kommunale Verwaltungsbehörde stellt `cofay_orgservicedesk234567` als öffentlichen Genehmigungsschalter bereit. Statt sich durch verstreute Behördenportale zu klicken, weist eine Bürgerin ihren persönlichen `iFay` an: *„Prüfe, welche Brandschutz- und Gewerbeunterlagen für die Eröffnung einer Buchhandlung im Viertel erforderlich sind.“*

1. Der `iFay` der Bürgerin ermittelt den kommunalen `coFay` über **SSP** und prüft zunächst sowohl den Eigentumsnachweis für `org_civic-service-bureau` als auch die Ed25519-Signatur des menschlichen Stewards auf der `RoleCharter` 1.0.
2. Nach erfolgreicher Prüfung ruft der `iFay` den `public`-Checklisten-Skill auf und reicht – nach ausdrücklicher Freigabe durch seinen **Human Prime** – die Vorprüfungsmappe über den `restricted`-Einreichungs-Skill ein.
3. Hinter dieser einen `cofay_`-Identität fangen Dutzende zustandsloser Worker-Replikate morgendliche Lastspitzen parallel ab und versehen jede Eingangsbestätigung mit einem prüfbaren Herkunftstripel `(cofay_id, owner_id, actor_signer_id)`.

---

## 3.3 Archetyp 2: `functional_post` (Satzungsmäßiges oder regulatorisches Funktionsamt)

### Einordnung und wesentliche Merkmale
`functional_post` modelliert ein **ständiges institutionelles Amt mit ausdrücklicher Charta-Vollmacht, Compliance-Bestätigungspflichten oder operativer Freigabebefugnis** innerhalb einer Organisation, eines Konsortiums oder einer kritischen Ökosystem-Infrastruktur. Sein Leitprinzip ist institutionelle Beständigkeit: *Das Amt bleibt bestehen, während die Amtsinhaber wechseln*.

- **Typische Eigentümerstruktur**: Im Eigentum eines Aufsichtsgremiums, einer Stiftung oder einer internen Kontrollinstanz (`OrganizationID`) und über `steward_human_id` strikt an den jeweils amtierenden natürlichen Amtsinhaber gebunden.
- **Semantische Deckung mit CAP `Official_Post`**: Im **Control Authority Protocol** (`CAP`) setzen hochsensible physische Hosts und kritische Infrastruktureingriffe Autorisierungsdeskriptoren voraus, die von einem institutionellen Amt (`Official_Post`; siehe `Control-Authority-Protocol`) ausgestellt oder gegengezeichnet wurden. Ein `coFay` des Typs `functional_post` fungiert auf Rollenebene als normativer Träger dieser Semantik und darf `cap_bounds.max_autonomy_tier: "official_post"` deklarieren.
- **Amtszeitwechsel bei lückenloser Reputationskontinuität**: Endet die Amtszeit eines leitenden Sicherheitsprüfers und tritt eine Nachfolgerin an, aktualisiert die besitzende Organisation `steward_human_id` sowie das aktive Schicht-Array `managers: iFayID[]` und veröffentlicht eine hochgezählte `RoleCharter` (`charter_revision + 1`). Über den gesamten Wechsel hinweg bleiben die `cofay_`-Kennung des Amts, externe Abonnements und die historische `MeritPocket`-Bilanz unterbrechungsfrei erhalten.

### Praxisszenarien: Sicherheitsprüfamt im Ökosystem und Leitstelle für den unteren Luftraum
- **Sicherheitsprüfamt eines Open-Source-Konsortiums**: Ein Sicherheitsverbund richtet mit `cofay_govpostauditor234567` eine ständige Melde- und Patch-Testierungsstelle ein. Mitgliedsprojekte übermitteln Schwachstellenmeldungen direkt an dieses Amt; diensthabende Sicherheitsforscher bedienen es über ihre autorisierten `iFay`-Manager-Delegierten, reproduzieren Exploits und zeichnen Sicherheitshinweise gegen, sodass nachgelagerte Nutzer einer einzigen dauerhaften Amtsschlüsselkette vertrauen können.
- **Luftraum-Leitstelle auf einem Industriecampus**: Die Betreibergesellschaft eines Industrieparks steuert über einen `functional_post`-`coFay` autonome Lieferdrohnen-Hosts mittels CAP und DTP. Überschreiten Scherwinde die in der Charta verankerten Sicherheitsgrenzwerte, erlässt das Amt innerhalb seiner freigegebenen CAP-Bereiche deterministische Startverbote für aktive Flugkorridore.

---

## 3.4 Archetyp 3: `project_collaborator` (Projekt- oder zweckgebundene Kooperationseinheit)

### Einordnung und wesentliche Merkmale
`project_collaborator` ist auf Open-Source-Repositorys, institutsübergreifende Forschungsvorhaben, Standardisierungsgruppen und unternehmensübergreifende Entwicklungsprojekte zugeschnitten. Die Einheit dient dort als **gemeinsamer Team-Endpunkt, der Fachwissensgraphen, automatisierte Prüf-Pipelines und kollaborative Abläufe bündelt**.

- **Typischer Eigentumslebenszyklus**: In der frühen Aufbauphase häufig direkt unter der persönlichen `HumanID` einer Projektgründerin angelegt. Sobald das Vorhaben reift und in eine Open-Source-Stiftung oder ein Forschungsinstitut übergeht, übergibt ein atomarer, doppelt signierter Eigentümerwechsel (`TransferEnvelope` 1.0) den `coFay` sauber an die `OrganizationID` der Stiftung – ohne dass externe Mitwirkende auch nur eine einzige konfigurierte `cofay_`-Endpunktreferenz anpassen müssen.
- **Zusammenspiel mehrerer Kooperationsprotokolle**: Arbeitet eng mit dem **Interactive Conversation Protocol** (`ICP`) zusammen, um strukturierte `.ctx`-Review-Anmerkungen zu RFC-Entwürfen, Manuskripten oder Codespezifikationen auszugeben, und koordiniert über das **Telepathy Protocol** (`TP`) abgegrenzte gemeinsame Arbeitsbereiche zwischen den individuellen `iFay`-Avataren der Beteiligten (siehe `Interactive-Conversation-Protocol` und `Telepathy-Protocol`).

### Praxisszenario: Institutsübergreifender Forschungs- und Protokollkonformitäts-Bot
Eine mehrsprachige Arbeitsgruppe für offene Protokolle betreibt `cofay_ossprojectbot234567` unter dem Archetyp `project_collaborator`. Mitwirkende aus verschiedenen Zeitzonen verbinden ihre persönlichen `iFay`-Avatare direkt mit der Einheit, ohne auf die Arbeitszeiten menschlicher Maintainer warten zu müssen: Der `coFay` führt Konformitäts-Testvektoren aus, prüft Terminologie-Invarianten über neun Sprachversionen hinweg und gibt strukturierte `.ctx`-Prüfkommentare zurück. Bestätigen Fachkollegen besonders hilfreiche Reviews auf der **Global Merit Chain** (`GMChain`), fließen die daraus resultierenden, nicht-monetären **MeriToken** kontinuierlich in das eigene `MeritPocket` der Einheit und machen den gemeinschaftlichen Beitrag des Projekts nachvollziehbar sichtbar.

---

## 3.5 Vergleich der Fähigkeitsprofile über alle drei Rollenarchetypen

| Dimension | `org_service` | `functional_post` | `project_collaborator` |
| :--- | :--- | :--- | :--- |
| **Primäres Entwurfsziel** | Hochparallele, standardisierte Annahme von Bürger- oder Kundenanfragen | Streng rechenschaftspflichtiges Amt für Governance, Freigaben und Testate | Fachwissenssynthese, mehrseitige F&E-Koordination und übertragbare Trägerschaft |
| **Typischer einschichtiger Eigentümer** | `OrganizationID` (oder Einzelinhaber-`HumanID`) | `OrganizationID` (mit verpflichtendem natürlichem Steward) | In der Aufbauphase `HumanID`; bei Reife häufig Transfer an `OrganizationID` |
| **Typische SSP-Skill-Sichtbarkeit** | Kombination aus `public`-Auskunft und `restricted`-Einreichung | Überwiegend `restricted` oder `private` mit zwingender Aufruferauthentifizierung | `public` (Open-Source-Zusammenarbeit) oder `restricted` (Konsortialmitglieder) |
| **Typische CAP-Obergrenze** | `assistive` / `delegated` | `delegated` / `official_post` | `assistive` / `delegated` |
| **Kanonischer Lebenszyklusübergang** | Schichtrotation zwischen operativen `managers` | Amtsübergabe des Stewards bei unveränderter `cofay_`-Kennung | Doppelt signierter Eigentümerwechsel von Gründungsperson an Stiftung |
