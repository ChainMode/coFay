# 01. Überblick und ontologische Einordnung

## 1.1 Warum eine digitale Gesellschaft nicht allein aus individuellen Avataren bestehen kann

Je tiefer autonome und assistierende KI-Agenten in menschliche Kooperationsnetzwerke hineinwachsen, desto deutlicher stößt ein Ansatz an strukturelle Grenzen, der jede digitale Einheit als persönliches Spiegelbild eines bestimmten Menschen modelliert. Wenn eine Bürgerin einen kommunalen Genehmigungsantrag einreicht, ein Softwareentwickler eine Compliance-Prüfung bei einer Open-Source-Stiftung anfordert oder ein behördenübergreifender Krisenstab rund um die Uhr eine klinische Triage-Leitstelle kontaktiert, sucht der Aufrufer keine private Persönlichkeitskopie der gerade diensthabenden Sachbearbeiterin. Gefragt ist vielmehr eine **öffentliche soziale Rolle mit klaren Befugnisgrenzen, transparentem Leistungsvertrag und institutioneller Kontinuität, die über Schicht- und Personalwechsel hinweg unverändert bestehen bleibt**.

Um diese Grundanforderung direkt im Architekturkern zu verankern, legt das iFay-Ökosystem eine binäre ontologische Formel fest (siehe die Dachspezifikation in `ifay`):

`Fay = iFay + coFay`

In dieser Formel dient **`Fay`** ausschließlich als Oberbegriff für sämtliche digitalen Inkarnationen des Ökosystems; der Begriff darf niemals isoliert verwendet werden, um nur persönliche Avatare oder nur nicht-persönliche Einheiten zu bezeichnen. Das Ökosystem setzt sich aus zwei komplementären, orthogonalen Gattungen zusammen:

1. **`iFay` (`Individual Fay`, individueller digitaler Avatar)**: Abgeleitet von einer bestimmten natürlichen Person – dem **Human Prime** (kurz **Prime**) – und ausgestattet mit einem kompakten persönlichen **Ego**-Modell, das auf Werte, Präferenzen und Verhaltensgewohnheiten dieses Prime abgestimmt ist. Ein `iFay` agiert als persönliche Erweiterung seines Human Prime über digitale und physische **Hosts** hinweg (wobei `Host` ausschließlich Endgeräte-Hardware oder Softwareanwendungen bezeichnet, niemals einen Menschen).
2. **`coFay` (`Common Fay`, öffentliche Rolleninkarnation)**: Definiert und gesteuert durch eine normative **`RoleCharter`**, ist ein `coFay` eine öffentlich adressierbare, funktionale soziale Rolleninkarnation mit dem kanonischen Präfix `cofay_` (siehe `FayID`). Statt die private Persönlichkeit oder das episodische Gedächtnis eines Menschen nachzubilden, nimmt ein `coFay` öffentliche Aufgaben im Auftrag einer juristischen Organisation, eines institutionellen Governance-Amts oder eines gemeinschaftlichen Projekts wahr.

---

## 1.2 Die ontologische Trennlinie: Übertragbare Rollen-Assets gegenüber nicht übertragbaren persönlichen Erweiterungen

Was `coFay` und `iFay` im Kern trennt, ist weder das darunterliegende Sprachmodell noch der Container-Cluster im Rechenzentrum. Die eigentliche Grenze verläuft **ethisch, rechtlich und eigentumsrechtlich zwischen einem institutionellen Rollen-Asset und einer unveräußerlichen Erweiterung menschlicher Persönlichkeit**:

