# Démarrage rapide : comprendre et intégrer coFay

Bienvenue dans la documentation officielle et la boîte à outils de référence de **coFay** (**Common Fay**, l'incarnation numérique de rôle public). Au sein de l'ontologie binaire fondamentale de l'écosystème **Fay**, **`Fay = iFay + coFay`**, un `iFay` (**Individual Fay**) est un avatar numérique personnel instancié à partir d'un unique **Human Prime** et aligné en permanence sur celui-ci. À l'inverse, un `coFay` est une **incarnation fonctionnelle de rôle social publiquement adressable, définie et gouvernée par une charte normative `RoleCharter`**.

Qu'un Human Prime initie une demande de service par l'intermédiaire d'un `iFay` gouverné ou qu'un autre `Fay` invoque une capacité collaborative au-delà des frontières organisationnelles, l'appelant n'a jamais besoin de cibler ni de suivre un opérateur physique particulier en coulisses. Il suffit d'adresser le point de terminaison public stable `cofay_<base32>` et de s'y connecter pour bénéficier d'une collaboration prévisible, vérifiable cryptographiquement et auditable de bout en bout.

---

## 1. Modèle mental fondamental en trois minutes

La compréhension de `coFay` repose sur quatre frontières structurelles et éthiques qui distinguent une incarnation de rôle public d'un `iFay` individuel :

| Dimension | `iFay` (Avatar numérique individuel) | `coFay` (Incarnation de rôle public) |
| :--- | :--- | :--- |
| **Nature ontologique** | Prolongement numérique de la persona, des préférences et de l'agentivité personnelle d'un Human Prime | Poste public transférable, guichet de service institutionnel ou unité collaborative |
| **Pile architecturale** | Couche sociale + Couche d'interaction + Couche cognitive + **Couche Ego** | **Couche sociale + Couche d'interaction + Couche cognitive (Couche Ego strictement interdite)** |
| **Propriété et transfert** | Lié à vie à un unique Human Prime ; non vendable, non négociable et non transférable | Propriété monocouche sous `HumanID` ou `OrganizationID` ; prend en charge le transfert atomique à double signature |
| **Vérification de conformité** | Vérifié par la suite de tests de conformité **iFACTS** | Vérifié exclusivement par le cadre de conformité **coFACTS** |

> **Ligne rouge critique de conception** : dans l'ensemble de l'écosystème `Fay`, le terme **hôte** (`Host`) désigne exclusivement un terminal matériel ou une application logicielle habité(e), jamais un être humain. La responsabilité juridique et éthique de chaque `coFay` s'ancre toujours en dernier ressort sur une personne physique : soit le `HumanID` directement propriétaire, soit, dans le cadre d'une propriété organisationnelle, le steward personne physique obligatoire enregistré dans `steward_human_id`.

---

## 2. Prérequis et vérification locale en une minute

Ce dépôt ne comporte aucune dépendance d'exécution externe et inclut le schéma JSON normatif `RoleCharter` 1.0, 20 vecteurs cryptographiques de conformité positifs et négatifs, ainsi que le vérificateur de conformité `coFACTS` L1. Avec **Node.js 20+** installé, exécutez l'intégralité de la suite de vérification en local :

```bash
git clone https://github.com/ChainMode/coFay.git
cd coFay
npm test
```

Lorsque l'exécution aboutit, la suite de tests automatisés vérifie successivement sept invariants normatifs :

1. L'équivalence octet par octet entre `schemas/cofay-role-charter-1.0.json` et le miroir de référence figé dans `schema/2025-10-25/schema.json`.
2. La sérialisation JSON déterministe selon la norme RFC 8785 JSON Canonicalization Scheme (JCS).
3. La génération de signatures Ed25519 et la vérification infalsifiable sur les trois archétypes canoniques de rôles publics (`org_service`, `functional_post` et `project_collaborator`).
4. L'interdiction stricte de la couche Ego (bloquant tout `ego_package` ou attachement de persona personnelle), l'application de la propriété monocouche (bloquant toute propriété imbriquée `ifay_` ou `cofay_`) et l'obligation d'associer un steward personne physique aux propriétaires organisationnels.
5. La délégation opérationnelle orthogonale `iFay` à un seul saut (autorisant les octrois et révocations par le propriétaire ou le steward tout en rejetant toute sous-délégation secondaire par les gestionnaires actifs).
6. Le transfert atomique de propriété à double signature (`TransferEnvelope` 1.0), imposant l'effacement des anciens gestionnaires ou leur re-ratification explicite, la progression strictement monotone du compteur anti-rejeu `transfer_nonce` et la liaison continue sur chaîne du `MeritPocket` sur **Global Merit Chain** (`GMChain`).
7. La génération d'un rapport de conformité `coFACTS` L1 lisible par machine ainsi que le rejet déterministe de frontière lorsqu'une cible `iFay` est soumise à `coFACTS`.

---

## 3. Rédiger et valider votre première `RoleCharter` 1.0

Toute instance `coFay` en production doit embarquer un document `RoleCharter` 1.0 signé via Ed25519 par son propriétaire monocouche responsable (ou par son steward personne physique désigné dans le cas d'une propriété organisationnelle) :

```js
import {
  signRoleCharter,
  validateRoleCharter,
  runCoFactsL1Check,
} from "@ifay/cofay";

const unsignedCharter = {
  schema_version: "1.0",
  charter_id: "chr_b4f2k7m5p3q6r4s2t4v6w3x2y4",
  charter_revision: 1,
  cofay_id: "cofay_c5g3m6n2q4r7s5t3v5w7x4y3z5",
  display_name: "Municipal Public Permit Intake Desk",
  role_archetype: "org_service",
  owner: {
    type: "organization",
    id: "org_civic-service-bureau",
  },
  steward_human_id: "hid_a3d5f7g4j2k4m6n5p2q4r6s7t2",
  managers: ["ifay_m2n4p6q7r2s4t6v5w2x4y6z2a4"],
  mission_statement:
    "Provide standardized municipal permit guidance, preliminary document verification, and application status inquiries on behalf of the Civic Service Bureau.",
  allowed_capabilities: {
    ssp_skills: [
      {
        skill_ref: "ssp://org_civic-service-bureau/permit-inquiry@1.0",
        visibility: "public",
        require_caller_auth: false,
      },
      {
        skill_ref: "ssp://org_civic-service-bureau/permit-filing@1.0",
        visibility: "restricted",
        require_caller_auth: true,
      },
    ],
    cap_bounds: {
      allowed_scopes: ["cap:document.verify", "cap:queue.dispatch"],
      max_autonomy_tier: "delegated",
      allow_irreversible_actions: false,
    },
  },
  prohibited_actions: [
    "Never impersonate any Human Prime or mount a personal Ego persona package.",
    "Never issue final administrative permit revocations without countersignature from the accountable human steward.",
  ],
  audit_policy: {
    retention_days: 365,
    log_mode: "hash_chain",
    require_actor_trace: true,
    gmc_merit_pocket_ref: "mpk_c5g3m6n2q4r7s5t3v5w7x4y3z5",
  },
  lifecycle_state: "ACTIVE",
  transfer_nonce: 0,
  issued_at: "2026-11-16T00:00:00Z",
};

const signedCharter = signRoleCharter(unsignedCharter, {
  signerId: unsignedCharter.steward_human_id,
  privateKeySeedHex:
    "0202020202020202020202020202020202020202020202020202020202020202",
});

console.log(validateRoleCharter(signedCharter)); // { valid: true, errors: [] }
console.log(runCoFactsL1Check(signedCharter).conformance); // "PASS"
```

---

## 4. Navigation dans le plan directeur architectural

Parcourez dans l'ordre les six chapitres normatifs du plan directeur pour maîtriser la conception ontologique, les contrats de gouvernance cryptographiques et le modèle d'intégration inter-protocoles de `coFay` :

1. **[Chapitre 01 : Aperçu et positionnement ontologique](./blueprint/01-Apercu-et-Ontologie.md)** : analyse la division sociale binaire du travail dans `Fay = iFay + coFay` et établit la frontière ontologique entre les actifs institutionnels de rôle transférables et les prolongements personnels inaliénables.
2. **[Chapitre 02 : Architecture à trois couches et charte de rôle](./blueprint/02-Architecture-a-Trois-Couches-et-Charte-de-Role.md)** : explique pourquoi `coFay` élague la couche Ego personnelle et gouverne ses couches sociale, d'interaction et cognitive au moyen de `RoleCharter` 1.0.
3. **[Chapitre 03 : Taxonomie des rôles publics et scénarios d'application](./blueprint/03-Taxonomie-des-Roles-Publics-et-Scenarios.md)** : détaille les profils de capacités de référence et les schémas de déploiement en production pour les trois archétypes canoniques : `org_service`, `functional_post` et `project_collaborator`.
4. **[Chapitre 04 : Propriété monocouche et responsabilité du steward](./blueprint/04-Propriete-Monocouche-et-Responsabilite-du-Steward.md)** : cartographie l'autorité de bout en bout, la délégation opérationnelle à un seul saut et la responsabilité de la personne physique à travers `FayID`, `Faying 1.1`, `SSP`, `CAP` et `GMChain`.
5. **[Chapitre 05 : Exécution sans état, continuité du mérite et transfert à double signature](./blueprint/05-Execution-Sans-Etat-Continuite-du-Merite-et-Transfert-a-Double-Signature.md)** : réconcilie la mise à l'échelle horizontale d'unités d'exécution sans état avec l'attribution continue sur `MeritPocket`, et spécifie les transferts atomiques de propriété à double signature via `TransferEnvelope` 1.0.
6. **[Chapitre 06 : Cadre de conformité coFACTS et feuille de route](./blueprint/06-Conformite-coFACTS-et-Feuille-de-Route.md)** : définit le modèle de vérification progressif par paliers de `coFACTS`, sa frontière orthogonale avec `iFACTS` et la feuille de route de l'écosystème en quatre phases.
