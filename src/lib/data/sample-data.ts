import type { AttributeType, StockMode } from "@/db/schema";
import type { ProductCardSource } from "@/lib/data/product-presenter";

const sampleProductImages = {
  bobina:
    "https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?auto=format&fit=crop&w=900&q=80",
  inducido:
    "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=900&q=80",
  plaqueta:
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
};

export const sampleCategories = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Portaescobillas",
    slug: "portaescobillas",
    description: "Portaescobillas y conjuntos de contacto para arranques.",
    imageUrl: null,
    imagePublicId: null,
    sortOrder: 1,
    isFeatured: true,
    isActive: true,
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Solenoides",
    slug: "solenoides",
    description: "Solenoides de arranque y actuadores electricos.",
    imageUrl: null,
    imagePublicId: null,
    sortOrder: 2,
    isFeatured: true,
    isActive: true,
  },
  {
    id: "88888888-8888-4888-8888-888888888888",
    name: "Impulsores",
    slug: "impulsores",
    description: "Impulsores, bendix y componentes de acople.",
    imageUrl: null,
    imagePublicId: null,
    sortOrder: 3,
    isFeatured: true,
    isActive: true,
  },
  {
    id: "12111111-1111-4111-8111-111111111111",
    name: "Inducidos",
    slug: "inducidos",
    description: "Inducidos y rotores para alternadores y arranques.",
    imageUrl: null,
    imagePublicId: null,
    sortOrder: 4,
    isFeatured: true,
    isActive: true,
  },
  {
    id: "12222222-2222-4222-8222-222222222222",
    name: "Alternadores",
    slug: "alternadores",
    description: "Alternadores y subconjuntos de carga electrica.",
    imageUrl: null,
    imagePublicId: null,
    sortOrder: 5,
    isFeatured: true,
    isActive: true,
  },
  {
    id: "18888888-8888-4888-8888-888888888888",
    name: "Arranques",
    slug: "arranques",
    description: "Motores de arranque y componentes asociados.",
    imageUrl: null,
    imagePublicId: null,
    sortOrder: 6,
    isFeatured: true,
    isActive: true,
  },
];

export const sampleAttributes: Array<{
  id: string;
  name: string;
  slug: string;
  type: AttributeType;
  unit: string | null;
  isFilterable: boolean;
  isVisible: boolean;
  sortOrder: number;
}> = [
  {
    id: "33333333-3333-4333-8333-333333333333",
    name: "Voltaje",
    slug: "voltaje",
    type: "NUMBER",
    unit: "V",
    isFilterable: true,
    isVisible: true,
    sortOrder: 1,
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    name: "Estrias",
    slug: "estrias",
    type: "NUMBER",
    unit: null,
    isFilterable: true,
    isVisible: true,
    sortOrder: 2,
  },
  {
    id: "99999999-9999-4999-8999-999999999999",
    name: "Tipo de encastre",
    slug: "tipo-encastre",
    type: "SELECT",
    unit: null,
    isFilterable: true,
    isVisible: true,
    sortOrder: 3,
  },
  {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    name: "Aplicacion",
    slug: "aplicacion",
    type: "TEXT",
    unit: null,
    isFilterable: true,
    isVisible: true,
    sortOrder: 4,
  },
];

export const sampleAttributeOptions = [
  {
    id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    attributeId: "99999999-9999-4999-8999-999999999999",
    value: "Ficha rectangular",
    sortOrder: 1,
  },
  {
    id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    attributeId: "99999999-9999-4999-8999-999999999999",
    value: "Terminal redondo",
    sortOrder: 2,
  },
];

export type SampleProduct = ProductCardSource & {
  oemCode: string | null;
  shortDescription: string | null;
  description: string | null;
  mainCategoryId: string;
  categoryName: string;
  categorySlug: string;
  isActive: boolean;
  isFeatured: boolean;
  images: Array<{
    id: string;
    url: string;
    publicId: string;
    altText: string;
    sortOrder: number;
  }>;
};

