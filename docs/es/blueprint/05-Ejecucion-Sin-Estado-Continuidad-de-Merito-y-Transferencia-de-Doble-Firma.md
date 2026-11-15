# 05. Elasticidad de ejecución sin estado, continuidad de mérito y transferencia de doble firma

## 5.1 Resolución de la tensión central: cómo trabajadores efímeros sin estado sostienen una cuenta continua de contribución

La ingeniería de una encarnación de rol público plantea una aparente paradoja arquitectónica:

- **Desde la perspectiva de sistemas de alta disponibilidad**: Un `coFay` que atiende invocaciones públicas de habilidades en red debe admitir autoescalado horizontal sin estado, conmutación por error multirregión y reemplazo continuo de contenedores. Terminar o reciclar cualquier proceso trabajador individual jamás debe interrumpir a los invocadores activos.
- **Desde la perspectiva de la reputación institucional**: **Global Merit Chain** (`GMChain`) vincula 1:1 cada identificador canónico `cofay_<base32>` a un `MeritPocket` dedicado (véase `Global-Merit-Chain`), acumulando a largo plazo **MeriToken** (cuya unidad mínima es `μ` / **Merit Unit**) y peso de gobernanza comunitaria obtenidos mediante servicio público verificado.

¿Cómo pueden procesos trabajadores desechables y sin estado mantener sin fisuras una cuenta plurianual de reputación institucional?

`coFay` resuelve limpiamente esta tensión **desplazando la elasticidad de ejecución hacia el plano de tiempo de ejecución sin estado mientras ancla la identidad, la gobernanza por carta y la atribución de mérito en el plano persistente de identidad y registro contable**:

```text
                           ┌───────────────────────────────────────────────────┐
Plano de Identidad         │  Identidad persistente: cofay_orgservicedesk234567│
y Registro Contable        │  Libro 1:1 vinculado:   GMChain MeritPocket (mpk_)│
(Estado continuo e         │  Ancla de gobernanza:   RoleCharter 1.0 (JCS Sig) │
 inalterable)              └─────────────────────────┬─────────────────────────┘
                                                     │ Monta idéntica carta verificada
                         ┌───────────────────────────┼───────────────────────────┐
                         ▼                           ▼                           ▼
Plano de Ejecución    [Trabajador FayGer #1]     [Trabajador FayGer #2]     [Trabajador FayGer #N]
(Réplicas elásticas   Sin Ego / Autoescalado     Sin Ego / Reemplazo        Conmutación multirregión /
 y sin estado)        bajo demanda               continuo en caliente       Listo para escalar a cero
```

1. **Elasticidad de ejecución sin estado**: Los contenedores trabajadores de **FayGer** que ejecutan el razonamiento cognitivo y el análisis de protocolos almacenan cero memoria local de personalidad (al carecer de Capa Ego). Al arrancar, cada réplica monta el `RoleCharter` 1.0 activo y verificado por firma junto con paquetes de conocimiento de dominio de solo lectura. Ante picos de tráfico, un rol puede escalar horizontalmente hasta cientos de réplicas concurrentes en cuestión de segundos y reducirse a cero durante ventanas de inactividad.
2. **Firma representativa criptográfica unificada**: Los trabajadores sin estado jamás emiten respuestas anónimas ni carentes de atribución. En su lugar, firman los recibos salientes y las atribuciones registrales mediante claves de titular `cofay_` respaldadas por HSM o gestionadas por umbral (véase `FayID`), o bien mediante firmas representativas delegadas de gestores autorizados `managers: iFayID[]`.
3. **Mérito atribuido al rol, nunca al contenedor**: Los invocadores externos y los evaluadores pares valoran la calidad del servicio prestado por el rol público `cofay_`. Todos los asientos resultantes de `MeriToken` no monetario se abonan directamente en el `MeritPocket` vinculado 1:1 a dicho identificador `cofay_`, preservando una credibilidad institucional ininterrumpida incluso después de que los operadores actualicen cientos de veces la imagen subyacente del contenedor.

