# 02. Arquitectura de tres capas (sin Capa Ego) y Carta de Rol

## 2.1 Poda arquitectónica de la pila de cuatro capas en coFay

La especificación marco `ifay` define una arquitectura canónica de referencia de cuatro capas integrada por la **Capa Social**, la **Capa de Interacción**, la **Capa de Cognición** y la **Capa Ego**. A lo largo de estas cuatro capas, las dos especies de `Fay` divergen según una frontera estructural nítida: un `iFay` individual monta las cuatro capas, mientras que **`coFay` consta únicamente de las capas Social, de Interacción y de Cognición, y prohíbe estrictamente montar una Capa Ego**.

```text
┌───────────────────────────────────────────────────────────────────────┐
│  [ PODADA / ESTRICTAMENTE PROHIBIDA ] Capa Ego                        │
│  x Nunca replica memoria de personalidad privada                      │
│  x Nunca monta paquetes de réplica personal @ego-models/*             │
├───────────────────────────────────────────────────────────────────────┤
│  Tope de Gobernanza: RoleCharter 1.0 normativo (Ed25519 + JCS)        │
│  + Declaración de misión   + Límites de capacidades SSP/CAP           │
│  + Líneas rojas explícitas + Política de auditoría inalterable        │
├───────────────────────────────────────────────────────────────────────┤
│  Capa 3: Capa de Cognición                                            │
│  - Razonamiento de dominio y orquestación de flujos de trabajo        │
│  - Evaluación de políticas institucionales y enrutamiento determinista│
├───────────────────────────────────────────────────────────────────────┤
│  Capa 2: Capa de Interacción                                          │
│  - Diálogo estructurado (ICP) y coordinación de alto ancho (TP)       │
│  - Operaciones acotadas en anfitriones (Hosts) vía CAP y DTP          │
├───────────────────────────────────────────────────────────────────────┤
│  Capa 1: Capa Social                                                  │
│  - Identidad cofay_ y ciclo de vida de credenciales                   │
│  - Publicación SSP firmada con JWS y vínculo MeritPocket en GMChain   │
└───────────────────────────────────────────────────────────────────────┘
```

¿Por qué un `coFay` no debe poseer jamás una Capa Ego? Esta prohibición no obedece a una limitación técnica para cargar adaptadores ajustados; viene impuesta por tres invariantes innegociables de gobernanza:

1. **Prevenir la tergiversación antropomórfica ante el público**: El único propósito de la Capa Ego (véase `Ego`) es replicar la jerarquía personal de valores, la cadencia emocional y la memoria episódica privada de un **Human Prime** específico. Montar el paquete privado de Ego de una persona natural dentro de una ventanilla municipal o un puesto estatutario de revisión introduciría sesgos cognitivos privados en las resoluciones institucionales y haría creer erróneamente a los interlocutores externos que conversan en privado con dicho individuo.
2. **Garantizar consistencia sin estado entre réplicas horizontales**: Los puntos de enlace de rol público atienden habitualmente miles de sesiones simultáneas de colaboración. Si las instancias trabajadoras dependieran de una Capa Ego sujeta a deriva subjetiva o memoria privada local, trabajadores paralelos emitirían dictámenes contradictorios ante reglas institucionales idénticas. Suprimir la Capa Ego garantiza que el mismo `RoleCharter` firmado y la misma base de conocimiento del dominio gobiernen cada réplica trabajadora de forma determinista.
3. **Eliminar fugas de privacidad personal durante las transferencias de propiedad**: Como activo institucional de rol, un `coFay` puede transferirse entre propietarios responsables. Si fragmentos del estado personal de Ego de un antiguo steward u operador permanecieran dentro del entorno de ejecución del rol, transferir la titularidad provocaría una exposición catastrófica de datos personales. En consecuencia, cada vez que el validador detecta cualquier propiedad prohibida de réplica personal (`ego_package`, `ego_model`, `ego_profile`, `human_prime_id` o `personal_persona`), detiene de inmediato la validación con el error estricto `COFAY_EGO_FORBIDDEN`.

---

## 2.2 División funcional entre las tres capas activas en tiempo de ejecución

