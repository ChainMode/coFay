# 03. Taxonomie des rôles publics et scénarios d'application

## 3.1 Pourquoi `RoleCharter` 1.0 établit une taxonomie canonique des rôles

Au sein des institutions réelles, les rôles publics couvrent la délivrance de permis municipaux, l'assistance d'entreprise, l'audit réglementaire, la recherche scientifique conjointe et la gouvernance open source. Traiter tous les rôles publics comme un bloc indifférencié dans `RoleCharter` 1.0 ou, à l'extrême opposé, figer dans le protocole des centaines de catégories sectorielles nuirait à son intégrité : un modèle non typé ne peut pas imposer de garde-fous de sécurité par défaut adaptés à des degrés d'autorité institutionnelle distincts, tandis qu'une énumération sectorielle tentaculaire fragmenterait l'interopérabilité inter-domaines.

Pour concilier précision et extensibilité, `coFay` classe les rôles publics selon trois caractéristiques structurelles orthogonales : **la topologie de service externe, le périmètre de pouvoir discrétionnaire et le cycle de vie du siège**. La combinaison de ces trois axes produit trois valeurs canoniques de `role_archetype` dans la version 1.0 :

1. **`org_service` (Guichet organisationnel de service public)**
2. **`functional_post` (Poste fonctionnel statutaire ou de gouvernance)**
3. **`project_collaborator` (Unité collaborative de projet ou à vocation spécifique)**

Tout document `RoleCharter` 1.0 valide doit déclarer exactement l'une de ces trois valeurs dans `role_archetype` ; toute chaîne non reconnue échoue immédiatement à la validation avec `ROLE_ARCHETYPE_INVALID`.

---

## 3.2 Archétype 1 : `org_service` (Guichet organisationnel de service public)

### Positionnement et caractéristiques distinctives
`org_service` représente une **façade normalisée de renseignement, de dépôt de dossiers et d'exécution de compétences** exploitée vers l'extérieur par une entreprise, une administration publique, une association professionnelle ou un entrepreneur individuel. Il s'agit de l'archétype que les appelants externes rencontrent le plus fréquemment dans leurs interactions quotidiennes.

- **Structure de propriété typique** : généralement détenu par un `OrganizationID` (tel que `org_civic-service-bureau`) associé à un steward personne physique obligatoire (`steward_human_id`) ; les cabinets indépendants ou praticiens individuels agréés peuvent également ancrer `owner` directement sur un `HumanID`.
- **Profil d'autonomie CAP recommandé** : habituellement configuré sur `assistive` ou `delegated` avec `allow_irreversible_actions` fixé à `false`. Ce profil autorise la consultation automatisée des règles, le tri des demandes, la prise de rendez-vous et l'exécution de compétences normalisées, tout en remontant les engagements juridiques ou administratifs irréversibles au steward humain ou à un gestionnaire `iFay` autorisé.
- **Schéma d'exposition des compétences SSP** : associe des compétences de renseignement `public` sans authentification (barèmes tarifaires ou listes de pièces justificatives, par exemple) à des compétences `restricted` de dépôt et de suivi de dossier exigeant l'authentification de l'appelant (`require_caller_auth: true`).

### Scénario de production : guichet municipal de permis et de renseignement public
Un bureau municipal de services administratifs déploie `cofay_orgservicedesk234567` comme guichet public de délivrance de permis. Plutôt que de parcourir des portails administratifs morcelés, un administré confie cette instruction à son `iFay` personnel : *« Vérifie les démarches de sécurité incendie et d'immatriculation commerciale requises pour ouvrir une librairie de quartier. »*

1. Le `iFay` de l'administré découvre le `coFay` municipal via **SSP** et vérifie d'abord la revendication de propriété `org_civic-service-bureau` ainsi que la signature Ed25519 du steward humain apposée sur son document `RoleCharter` 1.0.
2. Une fois cette vérification accomplie, le `iFay` de l'administré invoque la compétence `public` de liste de pièces puis, après confirmation explicite de son **Human Prime**, soumet un dossier de pré-instruction via la compétence de dépôt `restricted`.
3. Derrière cette unique identité `cofay_`, des dizaines de répliques d'exécution sans état absorbent en parallèle le pic d'affluence matinal, en estampillant chaque récépissé de pré-instruction d'un triplet de provenance auditable `(cofay_id, owner_id, actor_signer_id)`.

---

## 3.3 Archétype 2 : `functional_post` (Poste fonctionnel statutaire ou de gouvernance)

### Positionnement et caractéristiques distinctives
`functional_post` modélise un **siège institutionnel permanent investi d'une autorité explicite par charte, de devoirs d'attestation de conformité ou d'un pouvoir de validation opérationnelle** au sein d'une organisation, d'un consortium inter-entités ou d'une infrastructure d'écosystème. Son principe directeur est la permanence institutionnelle : *la fonction demeure tandis que les titulaires se succèdent*.

- **Structure de propriété typique** : détenu par un conseil de gouvernance, une fondation ou un organe de contrôle interne d'entreprise (`OrganizationID`) et lié strictement au titulaire personne physique en exercice via `steward_human_id`.
- **Alignement sémantique avec `Official_Post` de CAP** : dans le cadre du **Control Authority Protocol** (`CAP`), les hôtes (`Hosts`) physiques hautement sensibles et les opérations d'infrastructure critique exigent des descripteurs d'autorisation émis ou contresignés par un poste institutionnel (`Official_Post` ; voir `Control-Authority-Protocol`). Un `coFay` de type `functional_post` constitue le porteur normatif de cette sémantique au niveau de la couche de rôle et peut déclarer `cap_bounds.max_autonomy_tier: "official_post"`.
- **Rotation des mandats et continuité ininterrompue de la réputation** : lorsqu'un auditeur en chef de la sécurité achève son mandat et qu'un successeur entre en fonction, l'organisation propriétaire met à jour `steward_human_id` ainsi que le tableau des délégués de quart actifs `managers: iFayID[]`, puis publie une charte `RoleCharter` incrémentée (`charter_revision + 1`). Tout au long de la transition, l'identifiant `cofay_` du siège, les abonnements des observateurs externes et l'historique du `MeritPocket` se poursuivent sans la moindre interruption.

