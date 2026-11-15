# 05. Élasticité d'exécution sans état, continuité du mérite et transfert à double signature

## 5.1 Résoudre la tension centrale : comment des répliques éphémères sans état soutiennent un compte de contribution continu

L'ingénierie d'une incarnation de rôle public fait émerger un paradoxe architectural apparent :

- **Du point de vue des systèmes à haute disponibilité** : un `coFay` servant des invocations publiques de compétences à travers le réseau doit prendre en charge la mise à l'échelle horizontale automatique sans état, le basculement multirégion et le remplacement continu des conteneurs. L'arrêt ou le recyclage d'un processus d'exécution individuel ne doit jamais perturber les appelants actifs.
- **Du point de vue de la réputation institutionnelle** : **Global Merit Chain** (`GMChain`) lie en 1:1 chaque identifiant canonique `cofay_<base32>` à un `MeritPocket` dédié (voir `Global-Merit-Chain`), accumulant dans la durée le **MeriToken** (dont la plus petite unité est `μ` / **Merit Unit**) et le poids de gouvernance communautaire acquis grâce à un service public vérifié.

Comment des processus d'exécution jetables et sans état peuvent-ils maintenir sans rupture un compte pluriannuel de réputation institutionnelle ?

`coFay` résout élégamment cette tension en **abaissant l'élasticité d'exécution dans le plan d'exécution sans état, tout en ancrant l'identité, la gouvernance par charte et l'attribution du mérite dans le plan persistant d'identité et de registre** :

```text
                        ┌───────────────────────────────────────────────────┐
Plan d'identité et      │  Identité persistante : cofay_orgservicedesk234567│
de registre (état       │  Registre lié en 1:1  : GMChain MeritPocket (mpk_)│
continu infalsifiable)  │  Ancre de gouvernance : RoleCharter 1.0 (Sig JCS) │
                        └─────────────────────────┬─────────────────────────┘
                                                  │ Monte la même charte vérifiée
                      ┌───────────────────────────┼───────────────────────────┐
                      ▼                           ▼                           ▼
Plan d'exécution   [Réplique FayGer n°1]     [Réplique FayGer n°2]     [Réplique FayGer n°N]
(répliques sans    Sans Ego / Autoscaling    Sans Ego / Remplacement   Basculement multirégion /
état élastiques)   à la demande              à chaud continu           Mise à l'échelle à zéro
```

1. **Élasticité de l'exécution sans état** : les conteneurs d'exécution **FayGer** chargés du raisonnement cognitif et de l'analyse protocolaire ne conservent aucune mémoire locale de persona (puisqu'ils sont dépourvus de couche Ego). Au démarrage, chaque réplique monte la `RoleCharter` 1.0 active dont la signature a été vérifiée, ainsi que des ensembles de connaissances métier en lecture seule. Lors d'un pic de trafic, un rôle peut se déployer sur des centaines de répliques simultanées en quelques secondes, puis redescendre à zéro pendant les plages d'inactivité.
2. **Signature cryptographique représentative unifiée** : les répliques sans état n'émettent jamais de réponses anonymes ni dépourvues d'attribution. Elles signent les récépissés sortants et les attributions au registre au moyen de clés de possession `cofay_` protégées par HSM ou gérées à seuil (voir `FayID`), ou via des signatures représentatives déléguées provenant des `managers: iFayID[]` autorisés.
3. **Mérite attribué au rôle, jamais au conteneur** : les appelants externes et les évaluateurs pairs jugent la qualité de service délivrée par le rôle public `cofay_`. Tous les enregistrements correspondants de `MeriToken` non monétaire s'imputent directement sur le `MeritPocket` lié en 1:1 à cet identifiant `cofay_`, préservant ainsi une crédibilité institutionnelle ininterrompue même après des centaines de mises à niveau de l'image de conteneur sous-jacente.

---

## 5.2 Pourquoi les passations de propriété exigent un protocole atomique à double signature

