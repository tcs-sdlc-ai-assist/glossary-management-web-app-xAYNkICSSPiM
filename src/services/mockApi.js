import {
  getTerms,
  addTerm,
  updateTerm,
  deleteTerm,
  searchTerms,
  sortTerms,
  paginateTerms,
  importTerms,
  exportTerms,
} from './glossaryRepository.js';

/**
 * Simulates network delay for realistic UX.
 * @param {number} [ms=100] - Delay in milliseconds
 * @returns {Promise<void>}
 */
function simulateDelay(ms = 100) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetches all glossary terms with optional search, sort, and pagination.
 * @param {object} [options]
 * @param {string} [options.query] - Search query string
 * @param {string} [options.sortColumn] - Column to sort by
 * @param {string} [options.sortDirection] - Sort direction ('asc' or 'desc')
 * @param {number} [options.page] - Page number (1-based)
 * @param {number} [options.pageSize] - Number of items per page
 * @returns {Promise<object>} Response with status, data, and pagination info
 */
export async function getGlossaryTerms(options = {}) {
  await simulateDelay();

  try {
    const { query, sortColumn, sortDirection, page, pageSize } = options;

    let terms = query ? searchTerms(query) : getTerms();

    if (sortColumn) {
      terms = sortTerms(terms, sortColumn, sortDirection);
    }

    if (page !== undefined || pageSize !== undefined) {
      const paginated = paginateTerms(terms, page, pageSize);
      return {
        status: 'success',
        data: paginated.items,
        page: paginated.page,
        pageSize: paginated.pageSize,
        totalPages: paginated.totalPages,
        totalItems: paginated.totalItems,
      };
    }

    return {
      status: 'success',
      data: terms,
      totalItems: terms.length,
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message || 'Failed to fetch glossary terms',
      data: [],
    };
  }
}

/**
 * Creates a new glossary term.
 * @param {object} termData - The term data to create
 * @param {string} termData.name - Term name
 * @param {string} termData.scope - Term scope
 * @param {string} [termData.translationDE] - German translation
 * @param {string} [termData.translationES] - Spanish translation
 * @param {boolean} [termData.keepAsIs] - Whether to keep the term as-is
 * @param {string} [termData.notes] - Additional notes
 * @returns {Promise<object>} Response with status and created term or error message
 */
export async function createGlossaryTerm(termData) {
  await simulateDelay();

  try {
    const result = addTerm(termData);
    return result;
  } catch (error) {
    return {
      status: 'error',
      message: error.message || 'Failed to create glossary term',
    };
  }
}

/**
 * Updates an existing glossary term by id.
 * @param {string} id - The term id to update
 * @param {object} updates - The fields to update
 * @returns {Promise<object>} Response with status and updated term or error message
 */
export async function updateGlossaryTerm(id, updates) {
  await simulateDelay();

  try {
    const result = updateTerm(id, updates);
    return result;
  } catch (error) {
    return {
      status: 'error',
      message: error.message || 'Failed to update glossary term',
    };
  }
}

/**
 * Deletes a glossary term by id.
 * @param {string} id - The term id to delete
 * @returns {Promise<object>} Response with status or error message
 */
export async function deleteGlossaryTerm(id) {
  await simulateDelay();

  try {
    const result = deleteTerm(id);
    return result;
  } catch (error) {
    return {
      status: 'error',
      message: error.message || 'Failed to delete glossary term',
    };
  }
}

/**
 * Imports glossary terms from a parsed array of term data objects.
 * @param {Array<object>} termDataArray - Array of term data to import
 * @returns {Promise<object>} Response with status, imported terms, skipped count, and errors
 */
export async function importGlossaryTerms(termDataArray) {
  await simulateDelay(150);

  try {
    const result = importTerms(termDataArray);
    return result;
  } catch (error) {
    return {
      status: 'error',
      message: error.message || 'Failed to import glossary terms',
      imported: [],
      skipped: 0,
      errors: [],
    };
  }
}

/**
 * Exports all glossary terms to an XLSX file Blob.
 * @returns {Promise<object>} Response with status and Blob data or error message
 */
export async function exportGlossaryTerms() {
  await simulateDelay(150);

  try {
    const blob = exportTerms();
    return {
      status: 'success',
      data: blob,
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message || 'Failed to export glossary terms',
    };
  }
}