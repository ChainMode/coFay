# 02. Architecture à trois couches (sans couche Ego) et charte de rôle

## 2.1 Élagage architectural de la pile à quatre couches dans coFay

La spécification chapeau `ifay` définit une architecture de référence canonique à quatre couches composée de la **couche sociale** (*Social Layer*), de la **couche d'interaction** (*Interaction Layer*), de la **couche cognitive** (*Cognition Layer*) et de la **couche Ego** (*Ego Layer*). Sur l'ensemble de ces quatre couches, les deux espèces de `Fay` divergent selon une frontière structurelle nette : un `iFay` individuel monte les quatre couches, tandis que **`coFay` se compose exclusivement des couches sociale, d'interaction et cognitive, et interdit strictement le montage d'une couche Ego**.

```text
┌───────────────────────────────────────────────────────────────────────┐
│  [ ÉLAGUÉE / STRICTEMENT INTERDITE ] Couche Ego                       │
│  x Ne réplique jamais la mémoire d'une persona personnelle            │
│  x Ne monte jamais de paquetages de réplique personnelle @ego-models/*│
├───────────────────────────────────────────────────────────────────────┤
│  Chapeau de gouvernance : RoleCharter 1.0 (Ed25519 + RFC 8785 JCS)    │
│  + Énoncé de mission     + Limites de capacités SSP/CAP               │
│  + Lignes rouges claires + Politique d'audit infalsifiable            │
├───────────────────────────────────────────────────────────────────────┤
│  Couche 3 : Couche cognitive (Cognition Layer)                        │
│  - Raisonnement métier et orchestration des flux de travail           │
│  - Évaluation des politiques institutionnelles et routage déterministe│
├───────────────────────────────────────────────────────────────────────┤
│  Couche 2 : Couche d'interaction (Interaction Layer)                  │
│  - Dialogue structuré (ICP) et coordination à haut débit (TP)         │
│  - Opérations sur hôtes terminaux bornées par charte via CAP et DTP   │
├───────────────────────────────────────────────────────────────────────┤
│  Couche 1 : Couche sociale (Social Layer)                             │
│  - Cycle de vie de l'identité cofay_ et des justificatifs             │
│  - Publication JWS de compétences SSP et liaison MeritPocket GMChain  │
└───────────────────────────────────────────────────────────────────────┘
```

Pourquoi un `coFay` ne doit-il jamais posséder de couche Ego ? Cette interdiction ne relève pas d'une limite technique quant au chargement d'adaptateurs affinés ; elle découle de trois invariants de gouvernance non négociables :

1. **Prévenir toute fausse représentation anthropomorphique auprès du public** : la seule raison d'être de la couche Ego (voir `Ego`) consiste à reproduire la hiérarchie de valeurs personnelles, la cadence émotionnelle et la mémoire épisodique privée d'un **Human Prime** précis. Monter le paquetage Ego privé d'une personne physique au sein d'un guichet municipal public ou d'un poste d'examen réglementaire introduirait des biais cognitifs privés dans l'instruction institutionnelle, tout en induisant les appelants externes en erreur en leur laissant croire qu'ils conversent en privé avec cet individu.
2. **Garantir une cohérence sans état entre les répliques horizontales** : les points de terminaison de rôles publics traitent couramment des milliers de sessions collaboratives simultanées. Si les instances d'exécution s'appuyaient sur une couche Ego sujette à une dérive subjective ou à une mémoire privée locale, des répliques parallèles rendraient des décisions contradictoires face à des règles institutionnelles identiques. L'élagage de la couche Ego garantit que la même `RoleCharter` signée et le même corpus de connaissances métier gouvernent chaque réplique d'exécution de façon déterministe.
3. **Éliminer toute fuite de données personnelles lors d'un transfert de propriété** : en tant qu'actif institutionnel de rôle, un `coFay` peut être transféré entre propriétaires responsables. Si des fragments de l'état Ego personnel d'un ancien steward ou opérateur subsistaient dans l'environnement d'exécution du rôle, un transfert de propriété provoquerait une exposition critique de données personnelles. En conséquence, dès que le validateur détecte la moindre propriété interdite de réplique personnelle (`ego_package`, `ego_model`, `ego_profile`, `human_prime_id` ou `personal_persona`), il interrompt immédiatement l'évaluation avec l'erreur bloquante `COFAY_EGO_FORBIDDEN`.