| Vergleichsdimension | `iFay` (Persönlichkeitserweiternder Fay) | `coFay` (Institutionelles Rollen-Asset) |
| :--- | :--- | :--- |
| **Ontologischer Kern** | Digitale Entsprechung des persönlichen Willens, der Präferenzen und Fähigkeiten eines Human Prime | Durch Charta verfasstes Amt, organisatorischer Serviceschalter oder kollaborativer Endpunkt |
| **Verhältnis zu natürlichen Personen** | Lebenslang 1:1 an einen einzigen Human Prime gebunden (ein Prime kann mehrere `iFay`-Instanzen besitzen); **strikt unverkäuflich und nicht übertragbar** | Einschichtige Eigentümerschaft unter `HumanID` oder `OrganizationID`; **unterstützt atomaren doppelt signierten Eigentümerwechsel** |
| **Außenvertretung** | Handelt ausschließlich im persönlichen Namen seines einzigen Human Prime | Erfüllt öffentliche Rollenpflichten im Namen seines **aktuellen verantwortlichen Eigentümers** (Organisation oder Einzelinhaber), ohne je eine natürliche Person zu imitieren |
| **Handlungsunfähigkeit oder Auflösung** | Geht beim Tod des Human Prime in treuhänderische Aufsicht oder eine eingeschränkte Gedenk-Sandbox über (siehe `ifay`) | Wechselt in die Bestandssperre `SUSPENDED_PENDING_SUCCESSION`, falls eine besitzende Organisation aufgelöst wird oder ihr menschlicher Steward vor einer Übergabe ausfällt (siehe `FayID`) |
| **Konto auf der Global Merit Chain (`GMChain`)** | An persönliche Reputation gebunden; postmortale Vererbung unterliegt gestuften Intimitätsabschlägen (siehe `Global-Merit-Chain`) | 1:1 an ein dediziertes Rollen-`MeritPocket` gebunden; ein gültiger doppelt signierter Eigentümerwechsel **wahrt die Rollenkontinuität ohne jeden Vererbungsabschlag auf `MeriToken`** |
| **Konformitätsinstanz** | **iFACTS** (iFay Architecture Conformance Test Suite) | **coFACTS** (Common Fay Architecture Conformance Test Suite) |

Werden diese beiden Gattungen vermischt, entstehen in beiden Richtungen gravierende Governance-Defizite. Wer einen unternehmerischen Kundendienst-Endpunkt als vermeintlich selbstbewusste „autonome digitale Person“ ausgibt, schafft eine Verantwortungs-Blackbox, hinter der sich Betreiber im Schadens- oder Haftungsfall verstecken können. Umgekehrt bindet ein Unternehmen, das den privaten `iFay` eines Mitarbeiters als offiziellen Vertragsschalter einsetzt, institutionelle Geschäftsbeziehungen und öffentliches Vertrauen an eine Privatidentität – mit der Folge, dass diese Bindung beim ersten Jobwechsel des Mitarbeiters zerbricht.

`coFay` löst dieses Dilemma durch institutionalisierte Rolleninkarnation auf: Das öffentliche Amt überdauert personelle Wechsel, seine Charta bleibt öffentlich nachprüfbar, die rechtliche Verantwortung greift eindeutig bis auf natürliche Personen durch, und der laufende Schichtbetrieb rotiert unterbrechungsfrei.

---

## 1.3 Vier gesellschaftliche Grundpfeiler adressierbarer öffentlicher Rollen

Auf Basis dieser binären Arbeitsteilung übernimmt `coFay` im Ökosystem vier tragende Infrastrukturfunktionen:

### 1. Entkopplung öffentlicher Serviceadressierung von der personellen Besetzung im Hintergrund
Ähnlich wie DNS-Domainnamen und standardisierte Service-Ports den Zugriff auf einen Netzwerkdienst davon gelöst haben, die private Telefonnummer eines bestimmten Systemadministrators zu wählen, erlaubt `coFay` es Human Primes (über ihre gesteuerten `iFay`-Avatare) sowie anderen `Fay`-Instanzen, funktionale Rollen direkt anzusprechen. Wer kommunale Steuerberatung benötigt, verbindet sich mit dem Steuerberatungs-`coFay`; wer eine Sicherheitslücke in einem Open-Source-Projekt meldet, kontaktiert den Sicherheits-`coFay` des Projekts. Aufrufer prüfen kryptografisch die `RoleCharter` und die Eigentümersignatur der jeweiligen `cofay_`-Kennung, ohne wissen zu müssen, welche delegierte Betreiberinstanz im Hintergrund gerade Schichtdienst hat.

### 2. Ausschluss herrenloser „autonomer Waisen-Agenten“
Nach den Governance-Invarianten des `Fay`-Ökosystems darf keine eigentümerlose, ungebundene KI außerhalb der Verantwortung natürlicher oder juristischer Personen operieren. Jeder `coFay` ist von seiner Entstehung an genau einem einschichtigen Eigentümer (`HumanID` oder `OrganizationID`) zugeordnet. Ist dieser Eigentümer eine Organisation, schreibt die Charta zusätzlich zwingend einen natürlichen Steward (`steward_human_id`) vor. Jeder ausgehende Skill-Aufruf, jeder Host-Steuerbefehl und jede Ledger-Transaktion lässt sich über eine lückenlose kryptografische Signaturkette sowohl auf den rechtlichen Eigentümer als auch auf den aktiv signierenden Akteur zurückführen.