Contrairement à un `iFay` individuel, lié à vie à un unique **Human Prime**, un `coFay` constitue un actif institutionnel de rôle appelé à connaître des passations légitimes au cours de son cycle de vie. Parmi les transitions courantes figurent le don d'un `coFay` mature de type `project_collaborator` depuis le `HumanID` de son développeur fondateur vers l'`OrganizationID` d'une fondation open source, ou la cession d'un guichet de service public d'une division d'entreprise cédante vers une entité exploitante nouvellement constituée.

Or, un mécanisme naïf de transfert à signature unique exposerait trois vulnérabilités critiques de sécurité :

1. **Détournement unilatéral ou délestage de responsabilité** : n'exiger la signature que d'une seule partie permettrait soit à un attaquant d'accaparer le rôle d'autrui, soit à un détenteur sortant de transférer de force un `coFay` grevé de litiges de conformité ou de sanctions en cours vers une personne physique ou une organisation tierce non consentante.
2. **Persistance indue d'anciens gestionnaires** : avant la passation, le propriétaire sortant configure généralement des délégués internes de quart dans `managers: iFayID[]`. Si un transfert de propriété reconduisait silencieusement la liste `managers` existante en vue d'un nettoyage manuel ultérieur, une fenêtre critique de concurrence s'ouvrirait au moment de la bascule : les délégués `iFay` de l'ancien propriétaire pourraient encore signer des actes faisant foi sous la responsabilité juridique du nouveau propriétaire.
3. **Attaques par rejeu d'anciens transferts** : en l'absence d'un compteur anti-rejeu strictement monotone et d'une liaison cryptographique à l'empreinte exacte de la charte précédente, d'anciennes charges utiles de transfert interceptées pourraient être rejouées afin de ramener frauduleusement la propriété à un état antérieur.

---

## 5.3 `TransferEnvelope` 1.0 : flux normatif du transfert atomique de propriété à double signature

Afin d'éliminer par construction ces trois modes de défaillance, `coFay` spécifie la structure normative **`TransferEnvelope` 1.0** (définie sous `$defs.TransferEnvelope` dans `schemas/cofay-role-charter-1.0.json`) :

### Étape 1 : verrouiller l'état de la charte antérieure et le compteur anti-rejeu monotone
Toute enveloppe de transfert doit lier explicitement :