---

## 2.2 Répartition fonctionnelle des trois couches d'exécution actives

Une fois la couche Ego structurellement retirée, les trois couches restantes coopèrent autour d'un objectif unique : l'exécution fidèle de la charte publique `RoleCharter`.

### 1. Couche sociale : identité publique, justificatifs vérifiables et façade de service
La couche sociale gère l'identité réseau vérifiable et les contrats de service externes du `coFay` :

- Protège l'identifiant canonique `cofay_<base32>` ainsi que ses justificatifs cryptographiques de preuve de possession (*holder-of-key*, voir `FayID`).
- Publie des descripteurs de compétences JWS signés par `cofay_` via le **Skill Sharing Protocol** (`SSP` ; voir `Skill-Sharing-Protocol`), en répartissant les points de terminaison exposés selon trois paliers de visibilité explicites : `public` (requêtes ouvertes sans authentification), `restricted` (invocations authentifiées de partenaires ou d'usagers) et `private` (opérations administratives internes).
- Maintient la référence d'attribution au registre (`gmc_merit_pocket_ref`) pointant vers le `MeritPocket` lié en 1:1 au rôle sur **Global Merit Chain** (`GMChain`), afin d'y consigner le **MeriToken** non monétaire acquis grâce au service collaboratif vérifié (voir `Global-Merit-Chain`).

### 2. Couche d'interaction : engagement multimodal et actionnement borné des hôtes
La couche d'interaction normalise à la fois les canaux entrants de collaboration avec les appelants externes et l'actionnement sortant des **hôtes** (`Hosts`) habités (où `hôte` / `Host` désigne exclusivement des terminaux matériels ou des applications logicielles) :

- **Engagement protocolaire entrant** : prend en charge des flux de travail riches en contexte avec annotations structurées sur l'**Interactive Conversation Protocol** (`ICP` ; voir `Interactive-Conversation-Protocol`), ainsi que des sessions d'alignement d'objectifs et de consultation inter-Fay à haut débit sur le **Telepathy Protocol** (`TP` ; voir `Telepathy-Protocol`).
- **Contrôle sortant borné des hôtes** : chaque fois qu'un rôle public pilote des files logicielles d'entreprise, des capteurs environnementaux ou des bornes hôtes dédiées, toute commande doit s'exécuter via le **Control Authority Protocol** (`CAP`) et le **Data Tunnel Protocol** (`DTP`), strictement dans le périmètre déclaré par `RoleCharter.allowed_capabilities.cap_bounds` (voir `Control-Authority-Protocol` et `Data-Tunnel-Protocol`). Les ressources hôtes non répertoriées demeurent inaccessibles par conception.

### 3. Couche cognitive : raisonnement métier contrôlé par charte et orchestration des compétences
La couche cognitive constitue le moteur de raisonnement métier du `coFay` et s'assemble de manière déclarative au sein de l'environnement d'exécution de conteneurs **FayGer** (voir `FayGer`) :

- Monte les corpus réglementaires propres au rôle, les index architecturaux ou les procédures opérationnelles normalisées (SOP).
- Applique une **barrière obligatoire de politique de charte** (*Charter Policy Gate*) avant d'émettre tout engagement externe ou toute commande vers un hôte, en confrontant chaque action proposée à la liste blanche `allowed_capabilities` et au tableau de lignes rouges `prohibited_actions`. Toute action qui heurte une ligne rouge ou dépasse `max_autonomy_tier` (par exemple la tentative d'une mutation d'état irréversible alors que `allow_irreversible_actions` vaut `false`) suspend automatiquement l'exécution et déclenche une escalade vers le steward humain responsable ou vers un gestionnaire opérationnel `iFay` autorisé.

---

## 2.3 `RoleCharter` 1.0 : la constitution institutionnelle qui remplace la couche Ego

Là où un modèle `Ego` répond, pour un `iFay`, à la question *« De qui suis-je la réplique personnelle et quelles sensibilités propres dois-je respecter ? »*, **`RoleCharter` 1.0** (URI de schéma normatif : `https://ifay.ai/schemas/cofay-role-charter-1.0.json`) répond, pour un `coFay`, à la question *« Quel mandat public j'accomplis, qui me possède, quelle personne physique en répond, quelles capacités puis-je exercer et quelles lignes rouges ne dois-je jamais franchir ? »*.

Un document `RoleCharter` 1.0 conforme s'articule autour de cinq blocs structurels normatifs :

### (1) Bloc de métadonnées d'identité et de révision
- `schema_version` : fixé à la chaîne à deux segments `"1.0"`.
- `charter_id` (`chr_<base32>`) et l'entier strictement positif `charter_revision` : établissent une ancre de version sans ambiguïté pour chaque amendement de charte.
- `cofay_id` (`cofay_<base32>`), `display_name` lisible par l'humain et `role_archetype` (l'un des trois archétypes canoniques de rôles publics).
- `lifecycle_state` : déclare explicitement `"ACTIVE"`, `"SUSPENDED_PENDING_SUCCESSION"` (gel conservatoire dans l'attente d'une succession) ou `"REVOKED"` (mis hors service définitivement).
- `transfer_nonce` : initialisé à `0` et incrémenté strictement de `1` uniquement lors de chaque transfert valide de propriété à double signature.