export const sampleProducts: SampleProduct[] = [
  {
    id: "55555555-5555-4555-8555-555555555555",
    name: "Bobina Bosch 12V",
    slug: "bobina-bosch-12v",
    shortDescription: "Bobina de encendido para linea liviana.",
    description:
      "Bobina Bosch 12V con ficha rectangular, preparada para reposicion profesional y consulta tecnica.",
    internalCode: "BOB-12",
    oemCode: "OEM-BOB-12",
    brand: "Bosch",
    model: "12V",
    price: "12500.00",
    stockMode: "AVAILABLE" satisfies StockMode,
    imageUrl: sampleProductImages.bobina,
    mainCategoryId: "22222222-2222-4222-8222-222222222222",
    categoryName: "Solenoides",
    categorySlug: "solenoides",
    isActive: true,
    isFeatured: true,
    images: [
      {
        id: "55555555-5555-4555-8555-555555555556",
        url: sampleProductImages.bobina,
        publicId: "sample-products/bobina-bosch-12v",
        altText: "Bobina Bosch 12V",
        sortOrder: 1,
      },
    ],
  },
  {
    id: "66666666-6666-4666-8666-666666666666",
    name: "Inducido Valeo reforzado",
    slug: "inducido-valeo-reforzado",
    shortDescription: "Inducido reforzado para alternador.",
    description:
      "Inducido Valeo para linea pesada, con valores tecnicos normalizados para busqueda y filtros.",
    internalCode: "IND-VAL-01",
    oemCode: "OEM-IND-VAL",
    brand: "Valeo",
    model: "Linea pesada",
    price: "38400.00",
    stockMode: "ON_REQUEST" satisfies StockMode,
    imageUrl: sampleProductImages.inducido,
    mainCategoryId: "12111111-1111-4111-8111-111111111111",
    categoryName: "Inducidos",
    categorySlug: "inducidos",
    isActive: true,
    isFeatured: false,
    images: [
      {
        id: "66666666-6666-4666-8666-666666666667",
        url: sampleProductImages.inducido,
        publicId: "sample-products/inducido-valeo-reforzado",
        altText: "Inducido Valeo reforzado",
        sortOrder: 1,
      },
    ],
  },
  {
    id: "77777777-7777-4777-8777-777777777777",
    name: "Plaqueta reguladora universal",
    slug: "plaqueta-reguladora-universal",
    shortDescription: "Plaqueta reguladora para aplicaciones universales.",
    description:
      "Plaqueta reguladora con aplicacion universal y disponibilidad controlada por el equipo comercial.",
    internalCode: "PLA-UNI",
    oemCode: "OEM-PLA-UNI",
    brand: "Magneti Marelli",
    model: "Universal",
    price: "9300.00",
    stockMode: "TRACKED" satisfies StockMode,
    imageUrl: sampleProductImages.plaqueta,
    mainCategoryId: "12222222-2222-4222-8222-222222222222",
    categoryName: "Alternadores",
    categorySlug: "alternadores",
    isActive: true,
    isFeatured: false,
    images: [
      {
        id: "77777777-7777-4777-8777-777777777778",
        url: sampleProductImages.plaqueta,
        publicId: "sample-products/plaqueta-reguladora-universal",
        altText: "Plaqueta reguladora universal",
        sortOrder: 1,
      },
    ],
  },
];

export const sampleProductAttributeValues = [
  {
    productId: "55555555-5555-4555-8555-555555555555",
    attributeId: "33333333-3333-4333-8333-333333333333",
    valueNumber: "12",
    valueText: null,
    valueBoolean: null,
    optionId: null,
  },
  {
    productId: "55555555-5555-4555-8555-555555555555",
    attributeId: "99999999-9999-4999-8999-999999999999",
    valueNumber: null,
    valueText: null,
    valueBoolean: null,
    optionId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  },
  {
    productId: "55555555-5555-4555-8555-555555555555",
    attributeId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    valueNumber: null,
    valueText: "Linea liviana",
    valueBoolean: null,
    optionId: null,
  },
  {
    productId: "66666666-6666-4666-8666-666666666666",
    attributeId: "44444444-4444-4444-8444-444444444444",
    valueNumber: "10",
    valueText: null,
    valueBoolean: null,
    optionId: null,
  },
  {
    productId: "66666666-6666-4666-8666-666666666666",
    attributeId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    valueNumber: null,
    valueText: "Linea pesada",
    valueBoolean: null,
    optionId: null,
  },
];

export const sampleBuyerProfile = {
  id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
  authUserId: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
  role: "BUYER" as const,
  name: "Taller Norte",
  companyName: "Taller Norte SRL",
  email: "compras@tallernorte.test",
  phone: "+5491123456789",
};

