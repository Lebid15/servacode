/**
 * =====================================================
 * أدوات تنسيق بيانات لوحة الأدمن
 * =====================================================
 */

export function getNestedValue(row: Record<string, unknown>, key: string): unknown {
  return key.split(".").reduce<unknown>((current, part) => {
    if (current && typeof current === "object" && part in current) {
      return (current as Record<string, unknown>)[part];
    }

    return undefined;
  }, row);
}

export function valueToText(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "✓" : "—";
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

export function toPayload(values: Record<string, unknown>) {
  const payload: Record<string, unknown> = {};

  Object.entries(values).forEach(([key, value]) => {
    if (value !== "" && value !== undefined) {
      payload[key] = value;
    }
  });

  return payload;
}