---

## 5.2 Por qué los traspasos de propiedad exigen un protocolo atómico de doble firma

A diferencia de un `iFay` individual —vinculado de por vida a un único **Human Prime**—, un `coFay` funciona como un activo institucional de rol con necesidades legítimas de traspaso a lo largo de su ciclo de vida. Entre las transiciones habituales figuran la donación de un `coFay` maduro de código abierto del arquetipo `project_collaborator` desde el `HumanID` de su desarrollador fundador hacia el `OrganizationID` de una fundación de software libre, o la transferencia de una ventanilla de servicio público desde una división corporativa escindida hacia una nueva entidad operadora constituida.

Sin embargo, un mecanismo ingenuo de transferencia con una sola firma expondría tres vulnerabilidades críticas de seguridad:

1. **Secuestro unilateral o descarga maliciosa de responsabilidades**: Exigir la firma de una sola parte permitiría que un atacante se apropiara del rol de otro propietario o que un titular saliente endosara un `coFay` lastrado por disputas regulatorias o sanciones pendientes a una tercera persona u organización desprevenida.
2. **Retención de gestores obsoletos**: Antes del traspaso, el propietario saliente suele configurar delegados internos de turno en `managers: iFayID[]`. Si una transferencia de propiedad arrastrara silenciosamente la lista existente de `managers` para su limpieza manual posterior, se abriría una peligrosa ventana de condición de carrera en el corte operativo durante la cual los delegados `iFay` del antiguo propietario aún podrían firmar acciones vinculantes bajo la responsabilidad jurídica del nuevo titular.
3. **Ataques de repetición de transferencias históricas**: Sin un contador estrictamente monótono contra repeticiones y una vinculación criptográfica al resumen exacto de la carta precedente, cargas útiles históricas capturadas podrían reinyectarse para revertir la titularidad.

---

## 5.3 `TransferEnvelope` 1.0: flujo normativo para la transferencia atómica de propiedad con doble firma

Para eliminar por construcción estos tres modos de fallo, `coFay` especifica la estructura normativa **`TransferEnvelope` 1.0** (definida bajo `$defs.TransferEnvelope` en `schemas/cofay-role-charter-1.0.json`):

### Paso 1: Bloquear el estado previo de la carta y el nonce monótono antirrepetición
Todo sobre de transferencia debe vincular explícitamente:

- `prior_charter_digest_hex`: Resumen hexadecimal SHA-256 en minúsculas calculado sobre la serialización canónica RFC 8785 JCS del `RoleCharter` activo en ese momento (cualquier discrepancia falla de inmediato con `PRIOR_CHARTER_DIGEST_MISMATCH`).
- `transfer_nonce`: Estrictamente igual a `currentCharter.transfer_nonce + 1` (reutilizar un nonce antiguo o saltar valores falla de inmediato con `TRANSFER_NONCE_MISMATCH`).
- `from_owner` y `to_owner`: Ambos extremos deben satisfacer las reglas de propiedad de capa única (únicamente `HumanID` u `OrganizationID`; propietarios anidados `ifay_` o `cofay_` fallan con `OWNER_TYPE_FORBIDDEN`, y transferir hacia el mismo propietario falla con `SELF_TRANSFER_REDUNDANT`). Siempre que `to_owner.type === "organization"`, el sobre debe designar simultáneamente al steward entrante de persona natural en `new_steward_human_id`.

### Paso 2: Imponer la limpieza de gestores obsoletos o la ratificación entrante explícita (`manager_policy`)
`TransferEnvelope` 1.0 **prohíbe estrictamente la herencia silenciosa de los `managers` previos**, exigiendo elegir explícitamente entre dos políticas mutuamente excluyentes:

