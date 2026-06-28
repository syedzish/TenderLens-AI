export const MAX_FILE_COUNT = 5;
export const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024;
export const MAX_TOTAL_UPLOAD_BYTES = 12 * 1024 * 1024;

const SUPPORTED_EXTENSIONS = new Set([".pdf", ".docx", ".txt", ".jpg", ".jpeg", ".png", ".webp"]);
const SUPPORTED_MIME_TYPES = new Map<string, string[]>([
  [".pdf", ["application/pdf"]],
  [".docx", ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/octet-stream"]],
  [".txt", ["text/plain"]],
  [".jpg", ["image/jpeg"]],
  [".jpeg", ["image/jpeg"]],
  [".png", ["image/png"]],
  [".webp", ["image/webp"]],
]);

export type UploadManifestFile = {
  name: string;
  type?: string;
  size: number;
};

export type ValidatedUploadFile = UploadManifestFile & {
  safeName: string;
  extension: SupportedExtension;
};

export type UploadManifestResult = {
  ok: boolean;
  files: ValidatedUploadFile[];
  errors: string[];
};

export type UploadContentFile = {
  meta: ValidatedUploadFile;
  buffer: ArrayBuffer;
};

export type UploadContentValidationResult = {
  ok: boolean;
  errors: string[];
};

export function sanitizeFileName(input: string): string {
  const trimmed = input.trim();
  const baseName = trimmed.split(/[\\/]/).filter(Boolean).pop() ?? "document";
  const withoutControlChars = baseName.replace(/[\u0000-\u001f\u007f]/g, "");
  const collapsed = withoutControlChars
    .replace(/[^\w.\- ]+/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/\.{2,}/g, ".")
    .replace(/^[_\-.]+|[_\-.]+$/g, "");

  return collapsed || "document";
}

export type SupportedExtension = ".pdf" | ".docx" | ".txt" | ".jpg" | ".jpeg" | ".png" | ".webp";

export function getFileExtension(fileName: string): SupportedExtension | ".doc" | null {
  const safeName = sanitizeFileName(fileName).toLowerCase();
  const dotIndex = safeName.lastIndexOf(".");

  if (dotIndex === -1) {
    return null;
  }

  const extension = safeName.slice(dotIndex);
  if (extension === ".doc") {
    return ".doc";
  }

  return SUPPORTED_EXTENSIONS.has(extension) ? (extension as SupportedExtension) : null;
}

export function isSupportedFile(file: UploadManifestFile): boolean {
  const extension = getFileExtension(file.name);

  if (!extension || extension === ".doc") {
    return false;
  }

  const mimeType = file.type?.toLowerCase().trim();

  if (!mimeType) {
    return true;
  }

  return SUPPORTED_MIME_TYPES.get(extension)?.includes(mimeType) ?? false;
}

export function validateUploadManifest(files: UploadManifestFile[]): UploadManifestResult {
  const errors: string[] = [];
  const validated: ValidatedUploadFile[] = [];

  if (files.length === 0) {
    errors.push("Add at least one tender or proposal document.");
  }

  if (files.length > MAX_FILE_COUNT) {
    errors.push(`Upload up to ${MAX_FILE_COUNT} files.`);
  }

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  if (totalSize > MAX_TOTAL_UPLOAD_BYTES) {
    errors.push("Total upload size must stay under 12 MB.");
  }

  for (const file of files.slice(0, MAX_FILE_COUNT)) {
    const safeName = sanitizeFileName(file.name);
    const extension = getFileExtension(file.name);

    if (file.size <= 0) {
      errors.push(`${safeName} is empty.`);
      continue;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      errors.push(`${safeName} is larger than 4 MB.`);
      continue;
    }

    if (extension === ".doc") {
      errors.push(`Please save ${safeName} as PDF or DOCX and upload again.`);
      continue;
    }

    if (!extension || !isSupportedFile(file)) {
      errors.push(`${safeName} is not a supported file type.`);
      continue;
    }

    validated.push({
      ...file,
      safeName,
      extension,
    });
  }

  return {
    ok: errors.length === 0,
    files: errors.length === 0 ? validated : [],
    errors,
  };
}

function bytes(buffer: ArrayBuffer): Uint8Array {
  return new Uint8Array(buffer);
}

function startsWith(actual: Uint8Array, expected: number[]): boolean {
  return expected.every((value, index) => actual[index] === value);
}

function asciiAt(actual: Uint8Array, start: number, text: string): boolean {
  return text.split("").every((char, index) => actual[start + index] === char.charCodeAt(0));
}

function looksLikeText(actual: Uint8Array): boolean {
  return !actual.some((value) => value === 0);
}

function hasExpectedSignature(file: UploadContentFile): boolean {
  const actual = bytes(file.buffer);

  switch (file.meta.extension) {
    case ".pdf":
      return asciiAt(actual, 0, "%PDF-");
    case ".docx":
      return startsWith(actual, [0x50, 0x4b, 0x03, 0x04]) || startsWith(actual, [0x50, 0x4b, 0x05, 0x06]);
    case ".jpg":
    case ".jpeg":
      return startsWith(actual, [0xff, 0xd8, 0xff]);
    case ".png":
      return startsWith(actual, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case ".webp":
      return asciiAt(actual, 0, "RIFF") && asciiAt(actual, 8, "WEBP");
    case ".txt":
      return looksLikeText(actual);
    default:
      return false;
  }
}

export function validateUploadContent(files: UploadContentFile[]): UploadContentValidationResult {
  const errors = files
    .filter((file) => !hasExpectedSignature(file))
    .map((file) => `${file.meta.safeName} does not look like a valid ${file.meta.extension.toUpperCase().slice(1)} file.`);

  return {
    ok: errors.length === 0,
    errors,
  };
}
