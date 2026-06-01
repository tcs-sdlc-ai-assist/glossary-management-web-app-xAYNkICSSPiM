import { describe, it, expect, beforeEach, vi } from 'vitest';
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
  loadFromLocalStorage,
  syncToLocalStorage,
  _resetForTesting,
} from './glossaryRepository.js';
import { SORT_DIRECTIONS, MAX_TERMS } from '../constants.js';

describe('glossaryRepository', () => {
  beforeEach(() => {
    _resetForTesting();
    localStorage.clear();
  });

  describe('loadFromLocalStorage', () => {
    it('loads an empty array when localStorage is empty', () => {
      const terms = loadFromLocalStorage();
      expect(terms).toEqual([]);
    });

    it('loads terms from localStorage when data exists', () => {
      const stored = [
        {
          id: 'test-1',
          name: 'Term1',
          scope: 'Global',
          translationDE: 'DE1',
          translationES: 'ES1',
          keepAsIs: false,
          notes: '',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem('glossaryTerms_v1', JSON.stringify(stored));
      const terms = loadFromLocalStorage();
      expect(terms).toHaveLength(1);
      expect(terms[0].name).toBe('Term1');
    });

    it('returns empty array when localStorage contains invalid JSON', () => {
      localStorage.setItem('glossaryTerms_v1', 'not-json');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const terms = loadFromLocalStorage();
      expect(terms).toEqual([]);
      consoleSpy.mockRestore();
    });

    it('returns empty array when localStorage contains non-array JSON', () => {
      localStorage.setItem('glossaryTerms_v1', JSON.stringify({ foo: 'bar' }));
      const terms = loadFromLocalStorage();
      expect(terms).toEqual([]);
    });
  });

  describe('syncToLocalStorage', () => {
    it('persists terms to localStorage', () => {
      addTerm({
        name: 'SyncTest',
        scope: 'Global',
        translationDE: 'SyncDE',
        translationES: '',
        keepAsIs: false,
        notes: '',
      });
      const raw = localStorage.getItem('glossaryTerms_v1');
      expect(raw).toBeTruthy();
      const parsed = JSON.parse(raw);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].name).toBe('SyncTest');
    });
  });

  describe('getTerms', () => {
    it('returns an empty array when no terms exist', () => {
      loadFromLocalStorage();
      const terms = getTerms();
      expect(terms).toEqual([]);
    });

    it('returns a copy of all terms', () => {
      addTerm({
        name: 'Alpha',
        scope: 'Global',
        translationDE: 'AlphaDE',
        translationES: '',
        keepAsIs: false,
        notes: '',
      });
      addTerm({
        name: 'Beta',
        scope: 'Project',
        translationDE: 'BetaDE',
        translationES: '',
        keepAsIs: false,
        notes: '',
      });
      const terms = getTerms();
      expect(terms).toHaveLength(2);
      // Ensure it's a copy
      terms.push({ id: 'fake' });
      expect(getTerms()).toHaveLength(2);
    });
  });

  describe('addTerm', () => {
    it('adds a valid term successfully', () => {
      const result = addTerm({
        name: 'NewTerm',
        scope: 'Global',
        translationDE: 'Neu',
        translationES: 'Nuevo',
        keepAsIs: false,
        notes: 'A note',
      });
      expect(result.status).toBe('success');
      expect(result.term).toBeDefined();
      expect(result.term.name).toBe('NewTerm');
      expect(result.term.scope).toBe('Global');
      expect(result.term.translationDE).toBe('Neu');
      expect(result.term.translationES).toBe('Nuevo');
      expect(result.term.keepAsIs).toBe(false);
      expect(result.term.notes).toBe('A note');
      expect(result.term.id).toBeDefined();
      expect(result.term.createdAt).toBeDefined();
      expect(result.term.updatedAt).toBeDefined();
    });

    it('returns error when name is missing', () => {
      const result = addTerm({
        name: '',
        scope: 'Global',
        translationDE: 'DE',
        translationES: '',
        keepAsIs: false,
        notes: '',
      });
      expect(result.status).toBe('error');
      expect(result.message).toContain('Name is required');
    });

    it('returns error when scope is missing', () => {
      const result = addTerm({
        name: 'Test',
        scope: '',
        translationDE: 'DE',
        translationES: '',
        keepAsIs: false,
        notes: '',
      });
      expect(result.status).toBe('error');
      expect(result.message).toContain('Scope is required');
    });

    it('returns error when scope is invalid', () => {
      const result = addTerm({
        name: 'Test',
        scope: 'InvalidScope',
        translationDE: 'DE',
        translationES: '',
        keepAsIs: false,
        notes: '',
      });
      expect(result.status).toBe('error');
      expect(result.message).toContain('Scope must be one of');
    });

    it('returns error when no translation and keepAsIs is false', () => {
      const result = addTerm({
        name: 'Test',
        scope: 'Global',
        translationDE: '',
        translationES: '',
        keepAsIs: false,
        notes: '',
      });
      expect(result.status).toBe('error');
      expect(result.message).toContain('At least one translation');
    });

    it('allows adding a term with keepAsIs true and no translations', () => {
      const result = addTerm({
        name: 'KeepTest',
        scope: 'Global',
        translationDE: '',
        translationES: '',
        keepAsIs: true,
        notes: '',
      });
      expect(result.status).toBe('success');
      expect(result.term.keepAsIs).toBe(true);
    });

    it('returns error for duplicate term name', () => {
      addTerm({
        name: 'Duplicate',
        scope: 'Global',
        translationDE: 'DE',
        translationES: '',
        keepAsIs: false,
        notes: '',
      });
      const result = addTerm({
        name: 'Duplicate',
        scope: 'Project',
        translationDE: 'DE2',
        translationES: '',
        keepAsIs: false,
        notes: '',
      });
      expect(result.status).toBe('error');
      expect(result.message).toContain('Duplicate term name');
    });

    it('returns error for case-insensitive duplicate term name', () => {
      addTerm({
        name: 'CaseTest',
        scope: 'Global',
        translationDE: 'DE',
        translationES: '',
        keepAsIs: false,
        notes: '',
      });
      const result = addTerm({
        name: 'casetest',
        scope: 'Global',
        translationDE: 'DE2',
        translationES: '',
        keepAsIs: false,
        notes: '',
      });
      expect(result.status).toBe('error');
      expect(result.message).toContain('Duplicate term name');
    });

    it('persists added term to localStorage', () => {
      addTerm({
        name: 'Persist',
        scope: 'Global',
        translationDE: 'DE',
        translationES: '',
        keepAsIs: false,
        notes: '',
      });
      const raw = localStorage.getItem('glossaryTerms_v1');
      const parsed = JSON.parse(raw);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].name).toBe('Persist');
    });
  });

  describe('updateTerm', () => {
    it('updates an existing term successfully', () => {
      const addResult = addTerm({
        name: 'Original',
        scope: 'Global',
        translationDE: 'OrigDE',
        translationES: '',
        keepAsIs: false,
        notes: '',
      });
      const id = addResult.term.id;

      const result = updateTerm(id, {
        name: 'Updated',
        translationDE: 'UpdatedDE',
      });
      expect(result.status).toBe('success');
      expect(result.term.name).toBe('Updated');
      expect(result.term.translationDE).toBe('UpdatedDE');
      expect(result.term.scope).toBe('Global');
    });

    it('returns error when id is missing', () => {
      const result = updateTerm('', { name: 'Test' });
      expect(result.status).toBe('error');
      expect(result.message).toContain('Term id is required');
    });

    it('returns error when term is not found', () => {
      loadFromLocalStorage();
      const result = updateTerm('nonexistent-id', { name: 'Test' });
      expect(result.status).toBe('error');
      expect(result.message).toContain('Term not found');
    });

    it('returns error for invalid updates', () => {
      const addResult = addTerm({
        name: 'ValidTerm',
        scope: 'Global',
        translationDE: 'DE',
        translationES: '',
        keepAsIs: false,
        notes: '',
      });
      const id = addResult.term.id;

      const result = updateTerm(id, {
        name: '',
      });
      expect(result.status).toBe('error');
      expect(result.message).toContain('Name is required');
    });

    it('returns error for duplicate name on update', () => {
      addTerm({
        name: 'First',
        scope: 'Global',
        translationDE: 'DE1',
        translationES: '',
        keepAsIs: false,
        notes: '',
      });
      const secondResult = addTerm({
        name: 'Second',
        scope: 'Global',
        translationDE: 'DE2',
        translationES: '',
        keepAsIs: false,
        notes: '',
      });

      const result = updateTerm(secondResult.term.id, { name: 'First' });
      expect(result.status).toBe('error');
      expect(result.message).toContain('Duplicate term name');
    });

    it('allows updating a term to keep its own name', () => {
      const addResult = addTerm({
        name: 'SameName',
        scope: 'Global',
        translationDE: 'DE',
        translationES: '',
        keepAsIs: false,
        notes: '',
      });

      const result = updateTerm(addResult.term.id, {
        name: 'SameName',
        notes: 'Updated notes',
      });
      expect(result.status).toBe('success');
      expect(result.term.notes).toBe('Updated notes');
    });

    it('updates the updatedAt timestamp', () => {
      const addResult = addTerm({
        name: 'TimeTest',
        scope: 'Global',
        translationDE: 'DE',
        translationES: '',
        keepAsIs: false,
        notes: '',
      });
      const originalUpdatedAt = addResult.term.updatedAt;

      const result = updateTerm(addResult.term.id, { notes: 'new note' });
      expect(result.status).toBe('success');
      expect(result.term.updatedAt).not.toBe(originalUpdatedAt);
    });
  });

  describe('deleteTerm', () => {
    it('deletes an existing term successfully', () => {
      const addResult = addTerm({
        name: 'ToDelete',
        scope: 'Global',
        translationDE: 'DE',
        translationES: '',
        keepAsIs: false,
        notes: '',
      });

      const result = deleteTerm(addResult.term.id);
      expect(result.status).toBe('success');
      expect(getTerms()).toHaveLength(0);
    });

    it('returns error when id is missing', () => {
      const result = deleteTerm('');
      expect(result.status).toBe('error');
      expect(result.message).toContain('Term id is required');
    });

    it('returns error when term is not found', () => {
      loadFromLocalStorage();
      const result = deleteTerm('nonexistent-id');
      expect(result.status).toBe('error');
      expect(result.message).toContain('Term not found');
    });

    it('persists deletion to localStorage', () => {
      const addResult = addTerm({
        name: 'DeletePersist',
        scope: 'Global',
        translationDE: 'DE',
        translationES: '',
        keepAsIs: false,
        notes: '',
      });
      deleteTerm(addResult.term.id);

      const raw = localStorage.getItem('glossaryTerms_v1');
      const parsed = JSON.parse(raw);
      expect(parsed).toHaveLength(0);
    });
  });

  describe('searchTerms', () => {
    beforeEach(() => {
      addTerm({
        name: 'Apple',
        scope: 'Global',
        translationDE: 'Apfel',
        translationES: 'Manzana',
        keepAsIs: false,
        notes: 'A fruit',
      });
      addTerm({
        name: 'Banana',
        scope: 'Project',
        translationDE: 'Banane',
        translationES: 'Plátano',
        keepAsIs: false,
        notes: 'Yellow fruit',
      });
      addTerm({
        name: 'Cherry',
        scope: 'Team',
        translationDE: 'Kirsche',
        translationES: 'Cereza',
        keepAsIs: true,
        notes: '',
      });
    });

    it('returns all terms when query is empty', () => {
      const results = searchTerms('');
      expect(results).toHaveLength(3);
    });

    it('returns all terms when query is null', () => {
      const results = searchTerms(null);
      expect(results).toHaveLength(3);
    });

    it('returns all terms when query is undefined', () => {
      const results = searchTerms(undefined);
      expect(results).toHaveLength(3);
    });

    it('searches by name', () => {
      const results = searchTerms('apple');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Apple');
    });

    it('searches by scope', () => {
      const results = searchTerms('Project');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Banana');
    });

    it('searches by German translation', () => {
      const results = searchTerms('Kirsche');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Cherry');
    });

    it('searches by Spanish translation', () => {
      const results = searchTerms('Manzana');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Apple');
    });

    it('searches by notes', () => {
      const results = searchTerms('fruit');
      expect(results).toHaveLength(2);
    });

    it('is case-insensitive', () => {
      const results = searchTerms('BANANA');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Banana');
    });

    it('returns empty array when no match found', () => {
      const results = searchTerms('zzzzz');
      expect(results).toHaveLength(0);
    });

    it('handles whitespace-only query as empty', () => {
      const results = searchTerms('   ');
      expect(results).toHaveLength(3);
    });
  });

  describe('sortTerms', () => {
    const unsortedTerms = [
      { id: '1', name: 'Cherry', scope: 'Team', translationDE: 'Kirsche', keepAsIs: true },
      { id: '2', name: 'Apple', scope: 'Global', translationDE: 'Apfel', keepAsIs: false },
      { id: '3', name: 'Banana', scope: 'Project', translationDE: 'Banane', keepAsIs: false },
    ];

    it('sorts by name ascending', () => {
      const sorted = sortTerms(unsortedTerms, 'name', SORT_DIRECTIONS.ASC);
      expect(sorted[0].name).toBe('Apple');
      expect(sorted[1].name).toBe('Banana');
      expect(sorted[2].name).toBe('Cherry');
    });

    it('sorts by name descending', () => {
      const sorted = sortTerms(unsortedTerms, 'name', SORT_DIRECTIONS.DESC);
      expect(sorted[0].name).toBe('Cherry');
      expect(sorted[1].name).toBe('Banana');
      expect(sorted[2].name).toBe('Apple');
    });

    it('sorts by scope ascending', () => {
      const sorted = sortTerms(unsortedTerms, 'scope', SORT_DIRECTIONS.ASC);
      expect(sorted[0].scope).toBe('Global');
      expect(sorted[1].scope).toBe('Project');
      expect(sorted[2].scope).toBe('Team');
    });

    it('sorts by boolean field (keepAsIs) ascending', () => {
      const sorted = sortTerms(unsortedTerms, 'keepAsIs', SORT_DIRECTIONS.ASC);
      expect(sorted[0].keepAsIs).toBe(false);
      expect(sorted[2].keepAsIs).toBe(true);
    });

    it('sorts by boolean field (keepAsIs) descending', () => {
      const sorted = sortTerms(unsortedTerms, 'keepAsIs', SORT_DIRECTIONS.DESC);
      expect(sorted[0].keepAsIs).toBe(true);
    });

    it('returns empty array for non-array input', () => {
      const sorted = sortTerms(null, 'name', SORT_DIRECTIONS.ASC);
      expect(sorted).toEqual([]);
    });

    it('returns a copy when no column is specified', () => {
      const sorted = sortTerms(unsortedTerms, '', SORT_DIRECTIONS.ASC);
      expect(sorted).toHaveLength(3);
      expect(sorted).not.toBe(unsortedTerms);
    });

    it('does not mutate the original array', () => {
      const original = [...unsortedTerms];
      sortTerms(unsortedTerms, 'name', SORT_DIRECTIONS.ASC);
      expect(unsortedTerms[0].name).toBe(original[0].name);
    });

    it('handles null values in fields', () => {
      const termsWithNull = [
        { id: '1', name: 'Alpha', notes: null },
        { id: '2', name: 'Beta', notes: 'Some note' },
        { id: '3', name: 'Gamma', notes: '' },
      ];
      const sorted = sortTerms(termsWithNull, 'notes', SORT_DIRECTIONS.ASC);
      expect(sorted).toHaveLength(3);
    });
  });

  describe('paginateTerms', () => {
    let manyTerms;

    beforeEach(() => {
      manyTerms = Array.from({ length: 25 }, (_, i) => ({
        id: `term-${i}`,
        name: `Term ${String(i).padStart(2, '0')}`,
        scope: 'Global',
      }));
    });

    it('returns first page with correct items', () => {
      const result = paginateTerms(manyTerms, 1, 10);
      expect(result.items).toHaveLength(10);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(result.totalPages).toBe(3);
      expect(result.totalItems).toBe(25);
    });

    it('returns second page with correct items', () => {
      const result = paginateTerms(manyTerms, 2, 10);
      expect(result.items).toHaveLength(10);
      expect(result.page).toBe(2);
      expect(result.items[0].name).toBe('Term 10');
    });

    it('returns last page with remaining items', () => {
      const result = paginateTerms(manyTerms, 3, 10);
      expect(result.items).toHaveLength(5);
      expect(result.page).toBe(3);
    });

    it('clamps page to valid range when too high', () => {
      const result = paginateTerms(manyTerms, 100, 10);
      expect(result.page).toBe(3);
      expect(result.items).toHaveLength(5);
    });

    it('clamps page to 1 when too low', () => {
      const result = paginateTerms(manyTerms, 0, 10);
      expect(result.page).toBe(1);
    });

    it('handles empty array', () => {
      const result = paginateTerms([], 1, 10);
      expect(result.items).toHaveLength(0);
      expect(result.totalPages).toBe(1);
      expect(result.totalItems).toBe(0);
    });

    it('handles non-array input', () => {
      const result = paginateTerms(null, 1, 10);
      expect(result.items).toEqual([]);
      expect(result.totalPages).toBe(0);
      expect(result.totalItems).toBe(0);
    });

    it('uses default page size when not specified', () => {
      const result = paginateTerms(manyTerms, 1);
      expect(result.items).toHaveLength(10);
      expect(result.pageSize).toBe(10);
    });
  });

  describe('importTerms', () => {
    it('imports valid terms successfully', () => {
      const termsToImport = [
        {
          name: 'Import1',
          scope: 'Global',
          translationDE: 'DE1',
          translationES: 'ES1',
          keepAsIs: false,
          notes: '',
        },
        {
          name: 'Import2',
          scope: 'Project',
          translationDE: 'DE2',
          translationES: '',
          keepAsIs: false,
          notes: 'Note',
        },
      ];

      const result = importTerms(termsToImport);
      expect(result.status).toBe('success');
      expect(result.imported).toHaveLength(2);
      expect(result.skipped).toBe(0);
      expect(result.errors).toHaveLength(0);
      expect(getTerms()).toHaveLength(2);
    });

    it('skips invalid terms and reports errors', () => {
      const termsToImport = [
        {
          name: 'Valid',
          scope: 'Global',
          translationDE: 'DE',
          translationES: '',
          keepAsIs: false,
          notes: '',
        },
        {
          name: '',
          scope: 'Global',
          translationDE: 'DE',
          translationES: '',
          keepAsIs: false,
          notes: '',
        },
      ];

      const result = importTerms(termsToImport);
      expect(result.status).toBe('success');
      expect(result.imported).toHaveLength(1);
      expect(result.skipped).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].row).toBe(2);
    });

    it('skips duplicate terms within import batch', () => {
      const termsToImport = [
        {
          name: 'Dup',
          scope: 'Global',
          translationDE: 'DE1',
          translationES: '',
          keepAsIs: false,
          notes: '',
        },
        {
          name: 'Dup',
          scope: 'Project',
          translationDE: 'DE2',
          translationES: '',
          keepAsIs: false,
          notes: '',
        },
      ];

      const result = importTerms(termsToImport);
      expect(result.imported).toHaveLength(1);
      expect(result.skipped).toBe(1);
      expect(result.errors[0].message).toContain('Duplicate');
    });

    it('skips terms that duplicate existing terms', () => {
      addTerm({
        name: 'Existing',
        scope: 'Global',
        translationDE: 'DE',
        translationES: '',
        keepAsIs: false,
        notes: '',
      });

      const result = importTerms([
        {
          name: 'Existing',
          scope: 'Project',
          translationDE: 'DE2',
          translationES: '',
          keepAsIs: false,
          notes: '',
        },
      ]);
      expect(result.imported).toHaveLength(0);
      expect(result.skipped).toBe(1);
      expect(result.status).toBe('error');
    });

    it('returns error for empty array', () => {
      const result = importTerms([]);
      expect(result.status).toBe('error');
      expect(result.message).toContain('No terms to import');
    });

    it('returns error for non-array input', () => {
      const result = importTerms(null);
      expect(result.status).toBe('error');
      expect(result.message).toContain('No terms to import');
    });

    it('persists imported terms to localStorage', () => {
      importTerms([
        {
          name: 'Persisted',
          scope: 'Global',
          translationDE: 'DE',
          translationES: '',
          keepAsIs: false,
          notes: '',
        },
      ]);

      const raw = localStorage.getItem('glossaryTerms_v1');
      const parsed = JSON.parse(raw);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].name).toBe('Persisted');
    });

    it('includes count in success message', () => {
      const result = importTerms([
        {
          name: 'Count1',
          scope: 'Global',
          translationDE: 'DE',
          translationES: '',
          keepAsIs: false,
          notes: '',
        },
        {
          name: 'Count2',
          scope: 'Global',
          translationDE: 'DE',
          translationES: '',
          keepAsIs: false,
          notes: '',
        },
      ]);
      expect(result.message).toContain('Imported 2 term(s)');
    });

    it('includes skipped count in success message when some are skipped', () => {
      const result = importTerms([
        {
          name: 'Good',
          scope: 'Global',
          translationDE: 'DE',
          translationES: '',
          keepAsIs: false,
          notes: '',
        },
        {
          name: '',
          scope: 'Global',
          translationDE: 'DE',
          translationES: '',
          keepAsIs: false,
          notes: '',
        },
      ]);
      expect(result.message).toContain('skipped 1');
    });
  });

  describe('exportTerms', () => {
    it('exports terms as a Blob', () => {
      addTerm({
        name: 'ExportTerm',
        scope: 'Global',
        translationDE: 'DE',
        translationES: 'ES',
        keepAsIs: false,
        notes: 'Export note',
      });

      const blob = exportTerms();
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
    });

    it('exports empty glossary without error', () => {
      loadFromLocalStorage();
      const blob = exportTerms();
      expect(blob).toBeInstanceOf(Blob);
    });
  });

  describe('MAX_TERMS limit', () => {
    it('returns error when maximum terms limit is reached', () => {
      // Directly populate the cache via import to avoid adding one by one
      const bulkTerms = Array.from({ length: MAX_TERMS }, (_, i) => ({
        name: `BulkTerm${i}`,
        scope: 'Global',
        translationDE: `DE${i}`,
        translationES: '',
        keepAsIs: false,
        notes: '',
      }));

      importTerms(bulkTerms);
      expect(getTerms()).toHaveLength(MAX_TERMS);

      const result = addTerm({
        name: 'OverLimit',
        scope: 'Global',
        translationDE: 'DE',
        translationES: '',
        keepAsIs: false,
        notes: '',
      });
      expect(result.status).toBe('error');
      expect(result.message).toContain('Maximum number of terms');
    });
  });

  describe('integration: add, search, sort, paginate', () => {
    beforeEach(() => {
      addTerm({
        name: 'Zebra',
        scope: 'Global',
        translationDE: 'Zebra',
        translationES: 'Cebra',
        keepAsIs: false,
        notes: '',
      });
      addTerm({
        name: 'Apple',
        scope: 'Project',
        translationDE: 'Apfel',
        translationES: 'Manzana',
        keepAsIs: false,
        notes: 'Fruit',
      });
      addTerm({
        name: 'Mango',
        scope: 'Team',
        translationDE: 'Mango',
        translationES: 'Mango',
        keepAsIs: true,
        notes: 'Tropical',
      });
    });

    it('searches, sorts, and paginates correctly', () => {
      // Search for terms containing 'a'
      const searched = searchTerms('a');
      expect(searched.length).toBeGreaterThanOrEqual(2);

      // Sort by name ascending
      const sorted = sortTerms(searched, 'name', SORT_DIRECTIONS.ASC);
      expect(sorted[0].name).toBe('Apple');

      // Paginate
      const paginated = paginateTerms(sorted, 1, 2);
      expect(paginated.items).toHaveLength(2);
      expect(paginated.totalItems).toBe(sorted.length);
    });
  });
});