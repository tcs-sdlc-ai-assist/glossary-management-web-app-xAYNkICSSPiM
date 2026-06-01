import { LOCAL_STORAGE_KEY, PAGE_SIZE, SORT_DIRECTIONS, MAX_TERMS } from '../constants.js';
import { createTerm, validateTerm, isDuplicate } from '../models/glossaryModel.js';
import * as XLSX from 'xlsx';

/**
 * In-memory cache of glossary terms.
 * @type {Array<object>}
 */
let termsCache = [];

/**
 * Whether the cache has been initialized from localStorage.
 * @type {boolean}
 */
let initialized = false;

/**
 * Loads glossary terms from localStorage into the in-memory cache.
 * @returns {Array<object>} The loaded terms
 */
export function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        termsCache = parsed;
      } else {
        termsCache = [];
      }
    } else {
      termsCache = [];
    }
  } catch (e) {
    console.error('Failed to load glossary terms from localStorage:', e);
    termsCache = [];
  }
  initialized = true;
  return [...termsCache];
}

/**
 * Syncs the in-memory cache to localStorage.
 */
export function syncToLocalStorage() {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(termsCache));
  } catch (e) {
    console.error('Failed to sync glossary terms to localStorage:', e);
  }
}

/**
 * Ensures the cache is initialized from localStorage.
 */
function ensureInitialized() {
  if (!initialized) {
    loadFromLocalStorage();
  }
}

/**
 * Returns all glossary terms.
 * @returns {Array<object>} A copy of all terms
 */
export function getTerms() {
  ensureInitialized();
  return [...termsCache];
}

/**
 * Adds a new glossary term.
 * @param {object} termData - The term data to add
 * @returns {object} Result with status, term or message
 */
export function addTerm(termData) {
  ensureInitialized();

  if (termsCache.length >= MAX_TERMS) {
    return {
      status: 'error',
      message: `Maximum number of terms (${MAX_TERMS}) reached`,
    };
  }

  const validation = validateTerm(termData);
  if (!validation.valid) {
    return {
      status: 'error',
      message: validation.errors.join('; '),
    };
  }

  if (isDuplicate(termData.name, termsCache)) {
    return {
      status: 'error',
      message: 'Duplicate term name',
    };
  }

  const term = createTerm({
    name: termData.name,
    scope: termData.scope,
    translationDE: termData.translationDE || '',
    translationES: termData.translationES || '',
    keepAsIs: termData.keepAsIs || false,
    notes: termData.notes || '',
  });

  termsCache.push(term);
  syncToLocalStorage();

  return {
    status: 'success',
    term,
  };
}

/**
 * Updates an existing glossary term by id.
 * @param {string} id - The term id to update
 * @param {object} updates - The fields to update
 * @returns {object} Result with status, term or message
 */
export function updateTerm(id, updates) {
  ensureInitialized();

  if (!id) {
    return {
      status: 'error',
      message: 'Term id is required',
    };
  }

  const index = termsCache.findIndex((t) => t.id === id);
  if (index === -1) {
    return {
      status: 'error',
      message: 'Term not found',
    };
  }

  const existing = termsCache[index];
  const merged = {
    ...existing,
    name: updates.name !== undefined ? updates.name : existing.name,
    scope: updates.scope !== undefined ? updates.scope : existing.scope,
    translationDE: updates.translationDE !== undefined ? updates.translationDE : existing.translationDE,
    translationES: updates.translationES !== undefined ? updates.translationES : existing.translationES,
    keepAsIs: updates.keepAsIs !== undefined ? updates.keepAsIs : existing.keepAsIs,
    notes: updates.notes !== undefined ? updates.notes : existing.notes,
  };

  const validation = validateTerm(merged);
  if (!validation.valid) {
    return {
      status: 'error',
      message: validation.errors.join('; '),
    };
  }

  if (isDuplicate(merged.name, termsCache, id)) {
    return {
      status: 'error',
      message: 'Duplicate term name',
    };
  }

  merged.updatedAt = new Date().toISOString();
  termsCache[index] = merged;
  syncToLocalStorage();

  return {
    status: 'success',
    term: { ...merged },
  };
}

/**
 * Deletes a glossary term by id.
 * @param {string} id - The term id to delete
 * @returns {object} Result with status or message
 */
export function deleteTerm(id) {
  ensureInitialized();

  if (!id) {
    return {
      status: 'error',
      message: 'Term id is required',
    };
  }

  const index = termsCache.findIndex((t) => t.id === id);
  if (index === -1) {
    return {
      status: 'error',
      message: 'Term not found',
    };
  }

  termsCache.splice(index, 1);
  syncToLocalStorage();

  return {
    status: 'success',
  };
}

/**
 * Searches glossary terms by query string across name, scope, translations, and notes.
 * @param {string} query - The search query
 * @returns {Array<object>} Matching terms
 */
