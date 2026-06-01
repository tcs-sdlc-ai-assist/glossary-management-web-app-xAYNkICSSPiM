import * as XLSX from 'xlsx';
import {
  SUPPORTED_FILE_TYPES,
  SUPPORTED_FILE_MIME_TYPES,
  SCOPE_OPTIONS,
} from '../constants.js';

/**
 * Validates whether a file has an allowed type/extension.
 * @param {File} file - The file to validate
 * @returns {{ valid: boolean, error?: string }} Validation result
 */
export function validateFileType(file) {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  const fileName = file.name || '';
  const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();

  const allowedExtensions = [
    SUPPORTED_FILE_TYPES.CSV,
    SUPPORTED_FILE_TYPES.XLSX,
    SUPPORTED_FILE_TYPES.XLS,
  ];

  if (!allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `Unsupported file type "${extension}". Allowed types: ${allowedExtensions.join(', ')}`,
    };
  }

  if (file.type && file.type !== '' && !SUPPORTED_FILE_MIME_TYPES.includes(file.type)) {
    const isCsvExtension = extension === SUPPORTED_FILE_TYPES.CSV;
    const csvMimeVariants = ['text/csv', 'text/plain', 'application/vnd.ms-excel'];
    if (isCsvExtension && csvMimeVariants.includes(file.type)) {
      return { valid: true };
    }

    return {
      valid: false,
      error: `Unsupported MIME type "${file.type}". Please upload a CSV, XLSX, or XLS file.`,
    };
  }

  return { valid: true };
}

/**
 * Maps a spreadsheet row object to a glossary term data object.
 * Handles various column name formats (case-insensitive, with/without spaces).
 * @param {object} row - A row object from the parsed spreadsheet
 * @returns {object} A term data object suitable for createTerm/validateTerm
 */
export function mapRowToTerm(row) {
  if (!row || typeof row !== 'object') {
    return {
      name: '',
      scope: '',
      translationDE: '',
      translationES: '',
      keepAsIs: false,
      notes: '',
    };
  }

  const keys = Object.keys(row);

  function findValue(...candidates) {
    for (const candidate of candidates) {
      const normalizedCandidate = candidate.toLowerCase().replace(/[\s_()-]/g, '');
      for (const key of keys) {
        const normalizedKey = key.toLowerCase().replace(/[\s_()-]/g, '');
        if (normalizedKey === normalizedCandidate) {
          return row[key];
        }
      }
    }
    return undefined;
  }

  const name = findValue('name', 'term', 'termname', 'term name') || '';
  const scope = findValue('scope') || '';
  const translationDE = findValue(
    'translationde',
    'translation de',
    'translation (de)',
    'german',
    'de',
    'deutsch'
  ) || '';
  const translationES = findValue(
    'translationes',
    'translation es',
    'translation (es)',
    'spanish',
    'es',
    'español',
    'espanol'
  ) || '';
  const keepAsIsRaw = findValue('keepasis', 'keep as is', 'keepas-is', 'keep_as_is');
  const notes = findValue('notes', 'note', 'comments', 'comment') || '';

  let keepAsIs = false;
  if (typeof keepAsIsRaw === 'boolean') {
    keepAsIs = keepAsIsRaw;
  } else if (typeof keepAsIsRaw === 'string') {
    const normalized = keepAsIsRaw.trim().toLowerCase();
    keepAsIs = normalized === 'yes' || normalized === 'true' || normalized === '1';
  } else if (typeof keepAsIsRaw === 'number') {
    keepAsIs = keepAsIsRaw === 1;
  }

  const normalizedScope = normalizeScope(String(scope).trim());

  return {
    name: String(name).trim(),
    scope: normalizedScope,
    translationDE: String(translationDE).trim(),
    translationES: String(translationES).trim(),
    keepAsIs,
    notes: String(notes).trim(),
  };
}

/**
 * Normalizes a scope value to match one of the allowed SCOPE_OPTIONS.
 * @param {string} scope - The raw scope value
 * @returns {string} The normalized scope or the original value if no match
 */
function normalizeScope(scope) {
  if (!scope) {
    return '';
  }

  const lowerScope = scope.toLowerCase();
  for (const option of SCOPE_OPTIONS) {
    if (option.toLowerCase() === lowerScope) {
      return option;
    }
  }

  return scope;
}

/**
 * Parses a file (CSV, XLSX, XLS) and returns an array of term data objects.
 * @param {File} file - The file to parse
 * @returns {Promise<{ status: string, data?: object[], message?: string }>} Parsed result
 */
export async function parseFile(file) {
  const validation = validateFileType(file);
  if (!validation.valid) {
    return {
      status: 'error',
      message: validation.error,
      data: [],
    };
  }

  try {
    const arrayBuffer = await readFileAsArrayBuffer(file);
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return {
        status: 'error',
        message: 'The file contains no sheets',
        data: [],
      };
    }

    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    if (!worksheet) {
      return {
        status: 'error',
        message: 'The first sheet is empty',
        data: [],
      };
    }

    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    if (!rows || rows.length === 0) {
      return {
        status: 'error',
        message: 'The file contains no data rows',
        data: [],
      };
    }

    const terms = rows.map((row) => mapRowToTerm(row));

    return {
      status: 'success',
      data: terms,
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message || 'Failed to parse file',
      data: [],
    };
  }
}

/**
 * Reads a File object as an ArrayBuffer.
 * @param {File} file - The file to read
 * @returns {Promise<ArrayBuffer>} The file contents as an ArrayBuffer
 */
function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target.result);
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Generates an XLSX export Blob from an array of glossary term objects.
 * @param {Array<object>} terms - The glossary terms to export
 * @returns {{ blob: Blob, filename: string }} The generated Blob and suggested filename
 */
export function generateExcelExport(terms) {
  const data = (terms || []).map((term) => ({
    Name: term.name || '',
    Scope: term.scope || '',
    'Translation (DE)': term.translationDE || '',
    'Translation (ES)': term.translationES || '',
    'Keep As Is': term.keepAsIs ? 'Yes' : 'No',
    Notes: term.notes || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  const columnWidths = [
    { wch: 25 },
    { wch: 12 },
    { wch: 25 },
    { wch: 25 },
    { wch: 12 },
    { wch: 30 },
  ];
  worksheet['!cols'] = columnWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Glossary');

  const xlsxData = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([xlsxData], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `glossary-export-${timestamp}.xlsx`;

  return {
    blob,
    filename,
  };
}