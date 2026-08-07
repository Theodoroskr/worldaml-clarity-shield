// Normalises legacy table-definition JSON (MainRegulations-style payloads)
// into the Suite onboarding form builder schema.

export type BuilderFieldType =
  | "text"
  | "email"
  | "phone"
  | "number"
  | "textarea"
  | "select"
  | "checkbox"
  | "date"
  | "address"
  | "file"
  | "heading";

export interface BuilderFieldValidation {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  patternMessage?: string;
  format?: "" | "email" | "url" | "alpha" | "alphanumeric";
  allowedFileTypes?: string[];
  maxFileSizeMb?: number;
}

export interface BuilderField {
  id: string;
  type: BuilderFieldType;
  label: string;
  key: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  options?: string[];
  validation?: BuilderFieldValidation;
  /** Preserved legacy metadata so nothing is lost on round-trips. */
  meta?: Record<string, unknown>;
}

export interface LegacyField {
  index?: number;
  label?: string;
  name?: string;
  type?: string;
  width?: string;
  rows?: number;
  format?: string;
  required?: number | boolean;
  encrypted?: number | boolean;
  unique?: number | boolean;
  allowUpdate?: number | boolean;
  typeOptions?: Record<string, unknown>;
}

export interface LegacyTable {
  insertId?: number;
  tableId?: number;
  contentCode?: number;
  project?: number;
  platform?: number;
  tableName?: string;
  fieldsCount?: number;
  primaryField?: string;
  fields?: LegacyField[];
}

export interface NormalizedForm {
  name: string;
  slug: string;
  description: string;
  fields: BuilderField[];
  source: {
    tableName?: string;
    tableId?: number;
    contentCode?: number;
    project?: number;
    platform?: number;
    primaryField?: string;
    declaredFieldsCount?: number;
  };
  warnings: string[];
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);

const snakeKey = (s: string) =>
  s
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/(^_|_$)/g, "")
    .toLowerCase()
    .slice(0, 60);

/** Humanise "Regulation_Year" / "RegulationID" -> "Regulation Year" */
const humanise = (s: string) =>
  s
    .replace(/_/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\bID\b/gi, "ID")
    .replace(/\s+/g, " ")
    .trim();

const truthy = (v: unknown) => v === true || v === 1 || v === "1";

/** Map a legacy field descriptor to a builder field type. */
export function mapLegacyType(field: LegacyField): {
  type: BuilderFieldType;
  skip?: boolean;
} {
  const raw = String(field.type || "").toLowerCase();
  const name = String(field.name || "").toLowerCase();
  const rows = Number(field.rows || 0);

  switch (raw) {
    case "id":
    case "autonumber":
    case "identity":
      return { type: "number", skip: true }; // system key, not user input
    case "select":
    case "dropdown":
    case "lookup":
    case "combo":
      return { type: "select" };
    case "checkbox":
    case "bool":
    case "boolean":
    case "yesno":
      return { type: "checkbox" };
    case "date":
    case "datetime":
    case "time":
      return { type: "date" };
    case "number":
    case "int":
    case "integer":
    case "decimal":
    case "currency":
    case "float":
      return { type: "number" };
    case "file":
    case "attachment":
    case "image":
    case "upload":
      return { type: "file" };
    case "memo":
    case "textarea":
    case "longtext":
    case "richtext":
    case "html":
      return { type: "textarea" };
    case "email":
      return { type: "email" };
    case "phone":
    case "tel":
      return { type: "phone" };
    case "text":
    case "string":
    case "varchar":
    default:
      if (name.includes("email")) return { type: "email" };
      if (name.includes("phone") || name.includes("mobile") || name.includes("tel"))
        return { type: "phone" };
      if (name.includes("address")) return { type: "address" };
      if (name.includes("date")) return { type: "date" };
      if (rows > 1) return { type: "textarea" };
      return { type: "text" };
  }
}

/**
 * Normalise a legacy table-definition payload into a builder-ready form.
 * ID/system fields are dropped from the visible schema but reported as warnings.
 */
