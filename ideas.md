# LocalGym

## Descripción

Es un sistema de gestión gratuito para gimnasios locales y de pequeño a mediano tamaño, **enfocado en gimnasios colombianos**.

---

## 1. Visión General y Pilares de Producto

LocalGym nace con la premisa de resolver de manera simple y efectiva la administración de gimnasios pequeños y medianos que hoy en día dependen de métodos analógicos (como cuadernos o planillas de cálculo manuales). Las decisiones fundamentales del producto son:

- **Público Objetivo:** Gimnasios pequeños y medianos en Colombia, con una base estimada de **50 a 800 socios**.
- **Modelo de Costo:** **Totalmente gratuito**. No existe un modelo SaaS de suscripción recurrente.
- **Ejecución Local (Offline-First):** El sistema corre en una computadora física dentro de las instalaciones del gimnasio que funciona como un "servidor local".
- **Acceso en Red Local (LAN):** Al correr de manera local en una red LAN, el servidor es accesible mediante navegador web desde cualquier otro dispositivo (teléfonos, tablets, notebooks del personal) conectado a la misma red de Wi-Fi, eliminando la dependencia de una conexión activa a internet.

---

## 2. Alcance de la Versión 1 (v1)

Para asegurar un desarrollo ágil y maduro, se ha delimitado estrictamente el alcance de la primera versión para enfocarse exclusivamente en el núcleo del problema de gestión.

### En el Alcance (v1):

- **Autenticación Sencilla:** El administrador/dueño del gimnasio crea un superusuario, quien a su vez puede crear nuevos usuarios (no superusuarios). Solo usuarios autenticados pueden acceder al sistema.
- **Gestión de Socios:** Registro y consulta de los datos principales del miembro.
- **Gestión de Membresías:** Definición de plantillas de membresía por el administrador y asignación directa a los socios.
- **Registro de Pagos Básico:** Control manual de transacciones asociadas a la contratación de membresías.
- **Control de Vigencia:** Cálculo derivado en tiempo real para verificar si un socio tiene permitido el acceso en el día actual.

### Fuera de Alcance (v1 - Planificado para el Futuro):

- Control de asistencia automatizado (lectores de huella, molinetes, QR).
- Gestión y asignación de rutinas de entrenamiento.
- Pasarelas de pagos online integradas (Stripe, etc.).
- Reportes financieros y estadísticos avanzados.
- Carga y visualización de fotos de socios.
- Apilamiento de membresías automático y secuencial.
- Roles y permisos granulares diferenciados más allá de superusuario/usuario (se mantiene el esquema lo más simple posible en v1).
- Estrategia formal de backups (pendiente de definir — ver sección 6).

---

## 3. Modelo de Dominio

El modelo de datos se ha diseñado para reflejar fielmente las reglas del negocio de manera limpia, evitando redundancias en la base de datos mediante la derivación de datos temporales. **Las entidades y sus atributos se declaran en inglés en el código; la interfaz de usuario (UI) se muestra en español.**

### A. Entidad: `Member` (Socio)

Representa al cliente del gimnasio. Se ha priorizado capturar datos de contacto mínimos para reducir la fricción en el proceso de alta, manteniendo a su vez campos críticos de seguridad física:

- **`document_type`:** Tipo de documento de identidad. Valores planeados para Colombia: `CC` (Cédula de Ciudadanía), `TI` (Tarjeta de Identidad), `CE` (Cédula de Extranjería), `PA` (Pasaporte), `RC` (Registro Civil).
- **`document_number`:** Número de Documento. Junto con `document_type` forma una restricción de unicidad compuesta (`unique_together`), evitando que dos socios distintos con tipos de documento diferentes choquen por coincidencia de número, y bloqueando la duplicación real dentro del mismo tipo de documento.
- **`first_name`:** Nombre (campo separado).
- **`last_name`:** Apellido (campo separado para facilitar búsquedas, ordenamientos y futuras personalizaciones).
- **`birth_date`:** Fecha de Nacimiento. Necesaria para el cálculo de edad.
- **`phone`:** Teléfono, contacto principal.
- **`email`:** (Opcional).
- **`address`:** (Opcional).
- **`emergency_contact_name`:** Nombre de la persona a contactar en caso de incidentes.
- **`emergency_contact_phone`:** Teléfono directo de la persona de contacto.
- **`medical_conditions`:** (Campo separado, de tipo texto visible y destacado). Se separa de las notas generales para asegurar que cualquier condición de salud crítica (como asma, afecciones cardíacas, epilepsia, embarazo) sea visible de un vistazo en la ficha rápida del socio por parte de cualquier profesor.
- **`notes`:** (Campo de texto libre opcional) para comentarios administrativos y de comportamiento.

