# 04. Propiedad de capa única, delegación ortogonal y responsabilidad del Steward

## 4.1 Por qué la propiedad, la jerarquía organizativa y la delegación operativa deben permanecer ortogonales

Uno de los antipatrones arquitectónicos más peligrosos en un ecosistema distribuido de agentes a gran escala consiste en colapsar en un único árbol tres dimensiones distintas: *quién ostenta legalmente la propiedad de un agente*, *cómo se anidan las organizaciones matrices y filiales* y *quién está autorizado para operar el agente en el turno de hoy*. Permitir que un `coFay` sea propietario de otro `coFay`, o permitir que un `iFay` figure como propietario legal de un `coFay`, genera rápidamente cadenas opacas de sociedades pantalla de múltiples saltos: los auditores externos dejan de poder determinar qué persona natural o entidad jurídica asume la responsabilidad última, y las rotaciones ordinarias de personal desencadenan caídas en cascada de permisos.

Para eliminar por construcción la ambigüedad de cadenas interpuestas de múltiples saltos, `coFay`, **FayID** y **Global Merit Chain** (`GMChain`) imponen un **Modelo Unificado de Tres Ejes Ortogonales** en todos los repositorios (véanse `FayID` y `Global-Merit-Chain`):

1. **Eje de Propiedad**: Responde a *«¿Quién ostenta los derechos de propiedad y la responsabilidad jurídica última sobre este `coFay`?»*. Limitado estrictamente a **propiedad de capa única**.
2. **Eje de Jerarquía Organizativa**: Responde a *«¿Cómo se relaciona una empresa matriz con sus divisiones filiales?»*. Se expresa exclusivamente dentro del propio árbol acíclico con raíz de padre único de `OrganizationID` en `FayID`, sin simularse jamás mediante el anidamiento de instancias `coFay`.
3. **Eje de Delegación Operativa**: Responde a *«¿Qué avatares individuales están autorizados para operar este `coFay` durante los turnos diarios?»*. Se otorga ortogonalmente mediante delegaciones de un solo salto `managers: iFayID[]` sin alterar el `owner` subyacente.

---

## 4.2 Invariante de propiedad de capa única y responsabilidad del Steward de persona natural

Bajo `RoleCharter` 1.0, todo `coFay` tiene en cada instante un único `owner` responsable:

- **Propiedad directa de persona natural**: `owner = { "type": "human", "id": "hid_<base32>" }`
- **Propiedad directa organizativa**: `owner = { "type": "organization", "id": "org_<slug|base32>" }`

Tanto la evaluación de JSON Schema como la validación en tiempo de ejecución rechazan de forma determinista cualquier intento de poblar `owner.id` con un identificador `ifay_<base32>` o `cofay_<base32>`, devolviendo `OWNER_TYPE_FORBIDDEN`. Incluso cuando una filial propietaria `org_sub` posee una organización matriz registrada `org_parent` en `FayID`, el campo `owner` del `coFay` debe designar explícitamente al titular directo `org_sub` y jamás se consolida de forma implícita hacia la entidad matriz.

### Steward obligatorio de persona natural bajo propiedad organizativa
Una organización es una abstracción jurídica e institucional: no puede custodiar físicamente claves criptográficas en hardware ni ejercer supervisión ética humana por sí sola. En consecuencia, `RoleCharter` 1.0 impone una regla estricta de penetración de responsabilidad:

> **Todo `coFay` cuyo `owner.type === "organization"` debe declarar explícitamente un steward válido de persona natural en `steward_human_id` (formateado estrictamente como `hid_<base32>`).**

- Omitir `steward_human_id` bajo propiedad organizativa falla de inmediato con `ORG_STEWARD_REQUIRED`.
- Suministrar un identificador `ifay_` o `cofay_` en `steward_human_id` falla de inmediato con `STEWARD_MUST_BE_HUMAN`.

Esta regla garantiza que, por compleja que llegue a ser una corporación o administración pública, cada `coFay` activo en el ecosistema permanezca anclado a una persona natural inequívocamente identificable y directamente responsable del cumplimiento de la carta.

---

## 4.3 Delegación operativa ortogonal de un solo salto mediante `iFay` y prohibición de redelegación

En la operación diaria, un **Human Prime** propietario o un steward organizativo no puede firmar manualmente cada actualización rutinaria de configuración ni cada despacho de cola las veinticuatro horas del día. Para habilitar operaciones escalables por turnos, el propietario o steward puede incluir uno o varios avatares individuales pertenecientes a Human Primes de confianza dentro de `RoleCharter.managers` (por ejemplo, `["ifay_opsmanageralpha2345", "ifay_opsmanagerbravo2345"]`).

La delegación operativa ortogonal aplica tres invariantes estrictos de seguridad:

1. **La delegación operativa nunca altera la propiedad**: Añadir o retirar entradas en `managers` ajusta únicamente la representación operativa ordinaria; `owner` permanece intacto. Los gestores operativos no pueden iniciar transferencias de propiedad ni enmendar la declaración de misión o las líneas rojas de conducta del `RoleCharter`.
2. **Los delegados deben ser exclusivamente avatares `iFay`**: Las acciones ordinarias de gestión deben cursarse a través de avatares individuales gobernados directamente por Human Primes responsables. Asignar otro `coFay` como gestor del `coFay` actual se rechaza estrictamente con `MANAGER_TARGET_INVALID`, evitando bucles de control entre roles.
3. **Disciplina estricta de un solo salto (sin redelegación)**: Únicamente `owner.id` o `steward_human_id` pueden emitir cambios de delegación `GRANT` o `REVOKE`. Si un gestor ya autorizado `ifay_A` intenta subdelegar privilegios de gestión a `ifay_B`, el validador rechaza de inmediato la solicitud con `MANAGER_REDELEGATION_FORBIDDEN`. La restricción a un solo salto corta de raíz la propagación descontrolada de privilegios.

