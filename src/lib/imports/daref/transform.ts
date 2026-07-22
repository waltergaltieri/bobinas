import { slugify } from "@/lib/slugify";

import type {
  DarefImportPlan,
  DarefObservation,
  DarefSnapshot,
  DarefSourceProduct,
  PlannedAttribute,
  PlannedAttributeValue,
  PlannedCategory,
  PlannedProduct,
} from "./types";

const categories: PlannedCategory[] = [
  {
    name: "Inducidos",
    slug: "inducidos",
    description: "Inducidos para sistemas de arranque y carga.",
    sortOrder: 4,
  },
  {
    name: "Rotores",
    slug: "rotores",
    description: "Rotores para alternadores y sistemas eléctricos automotores.",
    sortOrder: 5,
  },
  {
    name: "Estatores",
    slug: "estatores",
    description: "Estatores para alternadores y sistemas eléctricos automotores.",
    sortOrder: 6,
  },
];

const attributes: PlannedAttribute[] = [
  numberAttribute("Voltaje", "voltaje", "V", 1),
  numberAttribute("Amperaje", "amperaje", "A", 2),
  numberAttribute("Estrias / dientes", "estrias", null, 3),
  numberAttribute("Largo total", "largo-total", "mm", 4),
  numberAttribute("Diametro interno", "diametro-interno", "mm", 5),
  {
    name: "Aplicacion",
    slug: "aplicacion",
    type: "TEXT",
    unit: null,
    isFilterable: true,
    isVisible: true,
    sortOrder: 6,
  },
  {
    name: "Sistema o marca de aplicacion",
    slug: "sistema-aplicacion",
    type: "MULTISELECT",
    unit: null,
    isFilterable: true,
    isVisible: true,
    sortOrder: 7,
  },
  {
    name: "Otros atributos",
    slug: "otros-atributos",
    type: "MULTISELECT",
    unit: null,
    isFilterable: true,
    isVisible: true,
    sortOrder: 8,
  },
];

export function buildDarefImportPlan(input: unknown): DarefImportPlan {
  const snapshot = requireSnapshot(input);
  const seenCodes = new Set<string>();
  const seenSlugs = new Set<string>();
  const observationsByCode = groupObservations(snapshot.observations);
  const products: PlannedProduct[] = [];

  for (const source of snapshot.products) {
    validateSourceProduct(source);

    if (seenCodes.has(source.codigo)) {
      throw new Error(`Codigo DAREF duplicado: ${source.codigo}`);
    }
    seenCodes.add(source.codigo);

    const slug = slugify(source.nombre);
    if (seenSlugs.has(slug)) {
      throw new Error(`Slug DAREF duplicado: ${slug}`);
    }
    seenSlugs.add(slug);

    products.push(
      transformProduct(source, snapshot.importBatch, observationsByCode.get(source.codigo) ?? []),
    );
  }

  const optionValues = new Map<
    "sistema-aplicacion" | "otros-atributos",
    Map<string, string>
  >([
    ["sistema-aplicacion", new Map()],
    ["otros-atributos", new Map()],
  ]);

  for (const product of products) {
    for (const value of product.attributeValues) {
      if (
        value.kind !== "option" ||
        (value.attributeSlug !== "sistema-aplicacion" &&
          value.attributeSlug !== "otros-atributos")
      ) {
        continue;
      }

      const normalized = normalizeOption(value.value);
      const values = optionValues.get(value.attributeSlug)!;
      if (!values.has(normalized)) values.set(normalized, value.value);
    }
  }

  const options = (["sistema-aplicacion", "otros-atributos"] as const).flatMap(
    (attributeSlug) =>
      [...optionValues.get(attributeSlug)!.values()].map((value, index) => ({
        attributeSlug,
        value,
        sortOrder: index + 1,
      })),
  );

  return {
    importBatch: snapshot.importBatch,
    categories,
    attributes,
    options,
    products,
  };
}

