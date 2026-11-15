# 01. Aperçu et positionnement ontologique

## 1.1 Pourquoi une société numérique ne peut pas reposer uniquement sur des avatars individuels

À mesure que des agents d'IA autonomes et d'assistance s'intègrent dans les réseaux de collaboration humaine, modéliser chaque entité numérique comme le miroir personnel d'une personne physique précise se heurte rapidement à une impasse structurelle. Lorsqu'un citoyen dépose une demande d'autorisation municipale, lorsqu'un ingénieur logiciel sollicite un audit de conformité auprès d'une fondation open source, ou lorsqu'une cellule interministérielle se connecte au poste de triage continu d'un hôpital, l'appelant ne cherche pas la réplique privée de la personnalité de l'agent de permanence. Ce dont il a besoin, c'est d'un **rôle social public doté de limites d'autorité explicites, d'un contrat de service transparent et d'une continuité institutionnelle qui perdure sans rupture lors des rotations d'effectifs**.

Pour répondre à cette exigence fondamentale dès la racine architecturale, l'écosystème iFay établit une formule ontologique binaire (voir la spécification chapeau dans `ifay`) :

`Fay = iFay + coFay`

Dans cette formule, **`Fay`** constitue strictement le terme générique englobant toutes les incarnations numériques de l'écosystème ; il ne doit jamais être employé isolément pour désigner uniquement des avatars personnels ou uniquement des entités non personnelles. Deux espèces complémentaires et orthogonales composent cet écosystème :

1. **`iFay` (`Individual Fay`, avatar numérique individuel)** : instancié à partir d'une personne physique déterminée, appelée **Human Prime** (ou **Prime**), et doté d'un modèle personnel compact **Ego** aligné sur les valeurs, les préférences et les habitudes comportementales de ce Prime. Un `iFay` agit comme le prolongement personnel du Human Prime à travers des **hôtes** (`Hosts`) numériques et physiques (où `hôte` / `Host` désigne exclusivement des terminaux matériels ou des applications logicielles, jamais des êtres humains).
2. **`coFay` (`Common Fay`, incarnation de rôle public)** : défini et gouverné par une charte normative **`RoleCharter`**, un `coFay` est une incarnation fonctionnelle de rôle social publiquement adressable, identifiée par le préfixe canonique `cofay_` (voir `FayID`). Plutôt que de reproduire la personnalité privée ou la mémoire épisodique d'une personne physique, un `coFay` exerce des fonctions publiques pour le compte d'une organisation reconnue juridiquement, d'un poste de gouvernance institutionnelle ou d'un projet collaboratif.

---

## 1.2 La ligne de partage ontologique : actifs de rôle transférables contre prolongements personnels inaliénables

L'axe fondamental qui sépare `coFay` et `iFay` ne réside ni dans le modèle de fondation sous-jacent ni dans la grappe de calcul qui exécute le conteneur. La véritable frontière est une **distinction éthique, juridique et patrimoniale entre un actif institutionnel de rôle et un prolongement inaliénable de la personne physique** :