### B. Entidad: `MembershipType` (Tipo de Membresía - Plantilla)

Funciona como una plantilla que define las membresías disponibles en el gimnasio:

- **`name`:** Ej. "Pase Libre Mensual", "Clases de Boxeo".
- **`description`:** (Opcional).
- **`duration_days`:** Plazo de validez de la membresía una vez activada.
- **`price`:** Precio sugerido establecido por el administrador.

### C. Entidad: `Membership` (Asignación de Membresía)

Es la instancia real de contratación de una membresía por parte de un socio. **A diferencia de la versión anterior del modelo, esta entidad ya no incluye los datos del pago**, que ahora viven en una entidad separada (`Payment`), para evitar sobrecargar una sola entidad con responsabilidades distintas:

- **`member`:** Relación (Foreign Key) con la entidad `Member`.
- **`membership_type`:** Relación (Foreign Key) con la plantilla `MembershipType`.
- **`start_date`:** Fecha establecida para el comienzo de la vigencia de la membresía.
- **`end_date` (DATO DERIVADO):** No se guarda en la base de datos. Se calcula dinámicamente mediante la suma: `start_date + duration_days` del `MembershipType` asociado.

### D. Entidad: `Payment` (Registro de Pago) — _nueva entidad_

Registra cada transacción de cobro asociada a una `Membership`:

- **`membership`:** Relación (Foreign Key) con la entidad `Membership`.
- **`amount`:** Importe efectivamente cobrado (permite registrar un cobro diferente al valor de lista si se aplica un descuento manual).
- **`payment_date`:** Fecha en que se efectuó la transacción.
- **`payment_method`:** Ej. Efectivo, Transferencia, etc.

Separar `Payment` de `Membership` deja abierta la posibilidad futura de registrar múltiples pagos (por ejemplo, pagos parciales o en cuotas) para una misma membresía, aunque en v1 el caso de uso típico sea de un pago por membresía.

### Relaciones (resumen)

```
Member 1───N Membership N───1 MembershipType
                │
                1
                │
                N
             Payment
```

### Reglas de Validación y Lógica de Negocio:

1.  **Vigencia en Tiempo Real:** El estado de un socio ("¿Está vigente para ingresar hoy?") se calcula de forma derivada. El sistema verifica si hoy existe al menos una `Membership` asignada al socio cuyo rango calculado `[start_date, end_date]` contenga la fecha actual.
2.  **No Solapamiento del Mismo Tipo:** No se permite que un socio tenga dos `Membership` del mismo `membership_type` activas con rangos de fechas superpuestos. El sistema validará esto antes de guardar el registro; en caso de conflicto, se bloqueará la creación y **el mensaje de error en la UI sugerirá directamente al administrador la fecha de inicio correcta** (`end_date` de la membresía existente `+ 1 día`).
3.  **Múltiples Membresías Activas Diferentes (En Paralelo):** Un socio puede tener distintas membresías activas simultáneamente si corresponden a tipos diferentes (ej. "Acceso al gimnasio mensual" + "Pase de clases de boxeo"). Cada una correrá bajo sus propios parámetros de inicio y vigencia.
4.  **Apilamiento Secuencial Manual:** Para el caso de pago de meses adelantados del mismo tipo de membresía, el apilamiento automático secuencial queda fuera de v1. El administrador lo gestiona manualmente creando el segundo registro e ingresando como fecha de inicio el día inmediatamente posterior al vencimiento de la primera membresía (`end_date` anterior `+ 1`).
5.  **Documento Único por Tipo:** No se permite registrar dos `Member` con la misma combinación de `document_type` + `document_number`.

