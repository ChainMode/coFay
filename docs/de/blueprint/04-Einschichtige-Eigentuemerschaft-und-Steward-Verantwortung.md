# 04. Einschichtige Eigentümerschaft, orthogonale Delegation und Steward-Verantwortung

## 4.1 Warum Eigentümerschaft, Organisationshierarchie und Betriebsdelegation orthogonal bleiben müssen

Eines der folgenreichsten Architektur-Antimuster in verteilten Agenten-Ökosystemen besteht darin, drei grundverschiedene Fragen in einem einzigen Baum zusammenzuwerfen: *Wem gehört ein Agent rechtlich?*, *Wie gliedern sich Mutter- und Tochtergesellschaften?* und *Wer darf den Agenten in der heutigen Schicht bedienen?* Sobald ein `coFay` einen weiteren `coFay` besitzen darf oder ein `iFay` als rechtlicher Eigentümer eines `coFay` eingetragen wird, entstehen rasch undurchsichtige mehrstufige Schachtelketten: Externe Prüfer können nicht mehr feststellen, welche natürliche oder juristische Person am Ende haftet, und gewöhnliche Personalwechsel lösen kaskadierende Berechtigungsausfälle aus.

Um solche Schachtelstrukturen konstruktiv auszuschließen, setzen `coFay`, **FayID** und **Global Merit Chain** (`GMChain`) repositoryübergreifend ein einheitliches **Modell dreier orthogonaler Achsen** durch (siehe `FayID` und `Global-Merit-Chain`):

1. **Achse der Eigentümerschaft**: Beantwortet *„Wer hält die Eigentumsrechte und trägt die rechtliche Gesamtverantwortung für diesen `coFay`?“* Strikt beschränkt auf **einschichtige Eigentümerschaft**.
2. **Achse der Organisationshierarchie**: Beantwortet *„Wie stehen Konzernmutter und Tochtergesellschaften zueinander?“* Wird ausschließlich im einfach verwurzelten, zyklenfreien Baum von `OrganizationID` in `FayID` abgebildet und niemals durch verschachtelte `coFay`-Instanzen nachgestellt.
3. **Achse der Betriebsdelegation**: Beantwortet *„Welche individuellen Avatare sind berechtigt, diesen `coFay` im täglichen Schichtbetrieb zu steuern?“* Wird orthogonal über einstufige Delegationen in `managers: iFayID[]` vergeben, ohne den zugrundeliegenden `owner` zu verändern.

---

## 4.2 Invariante einschichtiger Eigentümerschaft und Steward-Verantwortung natürlicher Personen

Unter `RoleCharter` 1.0 hat jeder `coFay` zu jedem Zeitpunkt genau einen verantwortlichen `owner`:

- **Direktes Eigentum einer natürlichen Person**: `owner = { "type": "human", "id": "hid_<base32>" }`
- **Direktes Eigentum einer Organisation**: `owner = { "type": "organization", "id": "org_<slug|base32>" }`

Sowohl die JSON-Schema-Prüfung als auch die Laufzeitvalidierung weisen jeden Versuch, `owner.id` mit einer `ifay_<base32>`- oder `cofay_<base32>`-Kennung zu belegen, deterministisch mit `OWNER_TYPE_FORBIDDEN` zurück. Selbst wenn eine besitzende Tochtergesellschaft `org_sub` in `FayID` einer Mutterorganisation `org_parent` untergeordnet ist, muss das Feld `owner` des `coFay` explizit den unmittelbaren Inhaber `org_sub` benennen und fällt niemals stillschweigend an die Muttergesellschaft zurück.

### Verpflichtender natürlicher Steward bei organisatorischer Eigentümerschaft
Eine Organisation ist ein juristisches und institutionelles Konstrukt: Sie kann weder kryptografische Hardwareschlüssel physisch verwahren noch aus sich heraus menschliche ethische Aufsicht ausüben. Deshalb verankert `RoleCharter` 1.0 eine strikte Durchgriffsregel für die Verantwortlichkeit:

> **Jeder `coFay` mit `owner.type === "organization"` muss in `steward_human_id` explizit einen gültigen natürlichen Steward angeben (strikt im Format `hid_<base32>`).**

