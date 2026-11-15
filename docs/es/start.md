# Inicio rápido: comprender e integrar coFay

Bienvenido a la documentación oficial y al conjunto de herramientas de referencia de **coFay** (**Common Fay**, la encarnación digital de rol público). Dentro de la ontología binaria fundacional del ecosistema **Fay**, **`Fay = iFay + coFay`**, un `iFay` (**Individual Fay**) es un avatar digital personal instanciado a partir de un único **Human Prime** y permanentemente alineado con él. En cambio, un `coFay` es una **encarnación funcional de rol social públicamente direccionable, definida y gobernada por un `RoleCharter` normativo**.

Tanto si un Human Prime inicia una solicitud de servicio mediante un `iFay` gobernado como si otro `Fay` invoca una capacidad colaborativa a través de fronteras organizativas, los invocadores nunca necesitan dirigirse ni rastrear a un operador humano específico tras bambalinas. Direccionar y conectarse al punto de enlace estable de rol público `cofay_<base32>` ofrece una colaboración predecible, verificable criptográficamente y auditable de extremo a extremo.

---

## 1. Modelo mental esencial en tres minutos

Comprender `coFay` comienza por cuatro fronteras estructurales y éticas que distinguen a una encarnación de rol público de un `iFay` individual:

| Dimensión | `iFay` (Avatar digital individual) | `coFay` (Encarnación de rol público) |
| :--- | :--- | :--- |
| **Naturaleza ontológica** | Extensión digital de la identidad personal, preferencias y agencia de un Human Prime | Cargo público transferible, ventanilla institucional de servicio o unidad colaborativa |
| **Pila arquitectónica** | Capa Social + Capa de Interacción + Capa de Cognición + **Capa Ego** | **Capa Social + Capa de Interacción + Capa de Cognición (Capa Ego estrictamente prohibida)** |
| **Propiedad y transferencia** | Vinculado permanentemente a un único Human Prime; nunca se vende, comercia ni transfiere | Propiedad de capa única bajo `HumanID` u `OrganizationID`; admite transferencia atómica de doble firma |
| **Verificación de conformidad** | Verificado por la suite de pruebas de conformidad **iFACTS** | Verificado exclusivamente por el marco de conformidad **coFACTS** |

> **Línea roja crítica de diseño**: En todo el ecosistema `Fay`, el término **anfitrión** (`Host`) se refiere estrictamente a un dispositivo terminal de hardware o a una aplicación de software habitados, y nunca a un ser humano. La responsabilidad jurídica y ética de todo `coFay` se ancla en última instancia en una persona natural: ya sea el `HumanID` propietario directo o, bajo propiedad organizativa, el steward obligatorio de persona natural registrado en `steward_human_id`.

---

## 2. Requisitos previos y verificación local en un minuto

Este repositorio se distribuye con cero dependencias externas en tiempo de ejecución e incluye el JSON Schema normativo de `RoleCharter` 1.0, 20 vectores criptográficos de conformidad positivos y negativos, y el verificador de conformidad `coFACTS` L1. Con **Node.js 20+** instalado, ejecute localmente la suite completa de verificación:

```bash
git clone https://github.com/ChainMode/coFay.git
cd coFay
npm test
```

Cuando la ejecución concluye con éxito, la suite automatizada de pruebas verifica secuencialmente siete invariantes normativos:

1. Equivalencia byte por byte entre `schemas/cofay-role-charter-1.0.json` y el espejo base congelado en `schema/2025-10-25/schema.json`.
2. Serialización JSON determinista bajo el esquema de canonicalización JSON RFC 8785 (JCS).
3. Generación de firmas Ed25519 y verificación a prueba de manipulaciones en los tres arquetipos canónicos de rol público (`org_service`, `functional_post` y `project_collaborator`).
4. Prohibición estricta de la Capa Ego (bloqueando cualquier adjunto `ego_package` o perfil de personalidad privada), aplicación de propiedad de capa única (bloqueando propiedad anidada `ifay_` o `cofay_`) y vinculación obligatoria de un steward de persona natural para propietarios organizativos.
5. Delegación operativa ortogonal de un solo salto mediante `iFay` (permitiendo concesiones y revocaciones por parte del propietario o steward y rechazando la redelegación secundaria por parte de gestores activos).
6. Transferencia atómica de propiedad con doble firma (`TransferEnvelope` 1.0), exigiendo la limpieza de gestores obsoletos o su ratificación explícita, la progresión estrictamente monótona de `transfer_nonce` contra ataques de repetición y la vinculación continua en cadena de `MeritPocket` en **Global Merit Chain** (`GMChain`).
7. Generación de informes de conformidad `coFACTS` L1 legibles por máquina junto con el rechazo determinista de frontera cuando se envía un objetivo `iFay` a `coFACTS`.

---

## 3. Redacción y validación de su primer `RoleCharter` 1.0

Toda instancia de `coFay` en producción debe portar un documento `RoleCharter` 1.0 firmado mediante Ed25519 por su propietario responsable de capa única (o por su steward designado de persona natural cuando existe propiedad organizativa):

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

## 4. Navegación por el plano arquitectónico

Lea en orden los seis capítulos normativos del plano arquitectónico para dominar el diseño ontológico, los contratos criptográficos de gobernanza y el modelo de integración entre protocolos de `coFay`:

1. **[Capítulo 01: Descripción general y posicionamiento ontológico](./blueprint/01-Descripcion-General-y-Ontologia.md)**: Examina la división social binaria del trabajo en `Fay = iFay + coFay` y establece la frontera ontológica entre activos institucionales transferibles de rol y extensiones personales intransferibles.
2. **[Capítulo 02: Arquitectura de tres capas y Carta de Rol](./blueprint/02-Arquitectura-de-Tres-Capas-y-Carta-de-Rol.md)**: Explica por qué `coFay` suprime la Capa Ego personal y gobierna sus capas Social, de Interacción y de Cognición mediante `RoleCharter` 1.0.
3. **[Capítulo 03: Taxonomía de roles públicos y escenarios de aplicación](./blueprint/03-Taxonomia-de-Roles-Publicos-y-Escenarios.md)**: Detalla las líneas base de capacidades y los patrones de despliegue en producción para los tres arquetipos canónicos: `org_service`, `functional_post` y `project_collaborator`.
4. **[Capítulo 04: Propiedad de capa única y responsabilidad del Steward](./blueprint/04-Propiedad-de-Capa-Unica-y-Responsabilidad-del-Steward.md)**: Traza de extremo a extremo la autoridad, la delegación operativa de un solo salto y la responsabilidad de persona natural a través de `FayID`, `Faying 1.1`, `SSP`, `CAP` y `GMChain`.
5. **[Capítulo 05: Ejecución sin estado, continuidad de mérito y transferencia de doble firma](./blueprint/05-Ejecucion-Sin-Estado-Continuidad-de-Merito-y-Transferencia-de-Doble-Firma.md)**: Resuelve el escalado horizontal de trabajadores sin estado frente a la atribución continua en `MeritPocket` y especifica los traspasos atómicos de propiedad con doble firma mediante `TransferEnvelope` 1.0.
6. **[Capítulo 06: Marco de conformidad coFACTS y hoja de ruta](./blueprint/06-Conformidad-coFACTS-y-Hoja-de-Ruta.md)**: Define el modelo progresivo de verificación `coFACTS` en niveles, su frontera ortogonal con `iFACTS` y la hoja de ruta del ecosistema en cuatro fases.
