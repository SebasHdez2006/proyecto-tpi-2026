# Convenciones de documentación — normas y simbología

Este documento define las reglas que siguen **todos** los documentos del
proyecto (`docs/fase0/` y `docs/etapas/`). Su objetivo es que cualquier lector
(docente, equipo u otros grupos) interprete los diagramas y tablas de forma
consistente.

## 1. Reglas generales

| Regla | Norma |
|---|---|
| Idioma | Español técnico |
| Formato | Markdown versionado en Git, dentro de `docs/` |
| Diagramas | **Como código** siempre que sea posible (diff legible en Git) |
| Numeración | Toda figura lleva título: `Diagrama N — <nombre>` y se referencia en el texto |
| Leyenda | Todo diagrama con simbología no obvia incluye una tabla "Cómo leer el diagrama" |
| Estado | Cada documento indica su estado: `Borrador` / `En revisión` / `Aprobado` |
| Bloques de código | Cercas ```` ``` ```` con el lenguaje indicado (`sh`, `sql`, `mermaid`…) |

## 2. Herramientas de diagramado por tipo

| Tipo de diagrama | Herramienta preferida | Alternativa |
|---|---|---|
| Arquitectura / despliegue / flujos | Mermaid (`flowchart`) | draw.io (.drawio + export) |
| Casos de uso, clases, secuencia (UML) | PlantUML o draw.io | Mermaid (diagramas simples) |
| Modelo entidad-relación | draw.io o PlantUML | Mermaid (`erDiagram`) |
| Prototipos de interfaz | Figma | — |

Regla: si se usa una herramienta binaria (draw.io, Figma), la **fuente** se
versiona junto a la imagen exportada.

## 3. Simbología de diagramas Mermaid (arquitectura, despliegue, flujo)

| Sintaxis | Forma | Significado |
|---|---|---|
| `[Texto]` | Rectángulo | Componente, servicio, proceso o actor genérico |
| `[(Texto)]` | Cilindro | Almacén de datos (BD, caché, volumen) |
| `((Texto))` | Círculo doble | Actor externo al sistema |
| `{Texto}` | Rombo | Decisión (solo diagramas de flujo) |
| `subgraph Nombre` | Caja contenedora | Frontera de despliegue, red o responsabilidad |
| `A --> B` | Flecha sólida | Comunicación principal síncrona |
| `A -.-> B` | Flecha punteada | Interacción auxiliar, opcional o configurable |
| `A <-->|REST| B` | Doble flecha etiquetada | Integración bidireccional entre sistemas |
| `A -->|HTTPS| B` | Flecha con etiqueta | Protocolo o propósito de la conexión |
| `A --> B & C` | Flecha ramificada | El mismo flujo hacia varios destinos |

## 4. Normas UML 2.x (Etapas 2 y 3)

### Casos de uso
- Actor: figura de persona; primario a la izquierda, secundario (servicios
  externos) a la derecha.
- Caso de uso: elipse con nombre en infinitivo ("Registrar venta").
- Límite del sistema: rectángulo que agrupa las elipses.
- Relaciones: `<<include>>` (obligatoria) y `<<extend>>` (opcional), con la
  dirección estándar UML.

### Clases / modelo de dominio
- Caja de 3 compartimentos: nombre, atributos, operaciones.
- Visibilidad: `+` pública, `-` privada, `#` protegida.
- Multiplicidades explícitas en asociaciones (`1`, `0..1`, `*`).
- Generalización con triángulo vacío; composición con rombo relleno.

### Secuencia
- Líneas de vida con el participante arriba; objetos como `nombre:Tipo`.
- Barras de activación para el tiempo de procesamiento.
- Mensajes: sólido = síncrono, punta abierta = asíncrono, punteado = retorno.
- Fragmentos `alt` / `opt` / `loop` con su condición entre corchetes.

### Entidad-relación
- Notación **pata de cuervo** (crow's foot) para cardinalidades.
- PK y FK marcadas explícitamente; nombres de tabla en singular snake_case,
  coherentes con las migraciones Alembic.

## 5. Identificadores y trazabilidad

| Prefijo | Uso | Ejemplo |
|---|---|---|
| `RF-nn` | Requisito funcional | RF-03 |
| `RNF-nn` | Requisito no funcional | RNF-01 |
| `CU-nn` | Caso de uso | CU-02 |
| `API-nn` | Endpoint documentado | API-05 → `GET /api/v1/items` |
| `Figura/Diagrama n` | Elementos gráficos por documento | Diagrama 2 |

Regla de trazabilidad: todo requisito funcional debe poder seguirse
`RF-nn → CU-nn → API-nn → implementación/prueba`.

## 6. Tablas y prioridades

- Prioridad de requisitos: **Alta / Media / Baja**.
- Tablas con fila de encabezado y columna de ID a la izquierda cuando aplica.
- Nombres técnicos (endpoints, variables, contenedores) en `código inline`.

## 7. Convenciones del sistema reflejadas en la documentación

| Elemento | Convención |
|---|---|
| Versionado de API | `/api/v1/...` |
| Identificación de nodos | `app1`, `app2`, `app3` |
| Autenticación usuario | OIDC — issuer por entorno |
| Autenticación servicio→servicio | Header `X-Service-Key` |
| Entornos | `internet` / `intranet` — diferencias solo en `.env` y overrides |