- Fehlt `steward_human_id` bei organisatorischer Eigentümerschaft, schlägt die Prüfung sofort mit `ORG_STEWARD_REQUIRED` fehl.
- Wird in `steward_human_id` eine `ifay_`- oder `cofay_`-Kennung übergeben, schlägt die Prüfung sofort mit `STEWARD_MUST_BE_HUMAN` fehl.

Damit bleibt unabhängig von der Größe oder Verschachtelung eines Konzerns oder einer Behörde jeder aktive `coFay` im gesamten Ökosystem an einen eindeutig identifizierbaren Menschen gebunden, der für die Einhaltung der Charta unmittelbar einsteht.

---

## 4.3 Orthogonale Single-Hop-Betriebsdelegation an `iFay` und Verbot der Weiterdelegation

Im laufenden Betrieb kann weder ein besitzender **Human Prime** noch ein organisatorischer Steward rund um die Uhr jede Konfigurationsänderung oder Warteschlangenfreigabe eigenhändig signieren. Für einen skalierbaren Schichtbetrieb dürfen Eigentümer oder Steward daher die individuellen Avatare vertrauenswürdiger Human Primes in `RoleCharter.managers` eintragen (zum Beispiel `["ifay_opsmanageralpha2345", "ifay_opsmanagerbravo2345"]`).

Für diese orthogonale Betriebsdelegation gelten drei harte Sicherheitsinvarianten:

1. **Betriebsdelegation ändert niemals das Eigentum**: Das Hinzufügen oder Entfernen von Einträgen in `managers` betrifft ausschließlich die operative Tagesvertretung; `owner` bleibt unberührt. Betriebsmanager können weder Eigentümerwechsel anstoßen noch Leitauftrag (`mission_statement`) oder Verbotsregeln (`prohibited_actions`) der `RoleCharter` abändern.
2. **Delegierte dürfen ausschließlich `iFay`-Avatare sein**: Operative Verwaltungsaufgaben müssen über individuelle Avatare laufen, die direkt von verantwortlichen Human Primes gesteuert werden. Einen anderen `coFay` als Manager des aktuellen `coFay` einzutragen, wird mit `MANAGER_TARGET_INVALID` strikt abgelehnt, um rollenübergreifende Steuerungsschleifen auszuschließen.
3. **Strikte Single-Hop-Disziplin (keine Weiterdelegation)**: Ausschließlich `owner.id` oder `steward_human_id` dürfen Delegationsänderungen vom Typ `GRANT` oder `REVOKE` ausstellen. Versucht ein bereits autorisierter Manager `ifay_A`, Verwaltungsrechte an `ifay_B` weiterzureichen, weist der Validator die Anfrage sofort mit `MANAGER_REDELEGATION_FORBIDDEN` ab. Diese einstufige Grenze verhindert jede unkontrollierte Rechteausweitung.

---

## 4.4 Durchgehende Verantwortungskette über fünf Kernprotokolle des Ökosystems

Wie zieht ein konformer `coFay` dieses Verantwortungsmodell durch den gesamten Protokoll-Stack? Das folgende Diagramm zeigt das Zusammenspiel der fünf Repositorys von der souveränen Identitätsregistrierung bis zur begrenzten Host-Steuerung und Beitragszurechnung:

```text
[FayID 1.0] Verankert hid_ / org_ / ifay_ / cofay_ Holder-of-Key-Identitäten & einschichtiges Eigentum
     │
     ▼
[coFay RoleCharter 1.0] Eigentümer oder Steward signiert Charta: fixiert Archetyp, SSP/CAP-Grenzen & managers[]
     │
     ├──▶ [Faying 1.1] (coFay Delegated Stewardship Profile)
     │      Prüft die Delegationskette Human Prime / Steward ──▶ iFay-Manager ──▶ coFay
     │
     ├──▶ [SSP 1.0 & CAP 1.0]
     │      Publiziert cofay_-signierte JWS-Skill-Deskriptoren; steuert Endgeräte-Hosts innerhalb cap_bounds
     │
     └──▶ [GMChain]
            Verbucht bestätigte Beiträge im 1:1 gebundenen MeritPocket (nicht-monetäre MeriToken)
```