export const samplePurchaseRequests = [
  {
    id: "16161616-1616-4161-8161-161616161616",
    buyerId: sampleBuyerProfile.id,
    buyer: sampleBuyerProfile,
    createdAt: new Date("2026-06-13T09:30:00-03:00"),
    updatedAt: new Date("2026-06-13T09:30:00-03:00"),
    completedAt: null,
    status: "PENDING" as const,
    saleResult: "UNKNOWN" as const,
    estimatedTotal: "25000.00",
    buyerNotes: "Consultar disponibilidad para retirar esta semana.",
    adminNotes: "Prioridad media. Revisar stock antes de responder.",
    saleResultNotes: null,
    items: [
      {
        productId: sampleProducts[0].id,
        productNameSnapshot: "Bobina Bosch 12V",
        productCodeSnapshot: "BOB-12",
        unitPriceSnapshot: "12500.00",
        quantity: 2,
        subtotalSnapshot: "25000.00",
      },
    ],
  },
  {
    id: "17171717-1717-4171-8171-171717171717",
    buyerId: sampleBuyerProfile.id,
    buyer: sampleBuyerProfile,
    createdAt: new Date("2026-06-12T15:10:00-03:00"),
    updatedAt: new Date("2026-06-12T16:20:00-03:00"),
    completedAt: new Date("2026-06-12T16:20:00-03:00"),
    status: "COMPLETED" as const,
    saleResult: "CONCRETED" as const,
    estimatedTotal: "38400.00",
    buyerNotes: "Necesitamos confirmar plazo de entrega.",
    adminNotes: "Se coordino entrega por transporte.",
    saleResultNotes: "Pedido concretado por canal comercial externo.",
    items: [
      {
        productId: sampleProducts[1].id,
        productNameSnapshot: "Inducido Valeo reforzado",
        productCodeSnapshot: "IND-VAL-01",
        unitPriceSnapshot: "38400.00",
        quantity: 1,
        subtotalSnapshot: "38400.00",
      },
    ],
  },
];

export const sampleSiteSettings = {
  id: "12121212-1212-4121-8121-121212121212",
  businessName: "Bobinas",
  logoUrl: null,
  logoPublicId: null,
  whatsapp: "+5491123456789",
  email: "consultas@bobinas.test",
  phone: "+54 11 4567-8900",
  address: "Av. Repuestos 1234, Buenos Aires",
  businessHours: "Lunes a viernes de 9 a 18 hs",
  instagramUrl: "https://instagram.com/bobinas",
  facebookUrl: null,
  institutionalText:
    "Distribuimos repuestos electricos automotores con catalogo tecnico, atencion profesional y revision manual de cada solicitud.",
  footerText:
    "Catalogo publico sin precios. Acceso privado para compradores autorizados.",
  seoTitle: "Bobinas - Catalogo tecnico de repuestos automotores",
  seoDescription:
    "Catalogo publico de repuestos automotores y portal privado para compradores autorizados.",
  isActive: true,
};

export const sampleHomeSlides = [
  {
    id: "13131313-1313-4131-8131-131313131313",
    imageUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    imagePublicId: "demo/sample",
    title: "Repuestos electricos con soporte tecnico",
    subtitle:
      "Catalogo publico para consulta y acceso privado para compradores autorizados.",
    buttonText: "Ver catalogo",
    buttonLink: "/productos",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "14141414-1414-4141-8141-141414141414",
    imageUrl: "https://res.cloudinary.com/demo/image/upload/car.jpg",
    imagePublicId: "demo/car",
    title: "Slide inactivo",
    subtitle: "Este slide no debe aparecer en la home publica.",
    buttonText: "No mostrar",
    buttonLink: "/productos",
    sortOrder: 2,
    isActive: false,
  },
];

export const samplePopupSettings = {
  id: "15151515-1515-4151-8151-151515151515",
  isActive: true,
  imageUrl: null,
  imagePublicId: null,
  title: "Atencion a compradores autorizados",
  text: "Consultanos por disponibilidad y condiciones comerciales desde el catalogo.",
  buttonText: "Consultar catalogo",
  buttonLink: "/productos",
  showOnce: true,
  startsAt: new Date("2026-01-01T00:00:00-03:00"),
  endsAt: new Date("2026-12-31T23:59:59-03:00"),
};