function transformProduct(
  source: DarefSourceProduct,
  importBatch: string,
  observations: DarefObservation[],
): PlannedProduct {
  const mainCategorySlug = slugify(source.categoria);
  if (!categories.some((category) => category.slug === mainCategorySlug)) {
    throw new Error(`Categoria DAREF desconocida para ${source.codigo}: ${source.categoria}`);
  }

  const attributeValues: PlannedAttributeValue[] = [];
  pushNumber(attributeValues, "voltaje", source.voltaje_v);
  pushNumber(attributeValues, "amperaje", source.amperaje_a);
  pushNumber(attributeValues, "estrias", source.estrias_dientes);
  pushNumber(attributeValues, "largo-total", source.largo_total_mm);
  pushNumber(attributeValues, "diametro-interno", source.diametro_interno_mm);

  if (source.aplicaciones?.trim()) {
    attributeValues.push({
      attributeSlug: "aplicacion",
      kind: "text",
      value: source.aplicaciones.trim(),
    });
  }

  for (const value of splitLiteralValues(source.marca_sistema_aplicacion, "/")) {
    attributeValues.push({
      attributeSlug: "sistema-aplicacion",
      kind: "option",
      value,
    });
  }

  for (const value of splitLiteralValues(source.otros_atributos, ";")) {
    attributeValues.push({
      attributeSlug: "otros-atributos",
      kind: "option",
      value,
    });
  }

  return {
    name: source.nombre.trim(),
    slug: slugify(source.nombre),
    shortDescription: source.aplicaciones?.trim()
      ? `Aplicacion: ${source.aplicaciones.trim()}`
      : null,
    description: source.descripcion.trim(),
    brand: source.fabricante_producto.trim(),
    model: null,
    internalCode: source.codigo.trim(),
    oemCode: source.codigos_equivalentes?.trim() || null,
    mainCategorySlug,
    price: "0.00",
    stockMode: "ON_REQUEST",
    stockQuantity: 0,
    isActive: false,
    isFeatured: false,
    reviewStatus: "PENDING",
    reviewNotes: formatReviewNotes(observations),
    image: {
      sourceUrl: source.imagen_url.trim(),
      publicId: `bobinas/catalogo-daref/${slugify(source.codigo)}`,
      altText: source.nombre.trim(),
    },
    attributeValues,
    source: {
      name: source.fuente.trim(),
      url: source.url_fuente.trim(),
      externalId: String(source.id_fuente),
      modifiedAt: excelSerialToIso(source.fecha_modificacion_fuente),
      importBatch,
      requiresReview: source.requiere_revision === "SI",
    },
  };
}

function requireSnapshot(input: unknown): DarefSnapshot {
  if (!input || typeof input !== "object") {
    throw new Error("Snapshot DAREF invalido");
  }

  const snapshot = input as DarefSnapshot;
  if (
    !snapshot.importBatch ||
    !Array.isArray(snapshot.products) ||
    !Array.isArray(snapshot.observations)
  ) {
    throw new Error("Snapshot DAREF incompleto");
  }

  return snapshot;
}

function validateSourceProduct(source: DarefSourceProduct) {
  for (const [field, value] of Object.entries({
    codigo: source.codigo,
    nombre: source.nombre,
    categoria: source.categoria,
    fabricante_producto: source.fabricante_producto,
    descripcion: source.descripcion,
    imagen_url: source.imagen_url,
    url_fuente: source.url_fuente,
  })) {
    if (typeof value !== "string" || !value.trim()) {
      throw new Error(`Campo ${field} ausente en producto DAREF`);
    }
  }

  try {
    JSON.parse(source.atributos_tecnicos_json);
  } catch {
    throw new Error(`JSON tecnico invalido para ${source.codigo}`);
  }

  if (source.estado !== "BORRADOR" || source.requiere_revision !== "SI") {
    throw new Error(`Producto DAREF no preparado como borrador: ${source.codigo}`);
  }
}

function groupObservations(observations: DarefObservation[]) {
  const grouped = new Map<string, DarefObservation[]>();
  for (const observation of observations) {
    if (!observation.codigo_producto) continue;
    const current = grouped.get(observation.codigo_producto) ?? [];
    current.push(observation);
    grouped.set(observation.codigo_producto, current);
  }
  return grouped;
}

function formatReviewNotes(observations: DarefObservation[]) {
  if (observations.length === 0) return null;
  return observations
    .map(
      (observation) =>
        `[${observation.severidad}/${observation.tipo}] ${observation.observacion} Accion: ${observation.accion_recomendada}`,
    )
    .join("\n");
}

function splitLiteralValues(value: string | null, separator: string) {
  if (!value?.trim()) return [];
  const unique = new Map<string, string>();
  for (const part of value.split(separator)) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const normalized = normalizeOption(trimmed);
    if (!unique.has(normalized)) unique.set(normalized, trimmed);
  }
  return [...unique.values()];
}

function normalizeOption(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function pushNumber(
  values: PlannedAttributeValue[],
  attributeSlug: string,
  value: number | null,
) {
  if (value === null || !Number.isFinite(value)) return;
  values.push({ attributeSlug, kind: "number", value: String(value) });
}

function excelSerialToIso(value: number | null) {
  if (value === null || !Number.isFinite(value)) return null;
  const timestamp = Date.UTC(1899, 11, 30) + value * 86_400_000;
  return new Date(timestamp).toISOString();
}

function numberAttribute(
  name: string,
  slug: string,
  unit: string | null,
  sortOrder: number,
): PlannedAttribute {
  return {
    name,
    slug,
    type: "NUMBER",
    unit,
    isFilterable: true,
    isVisible: true,
    sortOrder,
  };
}
