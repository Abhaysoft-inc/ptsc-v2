import type { FormFieldType, RegistrationField } from "@/lib/dashboard";

export const FIELD_TYPES: { value: FormFieldType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "number", label: "Number" },
  { value: "tel", label: "Phone" },
  { value: "url", label: "URL" },
  { value: "textarea", label: "Text Area" },
  { value: "select", label: "Dropdown" },
  { value: "checkbox", label: "Multi-Select Checkbox" },
  { value: "file", label: "File Upload" },
];

export const FILE_TYPE_PRESETS: { label: string; types: string[] }[] = [
  { label: "PDF only", types: [".pdf"] },
  { label: "Images", types: [".jpg", ".jpeg", ".png"] },
  { label: "Documents", types: [".pdf", ".docx", ".doc"] },
  { label: "Zip / Code", types: [".zip", ".rar"] },
];

export function isOptionType(type: FormFieldType) {
  return type === "select" || type === "checkbox";
}

let fieldCounter = 0;

export function makeField(): RegistrationField {
  fieldCounter += 1;
  return {
    id: `fld-${Date.now()}-${fieldCounter}`,
    name: "",
    label: "",
    type: "text",
    required: false,
    placeholder: "",
    description: "",
    validation: "",
    options: [],
    allowedTypes: [],
    maxSizeMB: 10,
  };
}
