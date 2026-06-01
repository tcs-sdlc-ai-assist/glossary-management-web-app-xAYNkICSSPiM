import { v4 as uuidv4 } from 'uuid';
import { SCOPE_OPTIONS } from '../constants.js';

/**
 * Creates a new glossary term object.
 * @param {object} params
 * @param {string} params.name - Term name (required)
 * @param {string} params.scope - Term scope (required)
 * @param {string} [params.translationDE] - German translation
 * @param {string} [params.translationES] - Spanish translation
 * @param {boolean} [params.keepAsIs] - Whether to keep the term as-is
 * @param {string} [params.notes] - Additional notes
 * @returns {object} A glossary term object with generated id and timestamps
 */
export function createTerm({
  name = '',
  scope = '',
  translationDE = '',
  translationES = '',
  keepAsIs = false,
  notes = '',
} = {}) {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    name: name.trim(),
    scope,
    translationDE: translationDE.trim(),
    translationES: translationES.trim(),
    keepAsIs: Boolean(keepAsIs),
    notes: notes.trim(),
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Validates a glossary term object.
 * @param {object} term - The term object to validate
 * @returns {object} An object with `valid` (boolean) and `errors` (string[])
 */
export function validateTerm(term) {
  const errors = [];

  if (!term) {
    return { valid: false, errors: ['Term object is required'] };
  }

  const name = typeof term.name === 'string' ? term.name.trim() : '';
  if (!name) {
    errors.push('Name is required');
  }

  const scope = typeof term.scope === 'string' ? term.scope.trim() : '';
  if (!scope) {
    errors.push('Scope is required');
  } else if (!SCOPE_OPTIONS.includes(scope)) {
    errors.push(`Scope must be one of: ${SCOPE_OPTIONS.join(', ')}`);
  }

  const translationDE = typeof term.translationDE === 'string' ? term.translationDE.trim() : '';
  const translationES = typeof term.translationES === 'string' ? term.translationES.trim() : '';
  const keepAsIs = Boolean(term.keepAsIs);

  if (!translationDE && !translationES && !keepAsIs) {
    errors.push('At least one translation (DE or ES) or Keep As Is must be provided');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Checks if a term name already exists in the given list of terms.
 * @param {string} name - The term name to check
 * @param {object[]} existingTerms - Array of existing term objects
 * @param {string|null} [excludeId] - Optional term id to exclude (for edit scenarios)
 * @returns {boolean} True if a duplicate exists
 */
export function isDuplicate(name, existingTerms, excludeId = null) {
  if (!name || !Array.isArray(existingTerms)) {
    return false;
  }

  const normalizedName = name.trim().toLowerCase();

  return existingTerms.some(
    (term) =>
      term.name.trim().toLowerCase() === normalizedName &&
      (excludeId === null || term.id !== excludeId)
  );
}