Im Einzelnen stützt sich die protokollübergreifende Integration auf drei normative Handshakes:

- **Abstimmung mit `Faying 1.1`**: Während `Faying 1.0` die 1:1-Kopplung zwischen einem Human Prime und seinem persönlichen `iFay` regelt und unverändert eingefroren bleibt, transportiert die abwärtskompatible Erweiterung **`Faying 1.1` (`coFay` Delegated Stewardship Profile)** (siehe `Faying-Protocol`) prüfbare Delegationsketten über `Human Prime / Steward -> iFay Manager -> coFay` sowie Autorisierungsnachweise für doppelt signierte Eigentümerwechsel, ohne bestehende 1.0-Implementierungen zu brechen.
- **Abstimmung mit `SSP 1.0`**: Ruft ein externer Teilnehmer – typischerweise ein `iFay` im Rahmen des Mandats seines Human Prime – einen `coFay`-Skill auf, führt `InvocationRequest.caller.id` eine kanonische `FayID` mit. Der `coFay` setzt bei allen `restricted`- und `private`-Endpunkten sowohl beim Abruf des Deskriptors als auch bei der Skill-Ausführung gegenseitige Aufruferauthentifizierung durch (siehe `Skill-Sharing-Protocol`).
- **Abstimmung mit `CAP 1.0`**: Bewohnt und steuert ein `coFay` einen Kiosk- oder Unternehmensanwendungs-**Host** (Endgeräte-Hardware oder Softwareanwendung), gleicht der Host-Treiber den CAP-Autorisierungsdeskriptor mit `RoleCharter.allowed_capabilities.cap_bounds` ab und blockiert jeden Befehl, der `allowed_scopes` verlässt oder gegen `allow_irreversible_actions` verstößt (siehe `Control-Authority-Protocol`).

---

## 4.5 Revisionspfade für Vertretungshandlungen und Offline-Nachvollziehbarkeit

Für forensische Auswertungen bei Compliance-Prüfungen oder Vorfallsanalysen definiert `coFay` **Vertretungsnachvollziehbarkeit** als eigenständige semantische Invariante – unabhängig von externer Netzwerkerreichbarkeit oder einer aktiven Blockchain-Anbindung:

1. **Strikter Ausschluss der Nachahmung natürlicher Personen**: Jede externe Aussage, jede Skill-Antwort und jeder Host-Eingriff eines `coFay` erfolgt ausschließlich im Namen der verfassten öffentlichen Rolle unter ihrem verantwortlichen Eigentümer. Jeder Audit-Datensatz mit `acting_as_natural_person: true` schlägt bei der Validierung sofort mit `NATURAL_PERSON_IMPERSONATION_FORBIDDEN` fehl.
2. **Verpflichtender Drei-Tupel-Revisionsanker**: Jeder ausgehende Aufruf-, Freigabe- oder Änderungsdatensatz muss drei kryptografische Kennungen gemeinsam festhalten:
   - `cofay_id`: Kennung der öffentlichen Rolle, die die Handlung ausführt.
   - `owner_id`: Kennung des rechtlichen einschichtigen Eigentümers zum exakten Ausführungszeitpunkt.
   - `actor_signer_id`: Kennung des berechtigten Schlüsselinhabers, der die Aktion signiert hat (strikt begrenzt auf den `cofay_`-Rollenschlüssel selbst, `owner.id`, `steward_human_id` oder einen aktiven, in `managers` aufgeführten `ifay_`; jeder nicht gelistete Unterzeichner schlägt sofort mit `AUDIT_ACTOR_UNAUTHORIZED` fehl).
3. **Kontrollierter Offline-Betrieb**: Selbst in vollständig vom Netz getrennten Anlagen oder vor einer Anbindung an das `GMChain`-Mainnet bewahren lokale Audit-Protokolle im Modus `hash_chain` oder `append_only` den lückenlosen kryptografischen Nachweis über jedes Tripel `(cofay_id, owner_id, actor_signer_id)` und erlauben bei späterer Netzverbindung eine optionale gesammelte Prüfsummentestierung.
