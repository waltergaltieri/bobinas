import type { ProductReviewStatus, StockMode } from "@/db/schema";

export type DarefSourceProduct = {
  codigo: string;
  nombre: string;
  categoria: string;
  fabricante_producto: string;
  marca_sistema_aplicacion: string | null;
  aplicaciones: string | null;
  descripcion: string;
  voltaje_v: number | null;
  amperaje_a: number | null;
  estrias_dientes: number | null;
  largo_total_mm: number | null;
  diametro_interno_mm: number | null;
  otros_atributos: string | null;
  atributos_tecnicos_json: string;
  codigos_equivalentes: string | null;
  imagen_url: string;
  imagen_archivo: string;
  estado: string;
  precio: number | string | null;
  fuente: string;
  url_fuente: string;
  requiere_revision: string;
  titulo_fuente: string;
  id_fuente: number | string;
  fecha_modificacion_fuente: number | null;
};

export type DarefObservation = {
  severidad: string;
  tipo: string;
  alcance: string;
  codigo_producto: string | null;
  titulo_fuente: string | null;
  observacion: string;
  accion_recomendada: string;
  url_fuente: string | null;
};

export type DarefSnapshot = {
  sourceWorkbook: string;
  importBatch: string;
  extractedAt: string;
  products: DarefSourceProduct[];
  attributeDefinitions: Array<Record<string, unknown>>;
  observations: DarefObservation[];
};

export type PlannedCategory = {
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
};

export type PlannedAttribute = {
  name: string;
  slug: string;
  type: "TEXT" | "NUMBER" | "MULTISELECT";
  unit: string | null;
  isFilterable: boolean;
  isVisible: boolean;
  sortOrder: number;
};

export type PlannedAttributeValue = {
  attributeSlug: string;
  kind: "number" | "text" | "option";
  value: string;
};

export type PlannedProduct = {
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string;
  brand: string;
  model: null;
  internalCode: string;
  oemCode: string | null;
  mainCategorySlug: string;
  price: string;
  stockMode: StockMode;
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  reviewStatus: ProductReviewStatus;
  reviewNotes: string | null;
  image: {
    sourceUrl: string;
    publicId: string;
    altText: string;
  };
  attributeValues: PlannedAttributeValue[];
  source: {
    name: string;
    url: string;
    externalId: string;
    modifiedAt: string | null;
    importBatch: string;
    requiresReview: boolean;
  };
};

export type DarefImportPlan = {
  importBatch: string;
  categories: PlannedCategory[];
  attributes: PlannedAttribute[];
  options: Array<{
    attributeSlug: "sistema-aplicacion" | "otros-atributos";
    value: string;
    sortOrder: number;
  }>;
  products: PlannedProduct[];
};