- `prior_charter_digest_hex` : empreinte hexadécimale SHA-256 en minuscules calculée sur la sérialisation canonique RFC 8785 JCS de la `RoleCharter` actuellement active (toute divergence échoue immédiatement avec `PRIOR_CHARTER_DIGEST_MISMATCH`).
- `transfer_nonce` : strictement égal à `currentCharter.transfer_nonce + 1` (le rejeu d'un ancien compteur ou le saut de valeurs échoue immédiatement avec `TRANSFER_NONCE_MISMATCH`).
- `from_owner` et `to_owner` : les deux extrémités doivent satisfaire aux règles de propriété monocouche (`HumanID` ou `OrganizationID` uniquement ; des propriétaires imbriqués `ifay_` ou `cofay_` échouent avec `OWNER_TYPE_FORBIDDEN`, et un transfert vers le même propriétaire échoue avec `SELF_TRANSFER_REDUNDANT`). Dès lors que `to_owner.type === "organization"`, l'enveloppe doit désigner simultanément le nouveau steward personne physique entrant dans `new_steward_human_id`.

### Étape 2 : imposer l'effacement des anciens gestionnaires ou la ratification explicite des entrants (`manager_policy`)
`TransferEnvelope` 1.0 **interdit strictement tout héritage silencieux des `managers` antérieurs** et impose le choix explicite entre deux politiques mutuellement exclusives :

- **`"CLEAR_ALL"` (valeur sûre recommandée par défaut)** : `ratified_managers` doit être un tableau vide `[]` (tout tableau non vide échoue avec `CLEAR_ALL_NON_EMPTY_MANAGERS`), révoquant de façon atomique l'intégralité des délégués opérationnels `iFay` précédents à l'instant exact du transfert de propriété.
- **`"RATIFY_NEW"` (bascule sans interruption de service)** : énumère dans `ratified_managers` la liste exacte des délégués opérationnels `iFay` entrants. Comme la signature du propriétaire ou du steward entrant couvre l'intégralité de l'enveloppe de transfert, seuls les délégués `iFay` explicitement ratifiés par la partie entrante demeurent actifs, tandis que le protocole retire de façon atomique tous les délégués antérieurs non ratifiés.

### Étape 3 : recueillir conjointement les signatures Ed25519 sortante et entrante
Après retrait des champs de signature, sérialisation de l'enveloppe selon RFC 8785 JCS et ajout du préfixe de séparation de domaine `"ifay.cofay.ownership-transfer.v1\0"`, la transaction exige simultanément les **deux** signatures Ed25519 valides :

- `from_signature` : signée par le `owner.id` sortant ou par le `steward_human_id` sortant.
- `to_signature` : signée par le `to_owner.id` entrant ou par le `new_steward_human_id` entrant.

L'omission de l'une ou l'autre signature échoue immédiatement avec `TRANSFER_DUAL_SIGNATURE_REQUIRED` ; tout signataire non autorisé ou toute altération de la charge utile échoue de manière déterministe avec `TRANSFER_SIGNER_UNAUTHORIZED` ou `TRANSFER_SIGNATURE_INVALID`.

---

## 5.4 Continuité sans décote du `MeritPocket` et gel conservatoire en cas d'incapacité

### 1. Continuité du rôle sans aucune décote successorale sur le `MeritPocket`
Selon les règles de `GMChain`, la transmission post-mortem de la réputation personnelle d'un individu applique une décote stricte à cinq paliers d'intimité (et interdit toute transmission en deçà d'un score d'intimité de `0.1`) afin que le mérite personnel ne puisse jamais être marchandisé. Dans le cas d'un transfert valide de `coFay` à double signature, en revanche, le `MeritPocket` appartient au **rôle public `cofay_` lui-même** et non à un individu sortant. Dès lors que `merit_continuity` déclare à la fois `preserve_cofay_id: true` et `preserve_merit_pocket: true` (toute violation échoue avec `MERIT_CONTINUITY_VIOLATION`), le solde de `MeriToken` historiquement acquis par ce rôle est intégralement conservé sous l'intendance du propriétaire entrant, sans aucune décote successorale (voir `Global-Merit-Chain`). Naturellement, le `MeriToken` continue d'obéir à la courbe non monétaire de décroissance temporelle de `GMChain` vers son plancher de référence : aucune organisation ne peut thésauriser une rente statique de gouvernance par la simple acquisition d'un rôle établi, et le maintien de la confiance publique exige toujours des contributions vérifiées continues.

### 2. Gel conservatoire en cas de dissolution organisationnelle ou d'incapacité du steward (`SUSPENDED_PENDING_SUCCESSION`)
Que se passe-t-il lorsqu'une organisation propriétaire est dissoute ou lorsque son steward personne physique enregistré est frappé d'une incapacité soudaine avant d'avoir pu conclure un transfert à double signature ? Conformément aux règles de gouvernance inter-dépôts alignées sur l'ADR `0003` de `FayID` :

- Le `coFay` **ne remonte jamais silencieusement** vers une organisation mère, **ne se transforme jamais en agent autonome sans responsable** et **ne détruit jamais son registre historique de mérite**.
- À la place, son `lifecycle_state` bascule de façon déterministe vers **`"SUSPENDED_PENDING_SUCCESSION"`** : tant que le rôle demeure figé dans cet état conservatoire, toute modification des `managers` opérationnels est bloquée (`CHARTER_NOT_ACTIVE`) et les actions métier sortantes restreintes sont mises en pause.
- Ce n'est qu'après l'exécution d'une procédure préenregistrée de recouvrement de gouvernance à seuil ou l'accomplissement d'un transfert valide `TransferEnvelope` 1.0 à double signature que le rôle retrouve l'état `"ACTIVE"` et reprend son service public.