---

## 4.4 Cadena de responsabilidad de extremo a extremo a través de cinco protocolos centrales del ecosistema

¿Cómo enlaza un `coFay` conforme este modelo de responsabilidad a lo largo de toda la pila de protocolos? El siguiente diagrama traza la topología de coordinación entre cinco repositorios, desde el registro soberano de identidad hasta la actuación acotada sobre anfitriones (`Hosts`) y la atribución de mérito:

```text
[FayID 1.0] Establece identidades hid_ / org_ / ifay_ / cofay_ y propiedad de capa única
     │
     ▼
[coFay RoleCharter 1.0] Propietario o steward firma la carta: fija arquetipo, límites SSP/CAP y managers[]
     │
     ├──▶ [Faying 1.1] (Perfil de Custodia Delegada de coFay)
     │      Verifica la cadena de credenciales Human Prime / Steward ──▶ Gestor iFay ──▶ coFay
     │
     ├──▶ [SSP 1.0 y CAP 1.0]
     │      Publica descriptores SSP firmados con JWS bajo cofay_; acciona anfitriones dentro de cap_bounds
     │
     └──▶ [GMChain]
            Registra contribuciones sociales verificadas en el MeritPocket 1:1 (MeriToken no monetario)
```

En concreto, la integración entre protocolos sigue tres apretones de manos normativos:

- **Alineación con `Faying 1.1`**: Mientras que `Faying 1.0` se centra en el emparejamiento 1:1 entre un Human Prime y su `iFay` personal y permanece congelado tal como se publicó, la extensión retrocompatible **`Faying 1.1` (Perfil de Custodia Delegada de `coFay`)** (véase `Faying-Protocol`) transporta cadenas verificables de delegación a lo largo de `Human Prime / Steward -> Gestor iFay -> coFay`, junto con la semántica de autorización para transferencias de propiedad con doble firma, sin romper las implementaciones 1.0.
- **Alineación con `SSP 1.0`**: Cuando un invocador externo (habitualmente un `iFay` que opera bajo el Mandato de su Human Prime) invoca una habilidad de un `coFay`, `InvocationRequest.caller.id` porta un `FayID` canónico, mientras el `coFay` exige autenticación mutua del invocador tanto en la obtención de descriptores como en la ejecución de habilidades para todos los puntos `restricted` y `private` (véase `Skill-Sharing-Protocol`).
- **Alineación con `CAP 1.0`**: Siempre que un `coFay` habita y acciona un quiosco o una aplicación empresarial que actúa como **anfitrión** (`Host`, es decir, dispositivo terminal de hardware o aplicación de software), el controlador del anfitrión evalúa el descriptor de autorización CAP frente a `RoleCharter.allowed_capabilities.cap_bounds`, bloqueando cualquier comando que exceda `allowed_scopes` o vulnere `allow_irreversible_actions` (véase `Control-Authority-Protocol`).

---

## 4.5 Pistas de auditoría de actuación representativa y trazabilidad sin conexión

Para garantizar la reconstrucción forense durante revisiones regulatorias o análisis post mortem de incidentes, `coFay` define la **trazabilidad representativa** como un invariante semántico intrínseco, independiente de la disponibilidad de red externa o de la conectividad en vivo con cadenas de bloques:

1. **Cero suplantación de persona natural**: Toda declaración externa, respuesta de habilidad o acción sobre un anfitrión (`Host`) emitida por un `coFay` se ejecuta estrictamente en nombre del rol público regido por carta bajo su propietario responsable. Cualquier registro de auditoría que incluya `acting_as_natural_person: true` falla de inmediato en la validación con `NATURAL_PERSON_IMPERSONATION_FORBIDDEN`.
2. **Ancla obligatoria de auditoría en tripleta**: Todo registro saliente de invocación, refrendo o mutación de estado debe persistir conjuntamente tres identificadores criptográficos:
   - `cofay_id`: Identificador del rol público que ejecuta la acción.
   - `owner_id`: Identificador del propietario legal de capa única en la marca exacta de tiempo de la ejecución.
   - `actor_signer_id`: Identificador del poseedor autorizado de clave que firmó la acción (restringido estrictamente a la propia clave de rol `cofay_`, `owner.id`, `steward_human_id` o un `ifay_` activo listado en `managers`; cualquier firmante no autorizado falla de inmediato con `AUDIT_ACTOR_UNAUTHORIZED`).
3. **Degradación elegante sin conexión**: Incluso cuando un despliegue opera dentro de una instalación aislada de red o antes de conectarse a la red principal de `GMChain`, los registros locales de auditoría en modo `hash_chain` o `append_only` conservan prueba criptográfica íntegra sobre cada tupla `(cofay_id, owner_id, actor_signer_id)`, habilitando el anclaje opcional por lotes de resúmenes criptográficos una vez restablecida la conectividad.