| Dimension de comparaison | `iFay` (Fay prolongement de persona) | `coFay` (Fay actif institutionnel de rôle) |
| :--- | :--- | :--- |
| **Essence ontologique** | Réplique numérique de la volonté personnelle, des préférences et des capacités d'un Human Prime | Poste social doté d'une charte, guichet de service organisationnel ou point de terminaison collaboratif |
| **Relation aux personnes physiques** | Lié à vie selon un rapport 1:1 à un unique Human Prime (un même Prime peut posséder plusieurs instances `iFay`) ; **jamais vendu ni transféré** | Propriété monocouche sous `HumanID` ou `OrganizationID` ; **prend en charge le transfert atomique de propriété à double signature** |
| **Capacité de représentation externe** | Agit exclusivement au nom personnel de son unique Human Prime | Exerce des missions de rôle public pour le compte de son **propriétaire responsable actuel** (organisation ou entrepreneur individuel), sans jamais usurper l'identité d'une personne physique |
| **Traitement de l'incapacité ou de la dissolution** | Bascule au décès du Human Prime sous la supervision d'un tuteur ou dans un bac à sable mémoriel restreint (voir `ifay`) | Entre dans l'état de gel conservatoire `SUSPENDED_PENDING_SUCCESSION` si l'organisation propriétaire est dissoute ou si son steward humain est frappé d'incapacité avant la passation (voir `FayID`) |
| **Compte Global Merit Chain (`GMChain`)** | Lié à la réputation personnelle ; la succession post-mortem applique une décote stricte par paliers d'intimité (voir `Global-Merit-Chain`) | Lié en 1:1 à un `MeritPocket` dédié au rôle ; un transfert valide à double signature **préserve la continuité du rôle sans aucune décote successorale sur le `MeriToken`** |
| **Autorité de conformité** | **iFACTS** (iFay Architecture Conformance Test Suite) | **coFACTS** (Common Fay Architecture Conformance Test Suite) |

Brouiller la frontière entre ces deux espèces engendre de graves défaillances de gouvernance dans les deux sens. Présenter le point de terminaison d'assistance clientèle d'une entreprise comme une « personne numérique autonome » consciente crée une boîte noire d'irresponsabilité destinée à soustraire les opérateurs à leurs obligations juridiques et éthiques en cas de manquement ou de préjudice. Inversement, réquisitionner le `iFay` personnel d'un salarié comme guichet contractuel officiel d'une entreprise attache les relations institutionnelles et la confiance publique à une identité privée qui se rompt dès que ce collaborateur change d'employeur.

`coFay` élimine ce dilemme grâce à l'incarnation institutionnalisée du rôle : le siège public perdure au-delà des mouvements de personnel, sa charte de gouvernance demeure publiquement vérifiable, la responsabilité juridique remonte sans ambiguïté jusqu'à des personnes physiques et les équipes opérationnelles se relaient en continu sans interruption de service.

---

## 1.3 Les quatre piliers sociétaux des rôles publics adressables

Une fois cette division binaire du travail établie, `coFay` remplit quatre fonctions d'infrastructure irremplaçables au sein de l'écosystème :

### 1. Découpler l'adressage du service public de l'affectation des équipes en coulisses
De la même manière que les noms de domaine DNS et les ports de service normalisés ont découplé l'accès à un service réseau de l'appel téléphonique direct à l'opérateur d'une machine, `coFay` permet aux Human Primes (agissant via des avatars `iFay` gouvernés) et aux instances `Fay` paires d'adresser directement des rôles fonctionnels. Les appelants qui recherchent des informations fiscales municipales se connectent au `coFay` d'orientation fiscale ; ceux qui signalent une vulnérabilité open source se connectent au `coFay` du poste de sécurité du projet. L'appelant vérifie cryptographiquement la `RoleCharter` et la signature de propriété associées à l'identifiant `cofay_` sans avoir besoin de savoir quelle instance opérationnelle déléguée assure la permanence derrière le point de terminaison.

### 2. Éliminer les « agents autonomes orphelins » sans responsable
Selon les invariants de gouvernance de l'écosystème `Fay`, aucune « IA autonome sauvage » dépourvue de propriétaire ne peut opérer en dehors de la responsabilité d'une personne physique ou d'une entité juridique. Dès sa création, chaque `coFay` s'ancre à un et un seul propriétaire monocouche (`HumanID` ou `OrganizationID`). Dès lors que le propriétaire est une organisation, la charte impose en outre un steward personne physique explicite (`steward_human_id`). Chaque invocation sortante de compétence, chaque requête de contrôle d'un hôte (`Host`) et chaque interaction avec le registre remonte de façon déterministe, le long d'une chaîne de signatures cryptographiques, à la fois au propriétaire juridique et à l'acteur signataire actif.