- **`"CLEAR_ALL"` (Opción segura recomendada por defecto)**: `ratified_managers` debe ser un arreglo vacío `[]` (un arreglo no vacío falla con `CLEAR_ALL_NON_EMPTY_MANAGERS`), revocando atómicamente a todo delegado operativo `iFay` anterior en el instante exacto en que se transfiere la propiedad.
- **`"RATIFY_NEW"` (Corte operativo sin tiempo de inactividad)**: Enumera dentro de `ratified_managers` los delegados operativos `iFay` entrantes exactos. Dado que la firma del propietario o steward entrante cubre todo el sobre de transferencia, únicamente permanecen activos los delegados `iFay` ratificados explícitamente por la parte receptora, y el protocolo purga de forma atómica cualquier delegado previo no ratificado.

### Paso 3: Recabar conjuntamente las firmas Ed25519 saliente y entrante
Tras eliminar los campos de firma, serializar el sobre mediante RFC 8785 JCS y anteponer la etiqueta de separación de dominio `"ifay.cofay.ownership-transfer.v1\0"`, la transacción requiere simultáneamente **ambas** firmas Ed25519 válidas:

- `from_signature`: Firmada por el `owner.id` saliente o por el `steward_human_id` saliente.
- `to_signature`: Firmada por el `to_owner.id` entrante o por el `new_steward_human_id` entrante.

Omitir cualquiera de las dos firmas falla de inmediato con `TRANSFER_DUAL_SIGNATURE_REQUIRED`; cualquier firmante no autorizado o carga alterada falla de forma determinista con `TRANSFER_SIGNER_UNAUTHORIZED` o `TRANSFER_SIGNATURE_INVALID`.

---

## 5.4 Continuidad sin recorte de `MeritPocket` y congelación de preservación ante incapacidad

### 1. Continuidad del rol con recorte sucesorio cero sobre `MeritPocket`
Bajo las reglas de `GMChain`, la transmisión post mortem de la reputación personal de un individuo aplica un recorte estricto en cinco niveles de intimidad (y prohíbe por completo la sucesión por debajo de un índice de intimidad de `0.1`) con el fin de que el mérito personal jamás pueda comercializarse. En cambio, en una transferencia válida de `coFay` con doble firma, el `MeritPocket` pertenece al **propio rol público `cofay_`** y no a una persona saliente. Siempre que `merit_continuity` declare simultáneamente `preserve_cofay_id: true` y `preserve_merit_pocket: true` (las infracciones fallan con `MERIT_CONTINUITY_VIOLATION`), el saldo histórico de `MeriToken` acumulado por ese rol se traslada íntegro bajo la custodia del propietario entrante con recorte sucesorio cero (véase `Global-Merit-Chain`). Naturalmente, el `MeriToken` sigue obedeciendo la curva no monetaria de decaimiento temporal de `GMChain` hacia su suelo base: ninguna organización puede acaparar privilegios estáticos de gobernanza por el mero hecho de adquirir un rol consolidado, pues la confianza pública sostenida exige siempre contribuciones verificadas continuas.

### 2. Congelación de preservación ante disolución organizativa o incapacidad del Steward (`SUSPENDED_PENDING_SUCCESSION`)
¿Qué ocurre si una organización propietaria se disuelve o si su steward registrado de persona natural sufre una incapacidad sobrevenida antes de completar una transferencia de doble firma? Conforme a las reglas de gobernanza entre repositorios alineadas con el ADR `0003` de `FayID`:

- El `coFay` **nunca se consolida silenciosamente** hacia una organización matriz, **nunca muta en un agente autónomo sin responsable** y **nunca destruye su libro histórico de mérito**.
- En su lugar, su `lifecycle_state` transiciona de forma determinista a **`"SUSPENDED_PENDING_SUCCESSION"`**: mientras permanece congelado en este estado de preservación, las mutaciones sobre `managers` operativos quedan bloqueadas (`CHARTER_NOT_ACTIVE`) y las operaciones restringidas de negocio hacia el exterior se pausan.
- Únicamente tras ejecutar un procedimiento de recuperación de gobernanza por umbral previamente registrado o completar un traspaso válido `TransferEnvelope` 1.0 con doble firma, el rol retorna al estado `"ACTIVE"` y reanuda la prestación del servicio público.
