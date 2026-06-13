export function toSafeMutationError(error: unknown) {
  if (isPgUniqueViolation(error)) {
    return "Ya existe un registro con ese slug o codigo.";
  }

  return "No se pudo guardar. Revisá los datos e intentá nuevamente.";
}

function isPgUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}
