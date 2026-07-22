# Simplificación de la configuración de stock

## Objetivo

Hacer que la gestión de productos sea comprensible para un administrador con conocimientos básicos de informática y reflejar el funcionamiento comercial real: el comprador envía una solicitud de pedido y el dueño confirma después la disponibilidad.

## Problema actual

El formulario y el listado de productos exponen cinco códigos técnicos de stock (`TRACKED`, `AVAILABLE`, `ON_REQUEST`, `OUT_OF_STOCK` y `HIDDEN`) y una cantidad. Sin embargo, el flujo actual permite agregar cualquier producto activo a una solicitud de pedido, sin usar esos estados para bloquear la operación. Esto agrega complejidad y puede generar expectativas incorrectas sobre la existencia física del producto.

## Diseño aprobado

### Experiencia del administrador

- Retirar del formulario habitual el selector de modalidad de stock y el campo de cantidad.
- Mostrar una explicación breve: los productos activos pueden incluirse en solicitudes y la disponibilidad se confirma al revisar cada pedido.
- Usar `ON_REQUEST` y cantidad `0` como valores internos para productos nuevos.
- Al editar un producto existente, conservar sus valores internos actuales para no modificar datos históricos de forma silenciosa.
- Retirar el filtro de stock y los códigos técnicos del listado de productos.
- Mantener `Activo/Inactivo` como el control que determina si un producto participa del catálogo.

### Experiencia del comprador

- Sustituir los códigos internos por el texto “Disponibilidad a confirmar”.
- Mantener “Agregar al pedido” para todos los productos activos.
- No presentar cantidades de inventario ni promesas de disponibilidad inmediata.

### Persistencia y compatibilidad

- No cambiar el enum ni eliminar columnas de la base de datos.
- Conservar los cinco estados existentes para compatibilidad futura y con datos históricos.
- No realizar una migración de datos.
- La simplificación ocurre en la interfaz y en los valores predeterminados del flujo administrativo.

## Componentes afectados

- Formulario de alta y edición de productos.
- Listado y filtros administrativos de productos.
- Tarjetas y detalle de producto para compradores autorizados.
- Pruebas de presentación y del formulario administrativo.

## Manejo de errores y casos especiales

- Un producto inactivo no debe aparecer en el catálogo, como ocurre actualmente.
- Editar datos no relacionados con stock no debe sobrescribir el estado histórico del producto.
- Los códigos internos nunca deben mostrarse como texto dirigido al usuario.

## Verificación

- Pruebas de componentes que confirmen la ausencia de los cinco códigos técnicos.
- Pruebas del formulario que confirmen los valores internos enviados para productos nuevos y existentes.
- Pruebas de la presentación del catálogo para el mensaje “Disponibilidad a confirmar”.
- Ejecución completa de pruebas, lint y build.

