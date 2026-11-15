# 01. Descripción general y posicionamiento ontológico

## 1.1 Por qué una sociedad digital no puede componerse únicamente de avatares individuales

A medida que los agentes de IA autónomos y asistivos se integran en las redes de colaboración humana, modelar cada entidad digital como el espejo privado de una persona natural específica choca rápidamente contra un límite estructural. Cuando un ciudadano presenta una solicitud de licencia municipal, cuando un ingeniero de software solicita una auditoría de cumplimiento a una fundación de código abierto o cuando un grupo de trabajo interinstitucional se conecta a una mesa hospitalaria de triaje activa las veinticuatro horas, quien realiza la llamada no busca una réplica de la personalidad privada del empleado de turno. Por el contrario, requiere un **rol social público con límites explícitos de autoridad, un contrato de servicio transparente y una continuidad institucional que persista sin interrupciones a través de las rotaciones de personal**.

Para resolver este requisito fundacional desde la raíz arquitectónica, el ecosistema iFay establece una fórmula ontológica binaria (véase la especificación marco en `ifay`):

`Fay = iFay + coFay`

Dentro de esta fórmula, **`Fay`** actúa estrictamente como el sustantivo paraguas que abarca todas las encarnaciones digitales del ecosistema; jamás debe emplearse de forma aislada para designar únicamente avatares personales o únicamente entidades no personales. El ecosistema se compone de dos especies complementarias y ortogonales:

1. **`iFay` (`Individual Fay`, avatar digital individual)**: Instanciado a partir de una persona natural específica, denominada **Human Prime** (o **Prime**), y equipado con un modelo personal compacto de **Ego** alineado con los valores, preferencias y hábitos de comportamiento de dicho Prime. Un `iFay` opera como la extensión personal del Human Prime a través de **anfitriones** (`Hosts`) digitales y físicos (donde `anfitrión` / `Host` se refiere estrictamente a dispositivos terminales de hardware o aplicaciones de software, y nunca a seres humanos).
2. **`coFay` (`Common Fay`, encarnación de rol público)**: Definido y gobernado por un **`RoleCharter`** normativo, un `coFay` es una encarnación funcional de rol social públicamente direccionable e identificada mediante el prefijo canónico `cofay_` (véase `FayID`). En lugar de replicar la personalidad privada o la memoria episódica de ninguna persona natural, un `coFay` desempeña funciones públicas en nombre de una organización jurídica, un cargo institucional de gobernanza o un proyecto colaborativo.

---

## 1.2 La divisoria ontológica: activos transferibles de rol frente a extensiones personales intransferibles

El eje fundamental que separa a `coFay` de `iFay` no reside en qué modelo fundacional se ejecuta internamente ni en qué clúster despliega el contenedor. La verdadera frontera es una **distinción ética, jurídica y de derechos de propiedad entre un activo institucional de rol y una extensión inalienable de la personalidad de una persona natural**:

| Dimensión comparativa | `iFay` (Fay de extensión personal) | `coFay` (Fay de activo institucional de rol) |
| :--- | :--- | :--- |
| **Esencia ontológica** | Réplica digital de la voluntad personal, las preferencias y las capacidades de un Human Prime | Cargo social regido por carta constitutiva, ventanilla organizativa de servicio o punto colaborativo |
| **Relación con las personas naturales** | Vinculado 1:1 de por vida a un único Human Prime (un Prime puede poseer múltiples instancias `iFay`); **estrictamente nunca se vende ni se transfiere** | Propiedad de capa única bajo `HumanID` u `OrganizationID`; **admite transferencia atómica de propiedad con doble firma** |
| **Representación externa** | Actúa estrictamente en nombre personal de su único Human Prime | Desempeña funciones de rol público en nombre de su **propietario responsable actual** (organización o titular individual), sin suplantar jamás a una persona natural |
| **Gestión ante incapacidad o disolución** | Transiciona tras el fallecimiento del Human Prime hacia supervisión de guardián o entorno conmemorativo restringido (véase `ifay`) | Entra en congelación de preservación `SUSPENDED_PENDING_SUCCESSION` si la organización propietaria se disuelve o si su steward humano sufre incapacidad antes del traspaso (véase `FayID`) |
| **Cuenta en Global Merit Chain (`GMChain`)** | Vinculada a la reputación personal; la sucesión post mortem aplica un recorte estricto por niveles de intimidad (véase `Global-Merit-Chain`) | Vinculada 1:1 a un `MeritPocket` dedicado al rol; la transferencia válida de propiedad con doble firma **preserva la continuidad del rol con recorte sucesorio cero sobre `MeriToken`** |
| **Autoridad de conformidad** | **iFACTS** (iFay Architecture Conformance Test Suite) | **coFACTS** (Common Fay Architecture Conformance Test Suite) |

Difuminar estas dos especies provoca graves fallos de gobernanza en ambas direcciones. Presentar un punto corporativo de atención al cliente como una «persona digital autónoma» dotada de autoconciencia crea una caja negra de responsabilidad diseñada para blindar a los operadores frente a responsabilidades jurídicas y éticas cuando ocurren infracciones o daños. En sentido inverso, utilizar el `iFay` personal de un empleado como mesa oficial de contratación de una empresa ata las relaciones institucionales y la confianza pública a una identidad privada que se fractura en el instante en que ese empleado cambia de puesto.

`coFay` elimina este dilema mediante la encarnación institucionalizada de roles: el cargo público perdura pese a los relevos de personal, su carta rectora permanece públicamente verificable, la responsabilidad jurídica penetra sin ambigüedad hasta personas naturales identificables y la dotación operativa rota con fluidez sin interrumpir el servicio.

---