export function normalizeLegacyForm(input: LegacyTable | string): NormalizedForm {
  const table: LegacyTable = typeof input === "string" ? JSON.parse(input) : input;
  const warnings: string[] = [];

  if (!table || typeof table !== "object") {
    throw new Error("Invalid payload: expected a table definition object.");
  }

  const rawFields = Array.isArray(table.fields) ? table.fields : [];
  if (!rawFields.length) warnings.push("No fields found in the payload.");

  if (
    typeof table.fieldsCount === "number" &&
    table.fieldsCount !== rawFields.length
  ) {
    warnings.push(
      `Declared fieldsCount (${table.fieldsCount}) does not match the ${rawFields.length} field definition(s) supplied.`
    );
  }

  const ordered = [...rawFields].sort(
    (a, b) => (a.index ?? 0) - (b.index ?? 0)
  );

  const usedKeys = new Set<string>();
  const fields: BuilderField[] = [];

  for (const f of ordered) {
    const sourceName = String(f.name || f.label || "").trim();
    if (!sourceName) {
      warnings.push("Skipped a field with no name or label.");
      continue;
    }

    const { type, skip } = mapLegacyType(f);
    if (skip || sourceName === table.primaryField) {
      warnings.push(
        `"${sourceName}" (${f.type}) is a system/primary key and was excluded from the form schema.`
      );
      continue;
    }

    let key = snakeKey(sourceName) || `field_${fields.length + 1}`;
    if (usedKeys.has(key)) {
      let n = 2;
      while (usedKeys.has(`${key}_${n}`)) n += 1;
      key = `${key}_${n}`;
    }
    usedKeys.add(key);

    const label =
      f.label && f.label.trim() && f.label.trim().toLowerCase() !== "num"
        ? f.label.trim()
        : humanise(sourceName);

    const validation: BuilderFieldValidation = {};
    if (type === "textarea" && Number(f.rows) > 1) {
      validation.maxLength = 2000;
    }

    const typeOptions = (f.typeOptions || {}) as Record<string, unknown>;
    const hasLookup = type === "select" && typeOptions.source;

    if (hasLookup) {
      warnings.push(
        `"${label}" is a lookup on "${String(typeOptions.source)}" — options must be populated manually or synced from that source.`
      );
    }

    const field: BuilderField = {
      id: crypto.randomUUID(),
      type,
      label,
      key,
      required: truthy(f.required),
      ...(type === "select" ? { options: [] as string[] } : {}),
      ...(Object.keys(validation).length ? { validation } : {}),
      meta: {
        legacyName: sourceName,
        legacyType: f.type ?? null,
        index: f.index ?? null,
        width: f.width || "100%",
        rows: f.rows ?? 0,
        format: f.format || "",
        encrypted: truthy(f.encrypted),
        unique: truthy(f.unique),
        allowUpdate: truthy(f.allowUpdate),
        ...(hasLookup
          ? {
              lookup: {
                source: typeOptions.source ?? null,
                valueField: typeOptions.valueField ?? null,
                textField: typeOptions.textField ?? null,
                orderField: typeOptions.orderField ?? null,
              },
            }
          : {}),
      },
    };

    if (truthy(f.encrypted)) {
      field.helpText = "This value is stored encrypted.";
    }

    fields.push(field);
  }

  const displayName = humanise(table.tableName || "Imported form");

  return {
    name: displayName,
    slug: slugify(table.tableName || "imported-form"),
    description: `Imported from legacy table "${table.tableName ?? "unknown"}"${
      table.tableId !== undefined ? ` (tableId ${table.tableId})` : ""
    }.`,
    fields,
    source: {
      tableName: table.tableName,
      tableId: table.tableId,
      contentCode: table.contentCode,
      project: table.project,
      platform: table.platform,
      primaryField: table.primaryField,
      declaredFieldsCount: table.fieldsCount,
    },
    warnings,
  };
}

/** Reverse mapping: builder schema back into the legacy table-definition shape. */
export function denormalizeToLegacy(
  form: { name: string; fields: BuilderField[] },
  source: Partial<NormalizedForm["source"]> = {}
): LegacyTable {
  const reverse: Record<BuilderFieldType, string> = {
    text: "Text",
    email: "Text",
    phone: "Text",
    number: "Number",
    textarea: "Memo",
    select: "Select",
    checkbox: "Checkbox",
    date: "Date",
    address: "Memo",
    file: "File",
    heading: "Text",
  };

  const primaryField = source.primaryField || "ID";
  const fields: LegacyField[] = [
    {
      index: 1,
      label: "Num",
      name: primaryField,
      type: "ID",
      width: "0%",
      rows: 0,
      format: "",
      required: 0,
      encrypted: 0,
      unique: 0,
      allowUpdate: 0,
      typeOptions: {},
    },
    ...form.fields
      .filter((f) => f.type !== "heading")
      .map((f, i) => {
        const meta = (f.meta || {}) as Record<string, any>;
        return {
          index: i + 2,
          label: f.label,
          name: meta.legacyName || f.key,
          type: reverse[f.type] || "Text",
          width: meta.width || "50%",
          rows: f.type === "textarea" ? Math.max(Number(meta.rows) || 3, 2) : 1,
          format: meta.format || (f.type === "select" ? "Default" : ""),
          required: f.required ? 1 : 0,
          encrypted: meta.encrypted ? 1 : 0,
          unique: meta.unique ? 1 : 0,
          allowUpdate: meta.allowUpdate ? 1 : 0,
          typeOptions: meta.lookup
            ? {
                source: meta.lookup.source ?? "",
                valueField: meta.lookup.valueField ?? "",
                textField: meta.lookup.textField ?? "",
                orderField: meta.lookup.orderField ?? "",
              }
            : {},
        } as LegacyField;
      }),
  ];

  return {
    tableId: source.tableId ?? 0,
    contentCode: source.contentCode ?? 0,
    project: source.project ?? 0,
    platform: source.platform ?? 0,
    tableName: source.tableName || form.name.replace(/[^a-zA-Z0-9]/g, ""),
    fieldsCount: fields.length,
    primaryField,
    fields,
  };
}
