# 06. Marco de conformidad coFACTS y hoja de ruta por fases

## 6.1 Por qué `iFACTS` y `coFACTS` imponen una frontera ortogonal

En un ecosistema abierto de protocolos con múltiples proveedores, las pruebas automatizadas de conformidad —objetivas y reproducibles— determinan si las implementaciones interoperan con fiabilidad o si se fragmentan en declaraciones incompatibles. El repositorio marco `ifay` establece **iFACTS** (*iFay Architecture Conformance Test Suite*) y los niveles de certificación `iFay Ready` para avatares digitales individuales (véase `ifay`). ¿Por qué, entonces, el ecosistema mantiene una suite independiente de conformidad para `coFay` en lugar de absorber los roles públicos dentro de `iFACTS`?

Porque **sus invariantes esenciales de seguridad son diametralmente opuestos**:

- Bajo `iFACTS`, una implementación conforme de avatar individual debe demostrar que monta y alinea con precisión el modelo personal de `Ego` de su **Human Prime**, ejecuta apretones de manos exclusivos 1:1 de emparejamiento con su Prime y respeta las transiciones de sucesión mediante guardianes.
- Bajo `coFay`, montar cualquier modelo personal de `Ego` constituye una **violación crítica de seguridad (`COFAY_EGO_FORBIDDEN`)**. En sentido inverso, los invariantes fundacionales obligatorios de `coFay` —incluida la penetración de responsabilidad hacia un steward de persona natural (`steward_human_id`), la propiedad de capa única sin anidamiento y la limpieza atómica de gestores previos durante transferencias de doble firma— no existen en los avatares personales `iFay`.

En consecuencia, el ecosistema impone una interceptación bilateral en la frontera de objetivos:

1. **`@ifay/ifacts` verifica exclusivamente implementaciones individuales de `iFay` e integraciones compatibles de anfitriones (`Hosts`)**, interceptando explícitamente objetivos `cofay_` y redirigiendo a los operadores hacia `coFACTS` (véase `ifay`).
2. **`coFACTS` (*Common Fay Architecture Conformance Test Suite*) verifica exclusivamente implementaciones de rol `coFay`, cartas constitutivas y transiciones de gobernanza**. Cada vez que `runCoFactsL1Check` detecta una entrada que porta un identificador `ifay_` o un marcador de tipo `IFAY_MANIFEST` / `IFAY_ID`, se detiene de inmediato y devuelve `conformance: "REJECTED_BOUNDARY"` con el código de error `BOUNDARY_IFAY_USE_IFACTS`.

---

## 6.2 Modelo progresivo de conformidad en tres niveles dentro de `coFACTS`

Alineado con la metodología de verificación del ecosistema, `coFACTS` define tres niveles estrictamente progresivos de conformidad (las implementaciones deben superar el 100 % de las comprobaciones L1 antes de reclamar conformidad L2 o L3):

| Nivel | Nombre del nivel de conformidad | Sistema bajo prueba y alcance central de verificación | Estado de entrega |
| :--- | :--- | :--- | :--- |
| **L1** | **Conformidad de Carta y Estado** | Verificación determinista sin conexión del cumplimiento del JSON Schema de `RoleCharter` 1.0, prohibición de la Capa Ego, enumeración de arquetipos canónicos de rol, propiedad de capa única y vinculación obligatoria de steward de persona natural, compuertas SSP de autenticación del invocador en habilidades no públicas, integridad de firmas RFC 8785 JCS + Ed25519, delegación `iFay` de un solo salto sin redelegación y transferencias atómicas de propiedad con doble firma `TransferEnvelope` 1.0 con protección contra repeticiones | **Entregado en v1.0** (integrado en `@ifay/cofay`) |
| **L2** | **Conformidad de Interfaz entre Protocolos** | Verificación en vivo a nivel de protocolo de red frente a puntos de enlace `coFay` en ejecución: valida descriptores SSP firmados con JWS en `/.well-known/skill-sharing` y autenticación mutua del invocador en puntos restringidos, cadenas de credenciales de custodia delegada `Faying 1.1`, bloqueo CAP de comandos fuera de `cap_bounds` sobre anfitriones terminales (`Hosts`) y divulgación de identidad de rol en sesiones ICP y TP | **Planificado para la Fase 2** |
| **L3** | **Elasticidad y Continuidad de Auditoría** | Simulacros integrales de resiliencia y caos de gobernanza de extremo a extremo: verifica el determinismo conductual entre trabajadores FayGer concurrentes sin estado, la integridad inalterable de registros locales encadenados por hash con la tupla `(cofay_id, owner_id, actor_signer_id)`, las transiciones automáticas de congelación `SUSPENDED_PENDING_SUCCESSION` ante incapacidad del steward y la conciliación continua de atribución registral con el estado de `MeritPocket` en **Global Merit Chain** (`GMChain`) | **Planificado para la Fase 3** |