### Scénarios de production : siège d'audit de sécurité d'écosystème et poste de régulation logistique à basse altitude
- **Siège d'audit de sécurité d'écosystème** : un consortium de sécurité open source institue un siège permanent de divulgation de vulnérabilités et d'attestation de correctifs, `cofay_govpostauditor234567`. Les projets membres transmettent directement leurs avis de sécurité à ce siège ; les chercheurs en sécurité de garde opèrent le siège par l'intermédiaire de leurs délégués gestionnaires `iFay` autorisés afin de reproduire les failles et de contresigner les avis de remédiation, ce qui permet aux utilisateurs en aval d'ancrer leur confiance sur une chaîne unique et pérenne de clés de poste.
- **Poste de régulation d'espace aérien à basse altitude sur campus** : l'autorité d'un parc industriel exploite un `coFay` de type `functional_post` dédié à la régulation aérienne, interfacé via CAP et DTP avec des hôtes drones de livraison autonomes. Lorsqu'un cisaillement de vent sévère franchit les seuils de sécurité fixés par la charte, le poste émet de manière déterministe des directives d'immobilisation au sol sur les couloirs de vol actifs, à l'intérieur de ses périmètres CAP bornés.

---

## 3.4 Archétype 3 : `project_collaborator` (Unité collaborative de projet ou à vocation spécifique)

### Positionnement et caractéristiques distinctives
`project_collaborator` est conçu spécifiquement pour les dépôts open source, les programmes de recherche inter-institutionnels, les groupes de travail de normalisation et les initiatives d'ingénierie inter-entreprises. Il agit comme un **point de terminaison équipier partagé qui fédère les graphes de connaissances métier, les chaînes de vérification automatisées et les flux de travail collaboratifs**.

- **Cycle de vie typique de la propriété** : fréquemment initialisé sous le `HumanID` personnel du fondateur du projet durant la phase d'incubation initiale. Une fois l'initiative arrivée à maturité et rattachée à une fondation open source ou à un institut de recherche formel, le transfert atomique de propriété à double signature (`TransferEnvelope` 1.0) transmet proprement le `coFay` à l'`OrganizationID` de la fondation, sans rompre la moindre référence de point de terminaison `cofay_` configurée par les contributeurs externes.
- **Adéquation à la collaboration multi-protocoles** : se combine naturellement avec l'**Interactive Conversation Protocol** (`ICP`) pour produire des annotations de revue structurées `.ctx` sur des brouillons de RFC, des manuscrits ou des spécifications de code, ainsi qu'avec le **Telepathy Protocol** (`TP`) pour coordonner des espaces de travail partagés bornés entre les avatars `iFay` individuels des contributeurs (voir `Interactive-Conversation-Protocol` et `Telepathy-Protocol`).

### Scénario de production : robot collaboratif de recherche inter-institutionnelle et de conformité protocolaire
Un groupe de travail multilingue consacré aux protocoles ouverts déploie `cofay_ossprojectbot234567` sous l'archétype `project_collaborator`. Répartis sur tous les fuseaux horaires, les contributeurs connectent directement leurs avatars `iFay` personnels à l'unité sans attendre le réveil des mainteneurs humains : le `coFay` exécute les vecteurs de conformité, audite les invariants terminologiques sur neuf langues et renvoie des annotations de revue structurées `.ctx`. À mesure que les pairs contributeurs valident sur **Global Merit Chain** (`GMChain`) les revues à forte valeur ajoutée, l'attribution de **MeriToken** non monétaire s'accumule continûment dans le `MeritPocket` dédié de l'unité, reflétant en toute transparence l'impact public du projet collaboratif.

---

## 3.5 Comparaison des profils de capacités entre les trois archétypes de rôles

| Dimension | `org_service` | `functional_post` | `project_collaborator` |
| :--- | :--- | :--- | :--- |
| **Objectif principal de conception** | Accueil normalisé à haute simultanéité pour usagers ou clients | Gouvernance permanente strictement responsable, validation et attestation de conformité | Synthèse des connaissances métier, coordination R&D multipartite et intendance transférable |
| **Propriétaire monocouche typique** | `OrganizationID` (ou `HumanID` d'entrepreneur individuel) | `OrganizationID` (avec steward personne physique obligatoire) | `HumanID` en phase d'incubation ; souvent transféré à un `OrganizationID` à maturité |
| **Visibilité typique des compétences SSP** | Combinaison de renseignement `public` + dépôt `restricted` | Principalement `restricted` ou `private` avec authentification obligatoire de l'appelant | `public` (collaboration open source) ou `restricted` (membres d'un consortium) |
| **Palier plafond CAP typique** | `assistive` / `delegated` | `delegated` / `official_post` | `assistive` / `delegated` |
| **Transition canonique du cycle de vie** | Rotation des quarts entre les `managers` opérationnels | Passation de mandat du steward titulaire (`cofay_` inchangé) | Transfert de propriété à double signature du fondateur individuel vers une fondation |
