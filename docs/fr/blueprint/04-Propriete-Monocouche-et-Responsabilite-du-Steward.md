# 04. Propriété monocouche, délégation orthogonale et responsabilité du steward

## 4.1 Pourquoi la propriété, la hiérarchie organisationnelle et la délégation opérationnelle doivent demeurer orthogonales

L'un des anti-patrons architecturaux les plus dangereux au sein d'un écosystème distribué d'agents à grande échelle consiste à fusionner en un seul arbre *qui possède juridiquement un agent*, *comment s'imbriquent sociétés mères et filiales* et *qui est habilité à opérer l'agent lors de la permanence du jour*. Autoriser un `coFay` à posséder un autre `coFay`, ou permettre à un `iFay` d'apparaître comme propriétaire juridique d'un `coFay`, engendre rapidement des chaînes opaques de sociétés écrans à sauts multiples : les auditeurs externes ne parviennent plus à déterminer quelle personne physique ou quelle entité juridique porte la responsabilité ultime, tandis que les simples rotations d'équipes provoquent des pannes d'autorisations en cascade.

Afin d'éliminer par construction toute ambiguïté liée aux structures écrans à sauts multiples, `coFay`, **FayID** et **Global Merit Chain** (`GMChain`) imposent de concert un **modèle à trois axes orthogonaux** dans l'ensemble des dépôts (voir `FayID` et `Global-Merit-Chain`) :

1. **Axe de propriété** : répond à la question *« Qui détient les droits patrimoniaux et la responsabilité juridique ultime sur ce `coFay` ? »* Strictement restreint à la **propriété monocouche**.
2. **Axe de hiérarchie organisationnelle** : répond à la question *« Comment une entreprise mère s'articule-t-elle avec ses divisions filiales ? »* Exprimé exclusivement au sein de l'arbre acyclique enraciné à parent unique propre à `OrganizationID` dans `FayID`, et jamais simulé par l'imbrication d'instances `coFay`.
3. **Axe de délégation opérationnelle** : répond à la question *« Quels avatars individuels sont habilités à opérer ce `coFay` au cours des quarts quotidiens ? »* Accordé de manière orthogonale au moyen de délégations `managers: iFayID[]` à un seul saut, sans modifier le `owner` sous-jacent.

---

## 4.2 Invariant de propriété monocouche et responsabilité du steward personne physique

Sous `RoleCharter` 1.0, chaque `coFay` possède à tout instant un et un seul propriétaire responsable (`owner`) :

- **Propriété directe par une personne physique** : `owner = { "type": "human", "id": "hid_<base32>" }`
- **Propriété directe par une organisation** : `owner = { "type": "organization", "id": "org_<slug|base32>" }`

Aussi bien l'évaluation par le schéma JSON que la validation à l'exécution rejettent de façon déterministe toute tentative de renseigner `owner.id` avec un identifiant `ifay_<base32>` ou `cofay_<base32>`, en renvoyant `OWNER_TYPE_FORBIDDEN`. Même lorsqu'une filiale propriétaire `org_sub` dispose d'une organisation mère enregistrée `org_parent` dans `FayID`, le champ `owner` du `coFay` doit désigner explicitement le détenteur direct `org_sub` et ne remonte jamais implicitement à l'entité mère.

### Steward personne physique obligatoire en cas de propriété organisationnelle
Une organisation est une abstraction juridique et institutionnelle : elle ne peut pas assurer matériellement elle-même la garde de clés cryptographiques matérielles ni exercer de supervision éthique humaine directe. C'est pourquoi `RoleCharter` 1.0 impose une règle stricte de pénétration de la responsabilité :

> **Tout `coFay` dont `owner.type === "organization"` doit déclarer explicitement un steward personne physique valide dans `steward_human_id` (formaté strictement selon `hid_<base32>`).**

- L'omission de `steward_human_id` dans le cadre d'une propriété organisationnelle échoue immédiatement avec `ORG_STEWARD_REQUIRED`.
- La fourniture d'un identifiant `ifay_` ou `cofay_` dans `steward_human_id` échoue immédiatement avec `STEWARD_MUST_BE_HUMAN`.

Cette règle garantit que, quelle que soit la complexité d'une entreprise ou d'une administration publique, chaque `coFay` actif de l'écosystème demeure ancré sur une personne physique identifiable de manière unique et directement responsable du respect de la charte.

---

## 4.3 Délégation opérationnelle `iFay` orthogonale à un seul saut et interdiction de sous-délégation

Dans l'exploitation quotidienne, un **Human Prime** propriétaire ou un steward organisationnel ne peut pas signer manuellement chaque mise à jour courante de configuration ou chaque routage de file vingt-quatre heures sur vingt-quatre. Pour prendre en charge des opérations de quart extensibles, le propriétaire ou le steward peut inscrire les avatars individuels d'un ou plusieurs Human Primes de confiance dans `RoleCharter.managers` (par exemple `["ifay_opsmanageralpha2345", "ifay_opsmanagerbravo2345"]`).

La délégation opérationnelle orthogonale applique trois invariants de sécurité stricts :

