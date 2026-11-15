# 06. Cadre de conformité coFACTS et feuille de route par phases

## 6.1 Pourquoi `iFACTS` et `coFACTS` appliquent une frontière orthogonale

Dans un écosystème ouvert de protocoles multifournisseurs, des tests de conformité automatisés, objectifs et reproductibles déterminent si les implémentations interopèrent de manière fiable ou se fragmentent en revendications incompatibles. Le dépôt chapeau `ifay` institue **iFACTS** (*iFay Architecture Conformance Test Suite*) ainsi que les paliers de certification `iFay Ready` dédiés aux avatars numériques individuels (voir `ifay`). Pourquoi l'écosystème maintient-il dès lors une suite de conformité distincte pour `coFay` plutôt que d'intégrer les rôles publics au sein d'`iFACTS` ?

Parce que **leurs invariants fondamentaux de sécurité sont diamétralement opposés** :

- Sous `iFACTS`, une implémentation conforme d'avatar individuel doit prouver qu'elle monte fidèlement le modèle personnel `Ego` de son **Human Prime** et s'y aligne, qu'elle exécute des poignées de main exclusives d'appairage 1:1 avec son Prime et qu'elle respecte les transitions successorales sous tutelle.
- Sous `coFay`, le montage du moindre modèle personnel `Ego` constitue une **violation critique de sécurité (`COFAY_EGO_FORBIDDEN`)**. Réciproquement, les invariants fondateurs obligatoires pour `coFay`, notamment la pénétration de responsabilité jusqu'au steward personne physique (`steward_human_id`), la propriété monocouche sans imbrication et l'effacement atomique des anciens gestionnaires lors des transferts à double signature, n'existent pas sur les avatars `iFay` personnels.

En conséquence, l'écosystème applique une interception bilatérale de frontière sur les cibles évaluées :

1. **`@ifay/ifacts` vérifie exclusivement les implémentations individuelles `iFay` et les intégrations d'hôtes compatibles**, en interceptant explicitement les cibles `cofay_` afin d'orienter les opérateurs vers `coFACTS` (voir `ifay`).
2. **`coFACTS` (*Common Fay Architecture Conformance Test Suite*) vérifie exclusivement les implémentations de rôles `coFay`, leurs chartes et leurs transitions de gouvernance**. Dès que `runCoFactsL1Check` détecte une entrée portant un identifiant `ifay_` ou un marqueur de type `IFAY_MANIFEST` / `IFAY_ID`, il s'arrête immédiatement et renvoie `conformance: "REJECTED_BOUNDARY"` accompagné du code d'erreur `BOUNDARY_IFAY_USE_IFACTS`.

---

## 6.2 Modèle progressif de conformité à trois paliers dans `coFACTS`

En cohérence avec la méthodologie de vérification de l'écosystème, `coFACTS` définit trois paliers de conformité strictement progressifs (une implémentation doit réussir 100 % des contrôles L1 avant de pouvoir revendiquer la conformité L2 ou L3) :

| Niveau | Intitulé du palier de conformité | Système évalué et périmètre principal de vérification | État de livraison |
| :--- | :--- | :--- | :--- |
| **L1** | **Conformité de charte et d'état** | Vérification déterministe hors ligne de la conformité au schéma JSON `RoleCharter` 1.0, de l'interdiction de la couche Ego, de l'énumération canonique des archétypes de rôles, de la propriété monocouche et de la liaison obligatoire au steward personne physique, des barrières d'authentification SSP pour les compétences non publiques, de l'intégrité des signatures RFC 8785 JCS + Ed25519, de la délégation `iFay` à un seul saut sans sous-délégation et des transferts atomiques de propriété à double signature `TransferEnvelope` 1.0 avec protection anti-rejeu | **v1.0 livrée** (intégrée à `@ifay/cofay`) |
| **L2** | **Conformité des interfaces inter-protocoles** | Vérification sur le fil face à des points de terminaison `coFay` actifs : valide les descripteurs SSP signés JWS sous `/.well-known/skill-sharing` et l'authentification mutuelle de l'appelant sur les points de terminaison restreints, les chaînes de justificatifs d'intendance déléguée `Faying 1.1`, le blocage des commandes hors périmètre `cap_bounds` de CAP sur les hôtes terminaux et la divulgation de l'identité de rôle dans les sessions ICP et TP | **Planifié pour la phase 2** |
| **L3** | **Élasticité et continuité d'audit** | Exercices de résilience de bout en bout et d'ingénierie du chaos de gouvernance : vérifie le déterminisme comportemental entre répliques FayGer sans état simultanées, l'intégrité infalsifiable des journaux d'audit locaux chaînés par hachage `(cofay_id, owner_id, actor_signer_id)`, les bascules automatiques de gel `SUSPENDED_PENDING_SUCCESSION` en cas d'incapacité du steward et le rapprochement continu de l'attribution au registre avec l'état du `MeritPocket` sur **Global Merit Chain** (`GMChain`) | **Planifié pour la phase 3** |

