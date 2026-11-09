# **Desarrollo de una aplicación web**

**Guía de etapas del proyecto para estudiantes**

## **Cómo funciona el proyecto**

El proyecto recorre el ciclo completo de desarrollo de una aplicación web, desde la elección de las tecnologías hasta la defensa del sistema ya puesto en producción. El orden de trabajo es el siguiente:

| Paso | Qué se hace | Cuándo ocurre |
| :---- | :---- | :---- |
| **Fase 0** | Selección de tecnologías y herramientas | Antes de conocer el problema. No cuenta como etapa. |
| **Asignación** | El docente entrega el problema: enunciado y para que el grupo identifique/defina requerimientos del sistema(etapa 1\) | Después de la Fase 0 |
| **Etapa 1** | Definición de requisitos | Basada en el problema asignado |
| **Etapa 2** | Análisis |  |
| **Etapa 3** | Diseño |  |
| **Etapa 4** | Desarrollo y programación |  |
| **Etapa 5** | Implementación (producción) |  |
| **Defensa** | Presentación del proyecto sobre el sistema implementado | Parte de la Etapa 5 |

## **Restricciones obligatorias para todos los proyectos**

Estas condiciones aplican a todos los equipos y deben tenerse presentes desde la selección de tecnologías.

| Restricción | Qué implica |
| :---- | :---- |
| **Proyectos relacionados entre sí** | Cada sistema expone APIs RESTful y consume las de otros equipos. **Ejemplo**: *Ventas descarga inventario consultando a Inventario, y Contabilidad, genera asientos a partir de las facturas de Ventas.* |
| **APIs programadas por el equipo** | **No se permite usar herramientas que generen las APIs** (json-server, APIs autogeneradas por la base de datos, Supabase, Firebase, PostgREST, Hasura y similares). Los endpoints se programan en el backend. |
| **Configurable por entorno** | El mismo código debe funcionar instalado en internet o en una intranet de red privada, cambiando solo la **configuración**: CDN, proveedor de identidad y servidor de base de datos. |
| **PWA instalable en celular** | La aplicación se instala en un smartphone/desktop y usa Service Worker y capacidades offline. API Cache,  API Service Worker |
| **Balanceo de carga** | Un servidor frontal y tres servidores de aplicación en clúster, con gestión centralizada de sesiones para que cualquier servidor atienda a cualquier usuario. BASE DE DATOS CENTRALIZADA. descartado que sea distribuida. |
| **Backend libre** | Cada equipo elige lenguaje, framework y tecnologías relacionadas, siempre que cumplan todo lo anterior. |

## **Fase 0: Selección de tecnologías y herramientas**

Esta fase se realiza antes de conocer el problema, por lo que la selección es independiente del proyecto asignado. Lo que se evalúa es que la pila tecnológica elegida pueda cumplir todas las restricciones obligatorias.

| Principio rector: un solo código, dos despliegues. Todo lo que cambia entre internet e intranet debe estar en archivos o variables de configuración, nunca en el código fuente. Un componente que exija un servicio externo para funcionar queda descartado, salvo que tenga un reemplazo(o justificación de accederlo desde interneta hacia intranet) que se pueda instalar en la intranet. |
| :---- |

### **Herramientas de desarrollo(pueden ser)**

> * Editor o IDE (Visual Studio Code, IntelliJ IDEA, Eclipse u otro)  
> * Control de versiones con Git y un repositorio (GitHub en internet, ~~Gitea o GitLab autohospedado en intranet~~)  
> * Cliente de pruebas de API (Postman, Insomnia, Bruno, curl)  
> * Herramientas de Diseño de Arquitectura de Información(balsamiq , figma).  
> * Herramientas de modelado UML y diseño de interfaces (draw.io, StarUML, PlantUML, Figma u otras)  
> * Gestor de dependencias y construcción del proyecto (Maven, Gradle, npm, pip, Composer u otro)  
> * Contenedores (Docker y Docker Compose) para reproducir el clúster en una sola máquina.  
> * Herramienta de pruebas de carga (JMeter, k6) para demostrar el balanceo

### 

### **Componentes base por capa**

