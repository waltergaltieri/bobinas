"use client";

import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  AdminAttributeWithOptions,
  CatalogAttributeValue,
} from "@/lib/data/catalog";

export function ProductAttributeFields({
  attributes,
  values = [],
}: {
  attributes: AdminAttributeWithOptions[];
  values?: CatalogAttributeValue[];
}) {
  const initialSelectedIds = useMemo(
    () =>
      attributes
        .filter((attribute) =>
          values.some((value) => value.attributeId === attribute.id),
        )
        .map((attribute) => attribute.id),
    [attributes, values],
  );
  const [selectedIds, setSelectedIds] = useState(initialSelectedIds);
  const selectedAttributes = attributes.filter((attribute) =>
    selectedIds.includes(attribute.id),
  );

  function toggleAttribute(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((currentId) => currentId !== id)
        : [...current, id],
    );
  }

  if (attributes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Todavia no hay caracteristicas cargadas.
      </p>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-2 sm:grid-cols-2">
        {attributes.map((attribute) => (
          <label
            key={attribute.id}
            className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(attribute.id)}
              onChange={() => toggleAttribute(attribute.id)}
            />
            <span>{attribute.name}</span>
          </label>
        ))}
      </div>

      {selectedAttributes.length === 0 ? null : (
        <div className="grid gap-3 border-t pt-4">
          {selectedAttributes.map((attribute) => (
            <AttributeField
              key={attribute.id}
              attribute={attribute}
              values={values}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AttributeField({
  attribute,
  values,
}: {
  attribute: AdminAttributeWithOptions;
  values: CatalogAttributeValue[];
}) {
  const name = `attribute:${attribute.id}`;
  const currentValues = values
    .filter((value) => value.attributeId === attribute.id)
    .map((value) => value.value);
  const firstValue = currentValues[0] ?? "";

  if (attribute.type === "SELECT") {
    return (
      <div className="grid gap-2">
        <Label>{attribute.name}</Label>
        <select
          name={name}
          defaultValue={
            attribute.options.find((option) => option.value === firstValue)?.id ?? ""
          }
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Sin valor</option>
          {attribute.options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.value}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (attribute.type === "MULTISELECT") {
    return (
      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium">{attribute.name}</legend>
        {attribute.options.map((option) => (
          <label key={option.id} className="flex items-center gap-2 text-sm">
            <input
              name={name}
              type="checkbox"
              value={option.id}
              defaultChecked={currentValues.includes(option.value)}
            />
            {option.value}
          </label>
        ))}
      </fieldset>
    );
  }

  if (attribute.type === "BOOLEAN") {
    return (
      <div className="grid gap-2">
        <Label>{attribute.name}</Label>
        <select
          name={name}
          defaultValue={firstValue}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Sin valor</option>
          <option value="true">Si</option>
          <option value="false">No</option>
        </select>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <Label>
        {attribute.name}
        {attribute.unit ? ` (${attribute.unit})` : ""}
      </Label>
      <Input
        name={name}
        defaultValue={firstValue}
        inputMode={attribute.type === "NUMBER" ? "decimal" : undefined}
      />
    </div>
  );
}