## 1.3 Cuatro pilares sociales de los roles públicos direccionables

Una vez establecida la división binaria del trabajo, `coFay` cumple cuatro funciones de infraestructura insustituibles en todo el ecosistema:

### 1. Desacoplar el direccionamiento del servicio público respecto del personal operativo interno
Del mismo modo en que los nombres de dominio DNS y los puertos estándar desacoplaron el acceso a un servicio de red respecto del número telefónico de un operador concreto de máquinas, `coFay` permite que los Human Primes (actuando a través de avatares `iFay` gobernados) y otras instancias `Fay` direccionen directamente roles funcionales. Quien solicita orientación tributaria municipal se conecta al `coFay` de asesoría fiscal; quien reporta una vulnerabilidad en software libre se conecta al `coFay` del puesto de seguridad del proyecto. El invocador verifica criptográficamente el `RoleCharter` y la firma de propiedad asociados a ese identificador `cofay_` sin necesitar saber qué instancia delegada operativa cubre el turno detrás del punto de enlace.

### 2. Erradicar los «agentes autónomos huérfanos» sin rendición de cuentas
Bajo los invariantes de gobernanza del ecosistema `Fay`, ninguna «IA autónoma silvestre» carente de titular puede operar al margen de la responsabilidad de una persona natural o entidad jurídica. Desde su creación, todo `coFay` se ancla exactamente a un único propietario de capa única (`HumanID` u `OrganizationID`). Siempre que el propietario sea una organización, la carta exige además un steward explícito de persona natural (`steward_human_id`). Cada invocación saliente de habilidades, solicitud de control sobre un anfitrión (`Host`) o interacción registral se rastrea de forma determinista a lo largo de una cadena de firmas criptográficas hasta el propietario legal y el actor firmante activo.

### 3. Acumular confianza pública institucional a través de las transiciones de personal
La credibilidad social de una ventanilla administrativa municipal, un asiento en un comité académico de revisión por pares, un equipo mantenedor de código abierto o una oficina comercial de atención pertenece a la trayectoria institucional de ese rol a lo largo del tiempo. Al vincular 1:1 un `MeritPocket` dedicado a cada identidad `cofay_` en **Global Merit Chain** (`GMChain`; véase `Global-Merit-Chain`), el **MeriToken** (cuya unidad contable mínima es `μ` / **Merit Unit**) obtenido mediante contribuciones sociales verificadas se acumula de manera continua bajo el propio rol. Como línea roja inmutable del ecosistema, `MeriToken` es una medida estrictamente no monetaria de contribución social y peso de gobernanza: nunca se mina, nunca admite especulación, nunca permite retiro en efectivo y jamás admite intercambio bidireccional ni conversión a moneda fiduciaria.

### 4. Aislar los planos de colaboración pública frente a la privacidad personal
El `iFay` personal de un Human Prime procesa trayectorias vitales íntimas, comunicaciones privadas y preferencias personales protegidas por estrictas fronteras de privacidad por defecto (véase `FayID`). Por el contrario, `coFay` está diseñado específicamente para dominios colaborativos públicos o sujetos a control de acceso. Su identificador `cofay_`, entidad propietaria, declaración de misión, descriptores expuestos del **Skill Sharing Protocol** (`SSP`) y líneas rojas de conducta prohibida se publican dentro de un `RoleCharter` criptográficamente verificable, permitiendo que los invocadores externos ejecuten comprobaciones previas de cumplimiento bajo confianza cero antes de iniciar una sola interacción.

---

## 1.4 Autocontención en repositorio único y fronteras de autoridad entre repositorios

Siguiendo la disciplina de ingeniería del ecosistema de **autocontención en repositorio único y degradación elegante sin conexión**, este repositorio define localmente el contrato normativo completo de `coFay`: la ontología de rol de tres capas libre de Ego, el esquema `RoleCharter` 1.0, las reglas de delegación operativa de un solo salto, la transferencia atómica de propiedad con doble firma (`TransferEnvelope` 1.0) y los criterios de verificación `coFACTS` L1. Los equipos de desarrollo pueden emitir, validar, transferir y auditar documentos `RoleCharter` y registros de actuación representativa en un entorno local aislado de red sin conectarse a nodos externos de cadena de bloques ni a servidores remotos de directorio.

Al mismo tiempo, esta especificación impone una frontera estricta de **ausencia de doble fuente de verdad**, referenciando normativamente a los repositorios hermanos allí donde las primitivas fundacionales ya están definidas con autoridad:

- **Codificación canónica de identificadores (`hid_` / `ifay_` / `cofay_` / `org_`), criptografía de posesión de clave (Holder-of-Key) y árboles organizativos de padre único**: Definidos con autoridad en **FayID**.
- **Protocolos de custodia delegada entre Human Prime, gestor `iFay` y `coFay` (perfil de custodia delegada `Faying 1.1`)**: Definidos con autoridad en **Faying-Protocol**.
- **Descubrimiento de habilidades, firma de descriptores JWS y autenticación del invocador**: Definidos con autoridad en **Skill-Sharing-Protocol (`SSP`)**.
- **Permisos sobre anfitriones terminales (`Hosts`) y ámbitos de recursos controlados (incluida la semántica de puesto `Official_Post`)**: Definidos con autoridad en **Control-Authority-Protocol (`CAP`)**.
- **Registro contable en cadena de `MeritPocket`, matemática de decaimiento del `MeriToken` no monetario y votación ponderada de gobernanza**: Definidos con autoridad en **Global-Merit-Chain (`GMChain`)**.
- **Arquitectura marco de cuatro capas y conformidad `iFACTS` para avatares individuales**: Definidas con autoridad en **ifay**.