### 3. Institutionelles Vertrauen über Personalwechsel hinweg aufbauen
Die gesellschaftliche Glaubwürdigkeit eines Bürgeramts, eines wissenschaftlichen Peer-Review-Gremiums, eines Open-Source-Maintainer-Teams oder eines gewerblichen Serviceschalters gehört zur langfristigen Leistungsbilanz dieser Rolle selbst. Da jede `cofay_`-Identität auf der **Global Merit Chain** (`GMChain`; siehe `Global-Merit-Chain`) 1:1 mit einem eigenen `MeritPocket` verknüpft ist, sammeln sich die durch nachgewiesene gesellschaftliche Beiträge erworbenen **MeriToken** (deren kleinste Rechnungseinheit `μ` bzw. **Merit Unit** lautet) kontinuierlich direkt unter der Rolle an. Als unverrückbare Ökosystem-Regel gilt: `MeriToken` ist ein strikt nicht-monetärer Maßstab für gesellschaftlichen Beitrag und Governance-Gewicht; `MeriToken` wird niemals geschürft, dient niemals der Spekulation, wird niemals ausgezahlt und ist niemals in beide Richtungen gegen Fiatwährung tauschbar.

### 4. Saubere Trennung öffentlicher Kooperationsräume vom Schutz privater Daten
Der persönliche `iFay` eines Human Prime verarbeitet sensible Lebensläufe, private Kommunikation und individuelle Vorlieben, die standardmäßig hinter strengen Datenschutzhürden abgeschirmt bleiben (siehe `FayID`). Ein `coFay` ist dagegen gezielt für öffentliche oder zugriffskontrollierte Kooperationsdomänen gebaut. Seine `cofay_`-Kennung, die besitzende Einheit, der Auftrag (`mission_statement`), die veröffentlichten Deskriptoren des **Skill Sharing Protocol** (`SSP`) sowie die verbotenen Handlungen sind in einer kryptografisch prüfbaren `RoleCharter` hinterlegt. Externe Aufrufer können damit vor der ersten Interaktion vollständige Zero-Trust-Compliance-Prüfungen ausführen.

---

## 1.4 Eigenständigkeit des einzelnen Repositorys und Autoritätsgrenzen zu Nachbarspezifikationen

Gemäß dem Konstruktionsprinzip **eigenständiger Einzel-Repositorys mit kontrollierter Offline-Fähigkeit** definiert dieses Repository den gesamten normativen Vertrag für `coFay` lokal: die drei Schichten umfassende, Ego-freie Rollenontologie, das Schema `RoleCharter` 1.0, die Regeln für Single-Hop-Betriebsdelegation, den atomaren doppelt signierten Eigentümerwechsel (`TransferEnvelope` 1.0) sowie die Prüfkriterien für `coFACTS` L1. Entwicklungsteams können `RoleCharter`-Dokumente und Vertretungsprotokolle in einer vollständig vom Netz getrennten Umgebung erstellen, validieren, übertragen und prüfen, ohne Verbindung zu externen Blockchain-Knoten oder Verzeichnisdiensten zu benötigen.

Zugleich wahrt diese Spezifikation strikt den Grundsatz **keiner doppelten Wahrheitsquelle** und verweist für grundlegende Basisprimitive normativ auf die zuständigen Nachbar-Repositorys:

- **Kanonische Kennungscodierung (`hid_` / `ifay_` / `cofay_` / `org_`), Holder-of-Key-Kryptografie und einfach verwurzelte Organisationsbäume**: Maßgeblich definiert in **FayID**.
- **Delegierte Stewardship-Handshakes zwischen Human Prime, `iFay`-Manager und `coFay` (`Faying 1.1` Delegated Stewardship Profile)**: Maßgeblich definiert in **Faying-Protocol**.
- **Skill-Erkennung, JWS-Deskriptorsignierung und Aufruferauthentifizierung**: Maßgeblich definiert in **Skill-Sharing-Protocol (`SSP`)**.
- **Endgeräte-Host-Berechtigungen und kontrollierte Ressourcengrenzen (einschließlich `Official_Post`-Amtssemantik)**: Maßgeblich definiert in **Control-Authority-Protocol (`CAP`)**.
- **On-Chain-Erfassung im `MeritPocket`, Abklingmathematik für nicht-monetäre `MeriToken` und gewichtete Governance-Abstimmungen**: Maßgeblich definiert in **Global-Merit-Chain (`GMChain`)**.
- **Übergreifende Vier-Schichten-Referenzarchitektur und `iFACTS`-Konformität individueller Avatare**: Maßgeblich definiert in **ifay**.