1. **La délégation opérationnelle n'altère jamais la propriété** : l'ajout ou le retrait d'entrées dans `managers` n'ajuste que la représentation opérationnelle courante ; `owner` demeure inchangé. Les gestionnaires opérationnels ne peuvent ni initier un transfert de propriété ni amender l'énoncé de mission ou les lignes rouges comportementales de la `RoleCharter`.
2. **Les délégués doivent être exclusivement des avatars `iFay`** : les actes de gestion courante doivent transiter par des avatars individuels directement gouvernés par des Human Primes responsables. Désigner un autre `coFay` comme gestionnaire du `coFay` courant est strictement rejeté avec `MANAGER_TARGET_INVALID`, ce qui empêche toute boucle de contrôle croisée entre rôles.
3. **Discipline stricte du saut unique (aucune sous-délégation)** : seuls `owner.id` ou `steward_human_id` sont habilités à émettre des modifications de délégation `GRANT` ou `REVOKE`. Si un gestionnaire déjà autorisé `ifay_A` tente de sous-déléguer des privilèges de gestion à `ifay_B`, le validateur rejette immédiatement la requête avec `MANAGER_REDELEGATION_FORBIDDEN`. L'application du saut unique coupe net toute propagation incontrôlée de privilèges.

---

## 4.4 Chaîne de responsabilité de bout en bout à travers cinq protocoles fondamentaux de l'écosystème

Comment un `coFay` conforme tisse-t-il ce modèle de responsabilité à travers l'ensemble de la pile protocolaire ? Le schéma ci-dessous retrace la topologie de coordination sur cinq dépôts, depuis l'enregistrement d'identité souveraine jusqu'à l'actionnement borné des hôtes et l'attribution du mérite :

```text
[FayID 1.0] Établit les identités holder-of-key hid_ / org_ / ifay_ / cofay_ & la propriété monocouche
     │
     ▼
[coFay RoleCharter 1.0] Le propriétaire ou le steward signe la charte : verrouille archétype, bornes SSP/CAP & managers[]
     │
     ├──▶ [Faying 1.1] (Profil d'intendance déléguée coFay)
     │      Vérifie la chaîne de justificatifs Human Prime / Steward ──▶ Gestionnaire iFay ──▶ coFay
     │
     ├──▶ [SSP 1.0 & CAP 1.0]
     │      Publie les descripteurs JWS signés par cofay_ ; pilote les hôtes terminaux dans cap_bounds
     │
     └──▶ [GMChain]
            Consigne les contributions sociales vérifiées sur le MeritPocket lié en 1:1 (MeriToken non monétaire)
```

Plus précisément, l'intégration inter-protocoles obéit à trois poignées de main normatives :

- **Alignement avec `Faying 1.1`** : tandis que `Faying 1.0` se concentre sur l'appairage 1:1 entre un Human Prime et son `iFay` personnel et reste figé tel que publié, l'extension rétrocompatible **`Faying 1.1` (profil d'intendance déléguée `coFay`)** (voir `Faying-Protocol`) transporte des chaînes vérifiables de délégation sur `Human Prime / Steward -> iFay Manager -> coFay`, ainsi que la sémantique d'autorisation des transferts de propriété à double signature, sans rompre la compatibilité avec les implémentations 1.0.
- **Alignement avec `SSP 1.0`** : lorsqu'un appelant externe (généralement un `iFay` opérant sous le mandat de son Human Prime) invoque une compétence `coFay`, `InvocationRequest.caller.id` transporte un `FayID` canonique, tandis que le `coFay` impose l'authentification mutuelle de l'appelant tant lors de la récupération du descripteur que lors de l'exécution de la compétence pour tous les points de terminaison `restricted` et `private` (voir `Skill-Sharing-Protocol`).
- **Alignement avec `CAP 1.0`** : chaque fois qu'un `coFay` habite et actionne un **hôte** (`Host`, terminal matériel ou application logicielle) de type borne interactive ou progiciel d'entreprise, le pilote de l'hôte évalue le descripteur d'autorisation CAP au regard de `RoleCharter.allowed_capabilities.cap_bounds`, en bloquant toute commande qui sort de `allowed_scopes` ou qui enfreint `allow_irreversible_actions` (voir `Control-Authority-Protocol`).

---

## 4.5 Pistes d'audit des actions représentatives et traçabilité hors ligne

Pour garantir une reconstitution forensique lors des revues de conformité ou des analyses post-incident, `coFay` définit la **traçabilité représentative** comme un invariant sémantique intrinsèque, indépendant de la joignabilité du réseau externe ou d'une connexion active à la chaîne de blocs :

1. **Zéro usurpation de personne physique** : chaque déclaration externe, réponse de compétence ou action sur un hôte émise par un `coFay` s'exécute exclusivement au nom du rôle public régi par charte sous l'autorité de son propriétaire responsable. Tout enregistrement d'audit portant `acting_as_natural_person: true` échoue immédiatement à la validation avec `NATURAL_PERSON_IMPERSONATION_FORBIDDEN`.
2. **Ancre d'audit obligatoire à trois identifiants** : tout enregistrement sortant d'invocation, de validation ou de mutation d'état doit conserver conjointement trois identifiants cryptographiques :
   - `cofay_id` : identifiant du rôle public accomplissant l'action.
   - `owner_id` : identifiant du propriétaire juridique monocouche à l'horodatage exact de l'exécution.
   - `actor_signer_id` : identifiant du détenteur de clé autorisé ayant signé l'action (strictement limité à la clé de rôle `cofay_` elle-même, à `owner.id`, à `steward_human_id` ou à un `ifay_` actif figurant dans `managers` ; tout signataire non répertorié échoue immédiatement avec `AUDIT_ACTOR_UNAUTHORIZED`).
3. **Dégradation gracieuse hors ligne** : même lorsqu'un déploiement fonctionne au sein d'une installation isolée (*air-gapped*) ou avant son raccordement au réseau principal `GMChain`, les journaux d'audit locaux en mode `hash_chain` ou `append_only` préservent une preuve cryptographique intégrale sur chaque triplet `(cofay_id, owner_id, actor_signer_id)`, permettant un ancrage facultatif par lots d'empreintes dès le rétablissement de la connectivité.