### (2) Bloc d'ancrage de responsabilité et de délégation orthogonale
- `owner` : référence de propriété monocouche désignant soit `human` (`hid_<base32>`), soit `organization` (`org_<slug|base32>`).
- `steward_human_id` : identifiant obligatoire du steward personne physique (`hid_<base32>`) dès lors que `owner.type === "organization"`, garantissant que la responsabilité organisationnelle remonte directement à un être humain identifiable.
- `managers` : zéro ou plusieurs identifiants de délégués opérationnels orthogonaux (`ifay_<base32>[]`).

### (3) Bloc d'énoncé de mission, de liste blanche de capacités et de lignes rouges comportementales
- `mission_statement` : énoncé publiquement vérifiable de la finalité institutionnelle et du périmètre de service.
- `allowed_capabilities.ssp_skills` : déclarations par compétence précisant l'URI de la compétence (`skill_ref`), le palier `visibility` et la barrière d'authentification de l'appelant (`require_caller_auth`). Règle normative impérative : toute compétence dont `visibility` vaut `"restricted"` ou `"private"` **doit** imposer `require_caller_auth: true` (toute infraction échoue immédiatement avec `SSP_AUTH_REQUIRED_FOR_NON_PUBLIC`), empêchant ainsi que la dissimulation dans un annuaire ne se substitue à une authentification cryptographique de l'appelant.
- `allowed_capabilities.cap_bounds` : encadre les périmètres de permissions CAP autorisés (`allowed_scopes`), le palier plafond d'autonomie (`assistive`, `delegated` ou `official_post`) et l'autorisation d'actionnement irréversible (`allow_irreversible_actions`).
- `prohibited_actions` : tableau non vide de lignes rouges de conformité lisibles par machine.

### (4) Bloc autonome de politique d'audit local (`audit_policy`)
- Précise la durée minimale de conservation des journaux (`retention_days`), le mode de stockage infalsifiable (`hash_chain` ou `append_only`) et la traçabilité obligatoire de l'acteur (`require_actor_trace: true`).
- Exige que chaque entrée du journal d'actions représentatives sortantes consigne le triplet canonique `(cofay_id, owner_id, actor_signer_id)` tout en interdisant strictement `acting_as_natural_person: true` (`NATURAL_PERSON_IMPERSONATION_FORBIDDEN`), préservant ainsi une auditabilité probatoire complète même sur des réseaux locaux isolés.

### (5) Bloc de signature de propriété RFC 8785 JCS + Ed25519 (`owner_signature`)
Afin d'éliminer les échecs de vérification de signature inter-langages provoqués par des différences d'ordre de clés JSON ou de mise en forme des espaces, `RoleCharter` 1.0 impose une signature déterministe : le signataire sérialise la charge utile de la charte (dépourvue de `owner_signature`) en octets UTF-8 canoniques selon la norme **RFC 8785 JSON Canonicalization Scheme (JCS)**, préfixe l'étiquette explicite de séparation de domaine `"ifay.cofay.role-charter.v1\0"`, puis signe la séquence d'octets obtenue à l'aide de la clé privée Ed25519 de `owner.id` ou de `steward_human_id`. La modification d'un seul caractère où que ce soit dans la charte déclenche de façon déterministe `CHARTER_SIGNATURE_INVALID`.
