# Buscador Tecnico de Productos

## Objetivo

Mejorar `/productos` para usuarios que buscan repuestos por codigos largos,
codigos parciales y combinaciones de filtros tecnicos.

## Diseño

La pagina mantiene la arquitectura original: Next.js App Router, datos server-side
con Drizzle y visibilidad por rol. La busqueda se potencia en la capa de catalogo
con normalizacion tecnica, tokenizacion y sugerencias generadas desde productos,
categorias, marcas, modelos y atributos.

## Experiencia

- Buscador principal con autocompletado desde 2 caracteres.
- Busqueda tolerante a guiones, espacios, acentos y mayusculas.
- Busqueda por combinaciones, por ejemplo `bosch 12 rectangular`.
- Chips visibles para filtros activos, con remocion individual.
- Cards orientadas a catalogo tecnico: codigo interno, OEM, marca, modelo y
  atributos visibles.

## Reglas de negocio

- PUBLIC no ve precios ni acciones de pedido.
- BUYER ve precios y puede agregar productos al pedido.
- Las categorias y atributos normalizados siguen siendo fuente de filtros.

## Implementacion

- Agregar helpers testeados para normalizar y tokenizar busqueda tecnica.
- Agregar sugerencias de catalogo sin exponer precios.
- Ajustar `getCatalogProducts` para usar busqueda por tokens.
- Agregar componente cliente de autocompletado.
- Actualizar la pagina `/productos` con chips y layout mas tecnico.
- Actualizar cards para mostrar atributos destacados.