Con la Capa Ego extirpada estructuralmente, las tres capas restantes colaboran en torno a un único objetivo: la ejecución fiel del `RoleCharter` público.

### 1. Capa Social: identidad pública, credenciales verificables y fachada de servicio
La Capa Social gestiona la identidad de red verificable y los contratos externos de servicio del `coFay`:

- Resguarda el identificador canónico `cofay_<base32>` y sus credenciales asociadas de verificación por posesión de clave (véase `FayID`).
- Publica descriptores de habilidades firmados con JWS bajo `cofay_` mediante el **Skill Sharing Protocol** (`SSP`; véase `Skill-Sharing-Protocol`), segmentando los puntos expuestos en tres niveles explícitos de visibilidad: `public` (consultas abiertas sin autenticación), `restricted` (invocaciones autenticadas de socios o ciudadanos) y `private` (operaciones administrativas internas).
- Mantiene la referencia contable de atribución (`gmc_merit_pocket_ref`) que apunta al `MeritPocket` vinculado 1:1 al rol en **Global Merit Chain** (`GMChain`), registrando el **MeriToken** no monetario obtenido mediante servicios colaborativos verificados (véase `Global-Merit-Chain`).

### 2. Capa de Interacción: participación multimodal y actuación acotada sobre anfitriones
La Capa de Interacción estandariza tanto los canales entrantes de colaboración con invocadores externos como la actuación saliente sobre **anfitriones** (`Hosts`) habitados (donde `anfitrión` / `Host` designa exclusivamente dispositivos terminales de hardware o aplicaciones de software):

- **Interacción entrante por protocolo**: Admite flujos ricos en contexto de anotación estructurada mediante el **Interactive Conversation Protocol** (`ICP`; véase `Interactive-Conversation-Protocol`), junto con sesiones de alineación de objetivos y consulta de alto ancho de banda entre instancias `Fay` mediante el **Telepathy Protocol** (`TP`; véase `Telepathy-Protocol`).
- **Control saliente acotado sobre anfitriones**: Siempre que un rol público opere colas de software empresarial, sensores ambientales o quioscos dedicados que actúan como anfitriones (`Hosts`), cada comando debe ejecutarse a través del **Control Authority Protocol** (`CAP`) y del **Data Tunnel Protocol** (`DTP`) estrictamente dentro del ámbito declarado en `RoleCharter.allowed_capabilities.cap_bounds` (véanse `Control-Authority-Protocol` y `Data-Tunnel-Protocol`). Los recursos de anfitrión no incluidos en la lista permanecen inalcanzables por diseño.

### 3. Capa de Cognición: razonamiento de dominio regulado por carta y orquestación de habilidades
La Capa de Cognición actúa como el motor de razonamiento especializado del `coFay` y se ensambla declarativamente dentro del entorno de contenedores **FayGer** (véase `FayGer`):

- Monta corpus normativos específicos del rol, índices arquitectónicos o procedimientos operativos estándar (SOP).
- Aplica una **Compuerta de Política de Carta** obligatoria antes de emitir cualquier compromiso externo o comando hacia un anfitrión (`Host`), contrastando cada acción propuesta frente a la lista blanca `allowed_capabilities` y frente al arreglo de líneas rojas `prohibited_actions`. Cualquier acción que roce una línea roja o supere `max_autonomy_tier` (por ejemplo, intentar una mutación irreversible de estado mientras `allow_irreversible_actions` es `false`) suspende automáticamente la ejecución y escala la solicitud al steward humano responsable o a un gestor operativo `iFay` autorizado.

---

## 2.3 `RoleCharter` 1.0: la constitución institucional que reemplaza a la Capa Ego

Allí donde un modelo `Ego` responde a la pregunta *«¿De quién soy réplica personal y qué sensibilidades personales preservo?»* para un `iFay`, **`RoleCharter` 1.0** (URI normativa del esquema: `https://ifay.ai/schemas/cofay-role-charter-1.0.json`) responde para un `coFay` a: *«¿Qué mandato público cumplo, quién ostenta mi propiedad, qué persona natural responde por mí, qué capacidades puedo ejercer y qué líneas rojas no debo cruzar jamás?»*.

