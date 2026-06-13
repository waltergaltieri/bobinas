import type { AttributeType } from "@/db/schema";
import { slugify } from "@/lib/slugify";

export function buildDuplicatedProductIdentity({
  name,
  slug,
  internalCode,
  existingSlugs,
  existingInternalCodes,
}: {
  name: string;
  slug: string;
  internalCode: string;
  existingSlugs: string[];
  existingInternalCodes: string[];
}) {
  return {
    name: `${name} copia`,
    slug: nextAvailableSlug(`${slug || slugify(name)}-copia`, existingSlugs),
    internalCode: nextAvailableCode(`${internalCode}-COPIA`, existingInternalCodes),
  };
}

export function isDuplicateSlug(
  rows: Array<{ id: string; slug: string }>,
  slug: string,
  currentId?: string,
) {
  const normalized = slugify(slug);
  return rows.some((row) => row.id !== currentId && slugify(row.slug) === normalized);
}

export function canChangeAttributeType({
  currentType,
  nextType,
  assignedValuesCount,
}: {
  currentType: AttributeType;
  nextType: AttributeType;
  assignedValuesCount: number;
}) {
  if (currentType !== nextType && assignedValuesCount > 0) {
    return {
      ok: false as const,
      error:
        "No se puede cambiar el tipo porque la caracteristica ya tiene valores asignados.",
    };
  }

  return { ok: true as const };
}

function nextAvailableSlug(baseSlug: string, existingSlugs: string[]) {
  const normalizedExisting = new Set(existingSlugs.map(slugify));
  const base = slugify(baseSlug);

  if (!normalizedExisting.has(base)) {
    return base;
  }

  let suffix = 2;
  while (normalizedExisting.has(`${base}-${suffix}`)) {
    suffix += 1;
  }

  return `${base}-${suffix}`;
}

function nextAvailableCode(baseCode: string, existingCodes: string[]) {
  const normalizedExisting = new Set(
    existingCodes.map((code) => code.trim().toUpperCase()),
  );
  const base = baseCode.trim().toUpperCase();

  if (!normalizedExisting.has(base)) {
    return base;
  }

  let suffix = 2;
  while (normalizedExisting.has(`${base}-${suffix}`)) {
    suffix += 1;
  }

  return `${base}-${suffix}`;
}
