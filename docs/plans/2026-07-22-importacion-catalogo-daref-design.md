# Diseño de importación histórica del catálogo DAREF

## Objetivo

Cargar los 422 productos del catálogo DAREF en la base y migrar sus imágenes a
Cloudinary, manteniéndolos fuera del catálogo público hasta que una persona
revise la ficha, complete el precio y apruebe su publicación.

## Decisión de arquitectura

Se usará un importador controlado, idempotente y auditable. El Excel se
transformará una sola vez en un snapshot JSON versionado; el importador de la
aplicación consumirá ese snapshot, validará el lote completo, subirá imágenes
con identificadores deterministas y finalmente aplicará los cambios en una
transacción de base de datos.

No se usará una tabla de staging completa porque el lote es pequeño y estable.
La trazabilidad se conservará con metadatos por producto y un identificador de
lote. Una carga repetida no duplicará productos, categorías, opciones,
características ni imágenes.

## Estado y revisión humana

Los productos incorporan un estado de revisión independiente de la visibilidad:

- `PENDING`: importado y todavía no revisado.
- `APPROVED`: revisado y apto para activación.
- `REJECTED`: descartado sin borrar el historial.

Todo el lote DAREF se crea con `isActive = false`, `reviewStatus = PENDING`,
`price = 0`, `stockMode = ON_REQUEST`, `stockQuantity = 0` e
`isFeatured = false`.

La administración permitirá filtrar por estado de revisión y mostrará una
insignia visible. La activación se rechazará en el servidor si el producto no
está aprobado, no tiene precio positivo o no tiene una imagen guardada en
Cloudinary.

## Categorías y campos del producto

Las categorías `Inducidos`, `Rotores` y `Estatores` se resolverán por slug. Se
reutilizará `Inducidos` si ya existe y se crearán las restantes cuando falten.

La correspondencia principal es:

- `codigo` -> `internalCode`
- `nombre` -> `name`
- slug derivado de nombre y código
- `fabricante_producto` -> `brand`
- `descripcion` -> `description`
- `codigos_equivalentes` -> `oemCode`
- `categoria` -> categoría principal

DAREF se conservará como fabricante. Bosch, Indiel, Valeo y valores semejantes
no se interpretarán como fabricante ni modelo: se cargarán como una
característica técnica de sistema o marca de aplicación.

## Características técnicas

Se cargarán características para las tres familias del Excel, no solamente las
características que ya existían en los datos demo:

| Campo de origen | Característica | Tipo | Unidad |
| --- | --- | --- | --- |
| `voltaje_v` | Voltaje | `NUMBER` | V |
| `amperaje_a` | Amperaje | `NUMBER` | A |
| `estrias_dientes` | Estrías / dientes | `NUMBER` | — |
| `largo_total_mm` | Largo total | `NUMBER` | mm |
| `diametro_interno_mm` | Diámetro interno | `NUMBER` | mm |
| `aplicaciones` | Aplicación | `TEXT` | — |
| `marca_sistema_aplicacion` | Sistema o marca de aplicación | `MULTISELECT` | — |
| `otros_atributos` | Otros atributos | `MULTISELECT` | — |

Los sistemas separados por `/` y los atributos separados por `;` se dividirán,
normalizarán solamente en espacios y mayúsculas/minúsculas para deduplicar, y
se conservarán con su texto original. No se inferirán medidas o propiedades que
no estén explícitas.

## Imágenes

Las 422 imágenes remotas se cargarán en Cloudinary con un `public_id`
determinista bajo `bobinas/catalogo-daref/<codigo-normalizado>`. Se usará
`overwrite: false` para que una repetición no genere duplicados. El importador
guardará `secure_url` y `public_id`; nunca persistirá la URL externa como imagen
del producto.

Una falla de imagen no cancela el resto del lote. El producto queda pendiente,
sin imagen y señalado en el reporte, por lo que la protección de activación
impide publicarlo hasta corregirlo.

## Seguridad y trazabilidad

Los metadatos de importación se guardarán en una tabla protegida por RLS y sin
permisos para `anon` o `authenticated`. Solo el acceso privilegiado del servidor
podrá leerla o modificarla. Contendrá fuente, URL, ID externo, fecha de fuente,
lote, URL original de imagen y marca de revisión.

Antes de escribir se exportarán a JSON los productos que coincidan por código.
Un código existente sin metadatos del mismo origen abortará la carga. Una
repetición podrá actualizar solo registros DAREF que sigan en `PENDING`; los ya
aprobados o rechazados se omitirán para proteger cambios humanos.

## Flujo de ejecución

1. Extraer y validar el snapshot JSON del Excel.
2. Ejecutar pruebas de transformación y reglas de activación.
3. Ejecutar el importador en modo simulación.
4. Aplicar y verificar la migración de esquema.
5. Subir imágenes a Cloudinary con concurrencia limitada.
6. Insertar o actualizar productos, características, valores y metadatos.
7. Verificar conteos en base, dominio Cloudinary, estados y precios.
8. Entregar un reporte JSON con creados, actualizados, omitidos y errores.

## Criterios de aceptación

- Los 422 códigos quedan representados una sola vez.
- Los 422 productos quedan inactivos y pendientes.
- Ningún producto recibe un precio o cantidad inventados.
- Las tres categorías y las ocho características existen.
- Los valores técnicos disponibles se guardan en tablas normalizadas.
- Las imágenes exitosas apuntan a Cloudinary y tienen `public_id`.
- Una segunda simulación informa cero duplicados y protege productos revisados.
- El administrador puede filtrar pendientes y no puede activar fichas incompletas.