Un documento `RoleCharter` 1.0 conforme consta de cinco bloques estructurales normativos:

### (1) Bloque de identidad y metadatos de revisión
- `schema_version`: Fijado en la cadena de dos segmentos `"1.0"`.
- `charter_id` (`chr_<base32>`) y el entero estrictamente positivo `charter_revision`: Establecen un ancla inequívoca de versión para cada enmienda de la carta.
- `cofay_id` (`cofay_<base32>`), el nombre legible `display_name` y `role_archetype` (uno de los tres arquetipos canónicos de rol público).
- `lifecycle_state`: Declara explícitamente `"ACTIVE"`, `"SUSPENDED_PENDING_SUCCESSION"` (congelación de preservación pendiente de sucesión) o `"REVOKED"` (dado de baja de forma permanente).
- `transfer_nonce`: Se inicializa en `0` y se incrementa estrictamente en `1` únicamente tras cada transferencia válida de propiedad con doble firma.

### (2) Bloque de anclaje de responsabilidad y delegación ortogonal
- `owner`: Referencia de propiedad de capa única que especifica `human` (`hid_<base32>`) u `organization` (`org_<slug|base32>`).
- `steward_human_id`: Identificador obligatorio del steward de persona natural (`hid_<base32>`) siempre que `owner.type === "organization"`, garantizando que la responsabilidad organizativa penetre directamente hasta un ser humano identificable.
- `managers`: Cero o más identificadores ortogonales de delegados operativos (`ifay_<base32>[]`).

### (3) Bloque de declaración de misión, lista blanca de capacidades y líneas rojas de conducta
- `mission_statement`: Declaración públicamente inspeccionable del propósito institucional y del alcance del servicio.
- `allowed_capabilities.ssp_skills`: Declaraciones por habilidad que especifican la URI de habilidad (`skill_ref`), el nivel de visibilidad (`visibility`) y la compuerta de autenticación del invocador (`require_caller_auth`). Como regla normativa estricta, toda habilidad cuya `visibility` sea `"restricted"` o `"private"` **debe** exigir `require_caller_auth: true` (las infracciones fallan de inmediato con `SSP_AUTH_REQUIRED_FOR_NON_PUBLIC`), impidiendo que la ocultación por oscuridad en directorios sustituya a la autenticación criptográfica del invocador.
- `allowed_capabilities.cap_bounds`: Acota los ámbitos permitidos de permisos CAP (`allowed_scopes`), el nivel máximo de autonomía (`assistive`, `delegated` u `official_post`) y la autorización para actuaciones irreversibles (`allow_irreversible_actions`).
- `prohibited_actions`: Arreglo no vacío de líneas rojas de cumplimiento legibles por máquina.

### (4) Bloque autocontenido de política de auditoría local (`audit_policy`)
- Especifica el período mínimo de retención de registros (`retention_days`), el modo de almacenamiento a prueba de manipulaciones (`hash_chain` o `append_only`) y la atribución obligatoria del actor (`require_actor_trace: true`).
- Exige que cada entrada del registro de acciones representativas salientes consigne la tupla canónica `(cofay_id, owner_id, actor_signer_id)` y prohíbe estrictamente `acting_as_natural_person: true` (`NATURAL_PERSON_IMPERSONATION_FORBIDDEN`), preservando plena auditabilidad probatoria incluso en redes locales aisladas.

### (5) Bloque de firma de propiedad RFC 8785 JCS + Ed25519 (`owner_signature`)
Para eliminar fallos de verificación de firmas entre distintos lenguajes causados por diferencias en el orden de claves JSON o en el formato de espacios en blanco, `RoleCharter` 1.0 impone una firma determinista: el firmante serializa la carga útil de la carta (excluyendo `owner_signature`) en bytes UTF-8 canónicos mediante el **RFC 8785 JSON Canonicalization Scheme (JCS)**, antepone la etiqueta explícita de separación de dominio `"ifay.cofay.role-charter.v1\0"` y firma la secuencia de bytes resultante empleando la clave privada Ed25519 de `owner.id` o `steward_human_id`. Modificar un solo carácter en cualquier punto de la carta dispara de forma determinista el error `CHARTER_SIGNATURE_INVALID`.