---

## 6.3 Seis comprobaciones automatizadas `coFACTS` L1 y formato de informe legible por máquina

Exportada desde `src/cofay-charter.mjs`, la función `runCoFactsL1Check(subject)` ofrece un ejecutor de referencia L1 sin dependencias externas que emite informes JSON deterministas con `report_version: "cofacts-l1-report/1.0"`:

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

Junto con el verificador de referencia, `vectors/cofay-role-charter-vectors.json` incluye **20 vectores normativos de prueba positivos y negativos** (`V01` a `V20`). Los equipos independientes que implementen entornos de ejecución o pasarelas de gobernanza `coFay` en Rust, Go, Python o TypeScript deben aceptar todos los vectores positivos y rechazar todos los vectores negativos devolviendo exactamente su código normativo de error antes de declarar conformidad con `coFACTS` L1.

---

## 6.4 Hoja de ruta del ecosistema en cuatro fases

La evolución de `coFay` avanza de manera deliberada desde contratos criptográficos de carta constitutiva hasta la interoperabilidad en vivo entre protocolos y la gobernanza del sector público a gran escala:

### Fase 1: Línea base de especificación normativa y `coFACTS` L1 (Entregada, línea base inicial `2025-10-25`)
- Establecer la ontología de rol público de tres capas libre de Ego y los tres arquetipos canónicos de rol de la versión 1.0 (`org_service`, `functional_post` y `project_collaborator`).
- Congelar el JSON Schema normativo de `RoleCharter` 1.0 y del sobre de transferencia atómica de doble firma `TransferEnvelope` 1.0 (`schemas/cofay-role-charter-1.0.json` junto con la tríada idéntica byte por byte en `schema/2025-10-25/`).
- Distribuir 20 vectores deterministas de conformidad Ed25519 + RFC 8785 JCS junto con la biblioteca de referencia sin dependencias `@ifay/cofay` para validación y firma.
- Entregar los planos arquitectónicos completos y la guía de inicio rápido en los nueve idiomas del ecosistema.

### Fase 2: Integración en vivo de puntos de enlace entre protocolos y `coFACTS` L2 (Corto plazo)
- Completar las pruebas de interoperabilidad en vivo a nivel de red entre `Faying 1.1` (Perfil de Custodia Delegada de `coFay`), servidores de habilidades `SSP 1.0` y registros estáticos de índice en `FayGer`.
- Publicar la sonda automatizada HTTP/TLS de conformidad `coFACTS` L2 para inspeccionar refrendos activos de `RoleCharter` y verificar la exigencia de autenticación del invocador en puntos SSP restringidos.

### Fase 3: Custodia de claves por umbral, elasticidad multiinstancia y `coFACTS` L3 (Medio plazo)
- Integrar políticas organizativas de multifirma por umbral N-de-M de `FayID` para respaldar enmiendas de carta ratificadas por consejos directivos y simulacros de sucesión de emergencia en grandes instituciones públicas.
- Distribuir plantillas de trabajadores `coFay` sin estado para la orquestación de contenedores en **FayGer** junto con agregadores distribuidos de auditoría en cadena de hash a prueba de manipulaciones, habilitando la certificación completa `coFACTS` L3.

### Fase 4: Ecosistema de servicio público a escala sobre Global Merit Chain (`GMChain`) (Visión a largo plazo)
- Habilitar el descubrimiento intersectorial en directorios de roles públicos y la inspección transparente del historial en `MeritPocket`, permitiendo que ventanillas municipales de atención, comités académicos de revisión por pares y unidades de infraestructura de código abierto colaboren en una sociedad humano-agente de alta confianza, con rendición de cuentas y sin monopolios, cimentada en la atribución de **MeriToken** estrictamente no monetario.