---

## 6.3 Six contrôles automatisés `coFACTS` L1 et format de rapport lisible par machine

Exportée depuis `src/cofay-charter.mjs`, la fonction `runCoFactsL1Check(subject)` fournit un exécuteur de conformité L1 de référence sans dépendance externe, qui produit des rapports JSON déterministes `report_version: "cofacts-l1-report/1.0"` :

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

En complément du vérificateur de référence, `vectors/cofay-role-charter-vectors.json` fournit **20 vecteurs de test normatifs positifs et négatifs** (`V01` à `V20`). Les équipes tierces indépendantes qui implémentent des environnements d'exécution `coFay` ou des passerelles de gouvernance en Rust, Go, Python ou TypeScript doivent accepter chaque vecteur positif et rejeter chaque vecteur négatif avec son code d'erreur normatif exact avant de pouvoir revendiquer la conformité `coFACTS` L1.

---

## 6.4 Feuille de route de l'écosystème en quatre phases

L'évolution de `coFay` progresse méthodiquement depuis les contrats cryptographiques de charte jusqu'à l'interopérabilité inter-protocoles en direct et la gouvernance publique à grande échelle :

### Phase 1 : socle normatif de spécification et `coFACTS` L1 (livrée, référence initiale `2025-10-25`)
- Établir l'ontologie de rôle public à trois couches sans Ego ainsi que les trois archétypes canoniques de la version 1.0 (`org_service`, `functional_post` et `project_collaborator`).
- Figer le schéma JSON normatif de `RoleCharter` 1.0 et de l'enveloppe atomique à double signature `TransferEnvelope` 1.0 (`schemas/cofay-role-charter-1.0.json` accompagné de la triade de publication strictement identique au bit près sous `schema/2025-10-25/`).
- Livrer 20 vecteurs déterministes de conformité Ed25519 + RFC 8785 JCS ainsi que la bibliothèque de référence `@ifay/cofay` de validation et de signature sans dépendance externe.
- Fournir l'intégralité des plans directeurs architecturaux et des guides de démarrage rapide dans les neuf langues prises en charge.

### Phase 2 : intégration en direct des points de terminaison inter-protocoles et `coFACTS` L2 (court terme)
- Achever les essais d'interopérabilité sur le fil entre `Faying 1.1` (profil d'intendance déléguée `coFay`), les serveurs de compétences `SSP 1.0` et les registres d'index statiques de `FayGer`.
- Publier la sonde automatisée de conformité HTTP/TLS `coFACTS` L2 chargée d'inspecter les attestations `RoleCharter` en direct et de vérifier l'application effective de l'authentification de l'appelant sur les points de terminaison SSP restreints.

### Phase 3 : garde de clés à seuil, élasticité multi-instance et `coFACTS` L3 (moyen terme)
- Intégrer les politiques organisationnelles de multisignature à seuil N-sur-M issues de `FayID` afin de prendre en charge les amendements de charte ratifiés par conseil d'administration et les exercices de succession d'urgence destinés aux grandes institutions publiques.
- Fournir des modèles de répliques `coFay` sans état pour l'orchestration de conteneurs **FayGer** ainsi que des agrégateurs distribués d'audit en chaîne de hachage infalsifiable, ouvrant l'accès à la certification complète `coFACTS` L3.

### Phase 4 : écosystème de service public à grande échelle sur Global Merit Chain (`GMChain`) (vision à long terme)
- Permettre la découverte intersectorielle dans des annuaires de rôles publics et l'inspection transparente de l'historique des `MeritPocket`, afin que les guichets municipaux, les sièges d'évaluation académique par les pairs et les unités d'infrastructure open source collaborent au sein d'une société humains-agents responsable, non monopolistique et de haute confiance, ancrée sur l'attribution non monétaire de **MeriToken**.