| Capa | Componentes que deben estar presentes |
| :---- | :---- |
| **Presentación (cliente)** | HTML5 semántico, CSS3 responsive, JavaScript ES6 o superior. Framework JavaScript (React, Vue, Angular u otro) y framework CSS (Bootstrap, Tailwind u otro) opcionales. La URL base del CDN debe ser configurable: CDN público en internet y CDN propio de la intranet en red privada. Fuentes, íconos e imágenes siguen la misma regla. |
| **PWA y navegador** | Manifest de la aplicación con íconos, Service Worker con estrategias de caché y versionado, Cache API, detección de conexión (online y offline), almacenamiento local con IndexedDB, localStorage, sessionStorage y cookies, y cola de sincronización para las operaciones realizadas sin conexión. |
| **Identidad y acceso** | Autenticación y autorización basadas en OAuth 2.0 y OpenID Connect. En internet se puede usar un proveedor externo (Google, Microsoft, GitHub). En intranet se usa un proveedor propio (Keycloak, Authentik, Authelia u otro) o se gestionan los usuarios en el propio sistema. Roles y permisos definidos por la aplicación. |
| **Comunicación y seguridad** | HTTPS con TLS en todos los entornos. Certificados de Let's Encrypt en internet y de una autoridad certificadora interna en intranet (mkcert, step-ca, OpenSSL). Cabeceras de seguridad, CORS configurado entre proyectos, y prácticas OWASP Top 10\. |
| **Servidor frontal y servidores web** | Servidor frontal con balanceo de carga (Nginx, HAProxy, Apache o Caddy) que termina TLS, hace verificación de salud de los nodos y sirve los archivos estáticos de la PWA. |
| **Backend y APIs RESTful** | Lenguaje y framework a elección (Java con Spring Boot, Node.js con Express o NestJS, Python con FastAPI o Django, PHP con Laravel, .NET u otro). Recursos y verbos HTTP correctos, códigos de estado, JSON, paginación, versionado (/api/v1), manejo uniforme de errores y validación de entradas. Contrato documentado con OpenAPI o Swagger. Configuración externa para las URL de otras APIs, credenciales, base de datos y proveedor de identidad. |
| **Datos** | Motor de base de datos autohospedado a elección (PostgreSQL, MySQL, MariaDB, SQL Server, Oracle, MongoDB u otro). Host, puerto, credenciales y SSL configurables. Acceso a datos con código propio (ORM, JDBC o driver), con migraciones y datos de prueba versionados. |
| **Sesiones y clúster** | Almacén central de sesiones (por ejemplo Redis) o enfoque sin estado con JWT validado por cualquier nodo. No se acepta el uso de sticky sessions como solución, porque el objetivo es que cualquier nodo atienda a cualquier usuario. |
| **Integración entre sistemas** | Autenticación servicio a servicio (OAuth 2.0 con client credentials o API keys), con tiempos de espera y reintentos, y con un comportamiento definido cuando otro sistema no responde. |

### **Arquitectura de referencia**

| Usuario con smartphone o computador (PWA) HTTPS |  |  |
| :---: | :---: | :---: |
| **Servidor frontal** Nginx, HAProxy o similar. Balanceo de carga, TLS y verificación de salud |  |  |
| **Nodo 1** Servidor de aplicación | **Nodo 2** Servidor de aplicación | **Nodo 3** Servidor de aplicación |
| **Almacén de sesiones(**Redis u otro) **ó Sin ALMACÉN(JWT)**  |  | **Base de datos** Servidor propio |

Redis y la base de datos son puntos únicos de fallo. Para el alcance del proyecto basta con documentar esta limitación. Como mejora opcional se puede agregar réplica o Sentinel.

### **Advertencia sobre la PWA en intranet**

| Para instalar una PWA en un celular y registrar su Service Worker, el certificado HTTPS debe ser de confianza para el dispositivo. En una intranet con autoridad certificadora propia hay que instalar el certificado raíz en el smartphone. Este paso debe estar previsto en el diseño y descrito en el manual de instalación. |
| :---- |

### **Entregable de la Fase 0**

> 1. Tabla con cada componente, la tecnología elegida, su justificación, su configuración en internet y su configuración en intranet, incluidas herramientas de desarrollo seleccionadas  
> 2. Diagrama de arquitectura con servidor frontal, tres nodos, sesiones(debe cumplir con que si un servidor cae, cualquier otro atiende al usuario), base de datos e identidad.  
> 3. *Prueba de concepto mínima: una PWA de ejemplo instalable, detrás del servidor frontal con tres nodos, que muestre qué nodo respondió, con sesión compartida, y que cambie de entorno modificando solo la configuración.*

## 

## **Resumen de entregables**

| Etapa | Entregable |
| :---- | :---- |
| Fase 0 | Documento de selección tecnológica, lista de herramientas, diagrama de arquitectura y prueba de concepto |
| Etapa 1 | Documento de Especificación de Requisitos |
| Etapa 2 | Documento de Análisis |
| Etapa 3 | Documento de Diseño y prototipo navegable |
| Etapa 4 | Código fuente versionado y reporte de pruebas |
| Etapa 5 | Sistema en producción en modo internet y modo intranet, y ~~manuales~~ |
| Defensa | Demostración en vivo y preguntas individuales |

