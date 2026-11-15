# 03. Taxonomía de roles públicos y escenarios de aplicación

## 3.1 Por qué `RoleCharter` 1.0 establece una taxonomía canónica de roles

En las instituciones del mundo real, los roles públicos abarcan desde la tramitación de licencias municipales y el soporte empresarial hasta la auditoría regulatoria, la investigación científica conjunta y la gobernanza de código abierto. Tratar cada rol público como una masa indiferenciada en `RoleCharter` 1.0 o, en el extremo opuesto, codificar de forma rígida cientos de verticales sectoriales socavaría la integridad del protocolo: un modelo sin tipificación no puede imponer líneas base diferenciadas de seguridad según el grado de autoridad institucional, mientras que una enumeración vertical desbordada fragmentaría la interoperabilidad entre dominios.

Para equilibrar precisión y extensibilidad, `coFay` clasifica los roles públicos según tres rasgos estructurales ortogonales: **topología externa de servicio, límite de autoridad discrecional y ciclo de vida del puesto**. La combinación de estos rasgos produce tres valores canónicos de `role_archetype` en la versión 1.0:

1. **`org_service` (Ventanilla organizativa de servicio público)**
2. **`functional_post` (Cargo funcional estatutario o de gobernanza)**
3. **`project_collaborator` (Unidad colaborativa de proyecto o propósito especial)**

Todo documento `RoleCharter` 1.0 válido debe declarar exactamente uno de estos tres valores en `role_archetype`; cualquier cadena no reconocida falla de inmediato en la validación con `ROLE_ARCHETYPE_INVALID`.

---

## 3.2 Arquetipo 1: `org_service` (Ventanilla organizativa de servicio público)

### Posicionamiento y características definitorias
`org_service` representa una **fachada estandarizada de consulta, admisión de solicitudes y entrega de habilidades** operada hacia el exterior por una empresa, organismo público, asociación sectorial o titular profesional independiente. Es el arquetipo con el que los invocadores externos interactúan con mayor frecuencia en la actividad cotidiana.

- **Estructura típica de propiedad**: Habitualmente pertenece a un `OrganizationID` (como `org_civic-service-bureau`) acompañado de un steward obligatorio de persona natural (`steward_human_id`); los estudios independientes o profesionales colegiados individuales también pueden anclar `owner` directamente a un `HumanID`.
- **Perfil recomendado de autonomía CAP**: Suele configurarse en `assistive` o `delegated` con `allow_irreversible_actions` fijado en `false`. Este perfil habilita consultas automatizadas de normativa, clasificación de incidencias, programación de citas y ejecución estandarizada de habilidades, mientras escala cualquier compromiso jurídico o administrativo irreversible al steward humano o a un gestor `iFay` autorizado.
- **Patrón de exposición de habilidades SSP**: Combina habilidades `public` de consulta sin autenticación (como tablas de tasas o listas de requisitos documentales) con habilidades `restricted` de presentación de expedientes y seguimiento de casos que exigen autenticación del invocador (`require_caller_auth: true`).

### Escenario de producción: ventanilla municipal de licencias y consulta ciudadana
Una oficina municipal de servicios administrativos despliega `cofay_orgservicedesk234567` como su ventanilla pública de licencias. En lugar de recorrer portales administrativos fragmentados, un vecino instruye a su `iFay` personal: *«Verifica los requisitos de seguridad contra incendios y registro mercantil necesarios para abrir una librería de barrio»*.

1. El `iFay` del residente descubre el `coFay` municipal mediante **SSP** y verifica en primer lugar tanto la declaración de propiedad de `org_civic-service-bureau` como la firma Ed25519 del steward humano sobre su documento `RoleCharter` 1.0.
2. Una vez verificada la carta, el `iFay` del residente invoca la habilidad `public` de consulta de requisitos y, tras obtener confirmación explícita de su **Human Prime**, presenta un expediente de revisión preliminar mediante la habilidad `restricted` de registro.
3. Detrás de esa única identidad `cofay_`, decenas de réplicas trabajadoras sin estado absorben en paralelo el pico de tráfico matutino, sellando cada acuse de revisión preliminar con una tupla auditable de procedencia `(cofay_id, owner_id, actor_signer_id)`.

---

## 3.3 Arquetipo 2: `functional_post` (Cargo funcional estatutario o de gobernanza)

### Posicionamiento y características definitorias
`functional_post` modela un **asiento institucional permanente investido de autoridad explícita por carta, deberes de atestación de cumplimiento o potestad de firma operativa** dentro de una organización, un consorcio interentidades o una infraestructura del ecosistema. Su principio rector es la permanencia institucional: *el cargo perdura mientras sus titulares rotan*.

- **Estructura típica de propiedad**: Pertenece a un consejo de gobernanza, fundación u órgano corporativo de control interno (`OrganizationID`) y se vincula estrictamente al titular humano en ejercicio mediante `steward_human_id`.
- **Alineación semántica con `Official_Post` de CAP**: Dentro del **Control Authority Protocol** (`CAP`), los anfitriones (`Hosts`) físicos de alta sensibilidad y las operaciones sobre infraestructuras críticas exigen descriptores de autorización emitidos o refrendados por un cargo institucional (`Official_Post`; véase `Control-Authority-Protocol`). Un `coFay` de tipo `functional_post` actúa como portador normativo de dicha semántica en la capa de rol y puede declarar `cap_bounds.max_autonomy_tier: "official_post"`.
- **Rotación de mandato y continuidad ininterrumpida de reputación**: Cuando un auditor jefe de seguridad concluye su mandato y asume un sucesor, la organización propietaria actualiza `steward_human_id` y el arreglo de delegados de turno `managers: iFayID[]`, publicando una revisión incrementada del `RoleCharter` (`charter_revision + 1`). Durante toda la transición, el identificador `cofay_` del cargo, las suscripciones de observadores externos y el historial acumulado en su `MeritPocket` continúan sin interrupción alguna.