---

## 4. Autenticación

Se implementará un esquema de autenticación sencillo para v1:

- El administrador/dueño del gimnasio crea un **superusuario**.
- El superusuario puede crear **nuevos usuarios** (no superusuarios).
- Solo los usuarios autenticados pueden acceder al sistema; no hay roles ni permisos granulares diferenciados en esta versión.
- A nivel técnico, este esquema se apoya directamente en el modelo `User` nativo de Django (usando el flag `is_superuser`), sin necesidad de un modelo de usuario personalizado en v1.

---

## 5. Arquitectura y Stack Técnico

La elección del stack técnico se apoya en el principio de equilibrio entre la robustez del desarrollo, las restricciones del entorno local desconectado y el dominio técnico actual del desarrollador principal.

- **Backend:** **Django 5.2** utilizando **Django REST Framework (DRF)**. Django aporta estabilidad (LTS), un ORM maduro, migraciones sólidas, y su panel de administración nativo que agiliza la visualización de base de datos en fases de desarrollo.
- **Base de Datos:** **SQLite** por defecto para el entorno de producción local. SQLite es ideal debido a que los datos de un gimnasio mediano ocupan un volumen muy bajo y no requiere la instalación de un motor de bases de datos complejo en la PC cliente. Se puede parametrizar de forma opcional para utilizar **PostgreSQL** mediante variables de entorno si se despliega en la nube.
- **Frontend:** **React** + **Tailwind CSS** + **Vite**, proporcionando una interfaz moderna, limpia, responsiva y de carga instantánea.
- **Manejador de Paquetes:** **pnpm** (en lugar de npm) por su velocidad superior, eficiencia en el almacenamiento mediante enlaces simbólicos y consistencia con su archivo de bloqueo deterministicamente ordenado.
- **Aislamiento de Entorno:** Uso obligatorio de un **entorno virtual de Python (venv)** para el proyecto del backend, garantizando que dependencias pesadas como Django no se instalen de manera global en el sistema operativo del host.
- **Estructura del Proyecto (Monorepo):** Un único repositorio que contiene:
  - Directorio del backend (Django / DRF).
  - Directorio del frontend (React SPA / Vite).
  - Configuraciones para compilar la aplicación React y servir sus archivos estáticos de forma integrada a través de Django, lo que permite que localmente solo deba ejecutarse un único proceso del backend para servir todo el sistema.

---

## 6. Empaquetado, Instalación y Despliegue

La distribución local gratuita de un software siempre afronta el reto de la complejidad de instalación para usuarios no técnicos. La estrategia de LocalGym aborda esto mediante un doble camino:

1.  **Instalación Local para Producción:** Se documentará con absoluta claridad el proceso de instalación local. El administrador o dueño deberá clonar el repositorio, configurar el entorno virtual, instalar dependencias de Django y pnpm, realizar el build de React y ejecutar el servidor local. Dado que es gratuito, se acepta el tradeoff de que el dueño del negocio pueda requerir soporte o contratar a un técnico informático para realizar esta configuración inicial en su PC local (servidor del gimnasio).
2.  **Backups (pendiente de definir):** Se reconoce la necesidad de una estrategia de respaldo para la base de datos SQLite local, dado que no hay un entorno en la nube por defecto. Opciones a evaluar a futuro:
    - Función de "Exportar backup" desde el panel de administración (descarga del archivo SQLite o un dump en formato JSON vía `dumpdata`).
    - Comando de management de Django ejecutable manualmente o programable mediante el Task Scheduler (Windows) o cron (Linux).
    - Recordatorio en la UI del tiempo transcurrido desde el último backup.