export function searchTerms(query) {
  ensureInitialized();

  if (!query || typeof query !== 'string') {
    return [...termsCache];
  }

  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return [...termsCache];
  }

  return termsCache.filter((term) => {
    const fields = [
      term.name,
      term.scope,
      term.translationDE,
      term.translationES,
      term.notes,
    ];
    return fields.some(
      (field) =>
        typeof field === 'string' && field.toLowerCase().includes(normalizedQuery)
    );
  });
}

/**
 * Sorts an array of terms by the given column and direction.
 * @param {Array<object>} terms - The terms to sort
 * @param {string} column - The column to sort by
 * @param {string} [direction='asc'] - Sort direction ('asc' or 'desc')
 * @returns {Array<object>} Sorted terms (new array)
 */
export function sortTerms(terms, column, direction = SORT_DIRECTIONS.ASC) {
  if (!Array.isArray(terms)) {
    return [];
  }

  if (!column) {
    return [...terms];
  }

  const sorted = [...terms].sort((a, b) => {
    let valA = a[column];
    let valB = b[column];

    if (typeof valA === 'boolean') {
      valA = valA ? 1 : 0;
      valB = valB ? 1 : 0;
      return direction === SORT_DIRECTIONS.ASC ? valA - valB : valB - valA;
    }

    if (typeof valA === 'string') {
      valA = valA.toLowerCase();
    }
    if (typeof valB === 'string') {
      valB = valB.toLowerCase();
    }

    if (valA == null) valA = '';
    if (valB == null) valB = '';

    if (valA < valB) {
      return direction === SORT_DIRECTIONS.ASC ? -1 : 1;
    }
    if (valA > valB) {
      return direction === SORT_DIRECTIONS.ASC ? 1 : -1;
    }
    return 0;
  });

  return sorted;
}

/**
 * Paginates an array of terms.
 * @param {Array<object>} terms - The terms to paginate
 * @param {number} [page=1] - The page number (1-based)
 * @param {number} [pageSize=PAGE_SIZE] - The number of items per page
 * @returns {object} An object with items, page, pageSize, totalPages, totalItems
 */
export function paginateTerms(terms, page = 1, pageSize = PAGE_SIZE) {
  if (!Array.isArray(terms)) {
    return {
      items: [],
      page: 1,
      pageSize,
      totalPages: 0,
      totalItems: 0,
    };
  }

  const totalItems = terms.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (currentPage - 1) * pageSize;
  const items = terms.slice(startIndex, startIndex + pageSize);

  return {
    items,
    page: currentPage,
    pageSize,
    totalPages,
    totalItems,
  };
}

/**
 * Imports an array of term data objects, validating and deduplicating.
 * @param {Array<object>} termDataArray - Array of term data to import
 * @returns {object} Result with status, imported terms, skipped count, and errors
 */
export function importTerms(termDataArray) {
  ensureInitialized();

  if (!Array.isArray(termDataArray) || termDataArray.length === 0) {
    return {
      status: 'error',
      message: 'No terms to import',
      imported: [],
      skipped: 0,
      errors: [],
    };
  }

  const imported = [];
  const errors = [];
  let skipped = 0;

  for (let i = 0; i < termDataArray.length; i++) {
    const termData = termDataArray[i];

    if (termsCache.length >= MAX_TERMS) {
      errors.push({ row: i + 1, message: `Maximum number of terms (${MAX_TERMS}) reached` });
      skipped++;
      continue;
    }

    const validation = validateTerm(termData);
    if (!validation.valid) {
      errors.push({ row: i + 1, message: validation.errors.join('; ') });
      skipped++;
      continue;
    }

    const allTerms = [...termsCache, ...imported];
    if (isDuplicate(termData.name, allTerms)) {
      errors.push({ row: i + 1, message: `Duplicate term name: "${termData.name}"` });
      skipped++;
      continue;
    }

    const term = createTerm({
      name: termData.name,
      scope: termData.scope,
      translationDE: termData.translationDE || '',
      translationES: termData.translationES || '',
      keepAsIs: termData.keepAsIs || false,
      notes: termData.notes || '',
    });

    imported.push(term);
  }

  if (imported.length > 0) {
    termsCache = [...termsCache, ...imported];
    syncToLocalStorage();
  }

  return {
    status: imported.length > 0 ? 'success' : 'error',
    message: imported.length > 0
      ? `Imported ${imported.length} term(s)${skipped > 0 ? `, skipped ${skipped}` : ''}`
      : 'No terms were imported',
    imported,
    skipped,
    errors,
  };
}

/**
 * Exports all glossary terms to an XLSX file (as a Blob).
 * @returns {Blob} The exported file as a Blob
 */
export function exportTerms() {
  ensureInitialized();

  const data = termsCache.map((term) => ({
    Name: term.name,
    Scope: term.scope,
    'Translation (DE)': term.translationDE || '',
    'Translation (ES)': term.translationES || '',
    'Keep As Is': term.keepAsIs ? 'Yes' : 'No',
    Notes: term.notes || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Glossary');

  const xlsxData = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([xlsxData], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  return blob;
}

/**
 * Resets the repository (useful for testing).
 */
export function _resetForTesting() {
  termsCache = [];
  initialized = false;
}