### 3. Capitaliser la confiance publique institutionnelle au fil des transitions de personnel
La crédibilité sociétale d'un guichet municipal, d'un siège de comité de lecture académique, d'un collectif de mainteneurs open source ou d'une vitrine de service commercial appartient à l'historique institutionnel bâti par ce rôle dans la durée. En liant en 1:1 un `MeritPocket` dédié à chaque identité `cofay_` sur **Global Merit Chain** (`GMChain` ; voir `Global-Merit-Chain`), le **MeriToken** (dont la plus petite unité comptable est `μ` / **Merit Unit**) acquis grâce à des contributions sociales vérifiées s'accumule continûment au titre du rôle lui-même. Ligne rouge immuable de l'écosystème : `MeriToken` est une mesure strictement non monétaire de contribution sociale et de poids de gouvernance, qui n'est jamais minée, jamais soumise à la spéculation, jamais convertible en espèces et non échangeable dans les deux sens contre une monnaie fiduciaire.

### 4. Isoler les plans de collaboration publique de la vie privée personnelle
Le `iFay` personnel d'un Human Prime traite des trajectoires de vie intimes, des communications privées et des préférences personnelles protégées par de strictes frontières de confidentialité par défaut (voir `FayID`). À l'opposé, `coFay` est conçu spécifiquement pour les domaines collaboratifs publics ou à accès contrôlé. Son identifiant `cofay_`, son entité propriétaire, son énoncé de mission, ses descripteurs exposés via le **Skill Sharing Protocol** (`SSP`) ainsi que ses lignes rouges comportementales interdites sont publiés au sein d'une `RoleCharter` vérifiable cryptographiquement, ce qui permet aux appelants externes d'effectuer des contrôles préalables de conformité sans confiance implicite (*zero-trust*) avant même d'engager la première interaction.

---

## 1.4 Autonomie du dépôt unique et frontières d'autorité inter-dépôts

Conformément à la discipline d'ingénierie de l'écosystème fondée sur **l'autonomie du dépôt unique et la dégradation gracieuse hors ligne**, ce dépôt définit localement l'intégralité du contrat normatif de `coFay` : l'ontologie de rôle à trois couches sans Ego, le schéma `RoleCharter` 1.0, les règles de délégation opérationnelle à un seul saut, le transfert atomique de propriété à double signature (`TransferEnvelope` 1.0) et les critères de vérification `coFACTS` L1. Les développeurs peuvent émettre, valider, transférer et auditer des documents `RoleCharter` ainsi que des journaux d'actions représentatives dans un environnement local isolé (*air-gapped*), sans connexion à des nœuds de chaîne de blocs externes ni à des serveurs d'annuaire distants.

Parallèlement, cette spécification applique une frontière stricte interdisant toute **double source de vérité** et renvoie de manière normative aux dépôts frères partout où les primitives fondamentales sont déjà définies :

- **Encodage canonique des identifiants (`hid_` / `ifay_` / `cofay_` / `org_`), cryptographie à preuve de possession (*holder-of-key*) et arbres d'organisations à parent unique** : définis de manière faisant foi dans **FayID**.
- **Poignées de main d'intendance déléguée entre Human Prime, gestionnaire `iFay` et `coFay` (profil d'intendance déléguée `Faying 1.1`)** : définies de manière faisant foi dans **Faying-Protocol**.
- **Découverte de compétences, signature JWS des descripteurs et authentification de l'appelant** : définies de manière faisant foi dans **Skill-Sharing-Protocol (`SSP`)**.
- **Permissions sur les hôtes terminaux et périmètres de ressources contrôlées (y compris la sémantique de poste `Official_Post`)** : définies de manière faisant foi dans **Control-Authority-Protocol (`CAP`)**.
- **Enregistrement sur chaîne des comptes `MeritPocket`, mathématiques de décroissance du `MeriToken` non monétaire et vote de gouvernance pondéré** : définis de manière faisant foi dans **Global-Merit-Chain (`GMChain`)**.
- **Architecture chapeau à quatre couches et conformité `iFACTS` des avatars individuels** : définies de manière faisant foi dans **ifay**.