### Escenarios de producción: asiento de auditoría de seguridad del ecosistema y puesto de despacho logístico de baja altitud
- **Cargo de auditoría de seguridad del ecosistema**: Un consorcio de seguridad de código abierto establece un puesto permanente de divulgación de vulnerabilidades y atestación de parches, `cofay_govpostauditor234567`. Los proyectos miembros remiten avisos de seguridad directamente a ese cargo; los investigadores de guardia operan el asiento mediante sus delegados `iFay` autorizados para reproducir fallos y refrendar boletines de remediación, permitiendo que los consumidores aguas abajo anclen su confianza en una única cadena duradera de claves del cargo.
- **Puesto de despacho aéreo de baja altitud en campus industrial**: La autoridad de un parque industrial opera un `coFay` de tipo `functional_post` dedicado al despacho aéreo que interactúa mediante CAP y DTP con drones autónomos de reparto que actúan como anfitriones (`Hosts`) de hardware. Cuando una cizalladura severa de viento activa los umbrales de seguridad de la carta, el puesto emite directivas deterministas de suspensión en tierra sobre los corredores de vuelo activos dentro de sus ámbitos CAP acotados.

---

## 3.4 Arquetipo 3: `project_collaborator` (Unidad colaborativa de proyecto o propósito especial)

### Posicionamiento y características definitorias
`project_collaborator` está diseñado específicamente para repositorios de código abierto, proyectos interinstitucionales de investigación, grupos de trabajo de estandarización e iniciativas de ingeniería entre empresas, actuando como un **punto compartido de equipo que agrega grafos de conocimiento de dominio, tuberías automatizadas de verificación y flujos colaborativos de trabajo**.

- **Ciclo de vida típico de propiedad**: Suele inicializarse bajo el `HumanID` personal del fundador del proyecto durante la etapa temprana de incubación. Cuando la iniciativa madura y se incorpora a una fundación de código abierto o a un instituto formal de investigación, la transferencia atómica de propiedad con doble firma (`TransferEnvelope` 1.0) traspasa limpiamente el `coFay` al `OrganizationID` de la fundación sin romper una sola referencia al punto de enlace `cofay_` configurada por colaboradores externos.
- **Encaje colaborativo multiprotocolo**: Se combina de forma natural con el **Interactive Conversation Protocol** (`ICP`) para emitir anotaciones estructuradas de revisión `.ctx` sobre borradores RFC, manuscritos o especificaciones de código, y con el **Telepathy Protocol** (`TP`) para coordinar espacios compartidos y acotados de trabajo entre los avatares `iFay` individuales de los colaboradores (véanse `Interactive-Conversation-Protocol` y `Telepathy-Protocol`).

### Escenario de producción: bot interinstitucional de investigación y conformidad de protocolos
Un grupo multilingüe de trabajo sobre protocolos abiertos lanza `cofay_ossprojectbot234567` bajo el arquetipo `project_collaborator`. Colaboradores distribuidos en múltiples husos horarios conectan directamente sus avatares personales `iFay` a la unidad sin esperar a que despierten los mantenedores humanos: el `coFay` ejecuta vectores de conformidad, audita invariantes terminológicos en nueve idiomas y devuelve anotaciones estructuradas de revisión `.ctx`. A medida que los pares validan revisiones de alta utilidad en **Global Merit Chain** (`GMChain`), la atribución de **MeriToken** no monetario se acumula de forma continua en el `MeritPocket` dedicado de la unidad, reflejando con transparencia el impacto público del proyecto colaborativo.

---

## 3.5 Comparación de líneas base de capacidades entre los tres arquetipos de rol

| Dimensión | `org_service` | `functional_post` | `project_collaborator` |
| :--- | :--- | :--- | :--- |
| **Objetivo primordial de diseño** | Admisión estandarizada de alta concurrencia para atención ciudadana o comercial | Gobernanza permanente con rendición estricta de cuentas, refrendo y atestación normativa | Síntesis de conocimiento de dominio, coordinación de I+D multipartita y custodia transferible |
| **Propietario típico de capa única** | `OrganizationID` (o `HumanID` de titular individual) | `OrganizationID` (con steward obligatorio de persona natural) | `HumanID` durante la incubación; transferido habitualmente a `OrganizationID` al madurar |
| **Visibilidad típica de habilidades SSP** | Combinación de consulta `public` + admisión `restricted` | Predominantemente `restricted` o `private` con autenticación obligatoria del invocador | `public` (colaboración abierta) o `restricted` (miembros del consorcio) |
| **Techo típico de autonomía CAP** | `assistive` / `delegated` | `delegated` / `official_post` | `assistive` / `delegated` |
| **Transición canónica de ciclo de vida** | Rotación de turnos entre `managers` operativos | Relevo de mandato del steward titular (`cofay_` invariable) | Transferencia de propiedad con doble firma del fundador individual a una fundación |
