import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getGlossaryTerms,
  createGlossaryTerm,
  updateGlossaryTerm,
  deleteGlossaryTerm,
  importGlossaryTerms,
  exportGlossaryTerms,
} from './mockApi.js';
import { _resetForTesting, loadFromLocalStorage, addTerm, getTerms } from './glossaryRepository.js';
import { SORT_DIRECTIONS } from '../constants.js';

describe('mockApi', () => {
  beforeEach(() => {
    _resetForTesting();
    localStorage.clear();
    loadFromLocalStorage();
  });

  describe('getGlossaryTerms', () => {
    it('returns a promise that resolves with success status', async () => {
      const result = await getGlossaryTerms();
      expect(result).toBeDefined();
      expect(result.status).toBe('success');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('returns empty data when no terms exist', async () => {
      const result = await getGlossaryTerms();
      expect(result.status).toBe('success');
      expect(result.data).toEqual([]);
    });

    it('returns all terms when no options are provided', async () => {
      addTerm({
        name: 'ApiTerm1',
        scope: 'Global',
        translationDE: 'DE1',
        translationES: '',
        keepAsIs: false,
        notes: '',
      });
      addTerm({
        name: 'ApiTerm2',
        scope: 'Project',
        translationDE: 'DE2',
        translationES: '',
        keepAsIs: false,
        notes: '',
      });

      const result = await getGlossaryTerms();
      expect(result.status).toBe('success');
      expect(result.data).toHaveLength(2);
      expect(result.totalItems).toBe(2);
    });

    it('filters terms by search query', async () => {
      addTerm({
        name: 'Apple',
        scope: 'Global',
        translationDE: 'Apfel',
        translationES: '',
        keepAsIs: false,
        notes: '',
      });
      addTerm({
        name: 'Banana',
        scope: 'Project',
        translationDE: 'Banane',
        translationES: '',
        keepAsIs: false,
        notes: '',
      });

      const result = await getGlossaryTerms({ query: 'Apple' });
      expect(result.status).toBe('success');
      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Apple');
    });

    it('sorts terms by column and direction', async () => {
      addTerm({
        name: 'Zebra',
        scope: 'Global',
        translationDE: 'Zebra',
        translationES: '',
        keepAsIs: false,
        notes: '',
      });
      addTerm({
        name: 'Alpha',
        scope: 'Global',
        translationDE: 'Alpha',
        translationES: '',
        keepAsIs: false,
        notes: '',
      });

      const result = await getGlossaryTerms({
        sortColumn: 'name',
        sortDirection: SORT_DIRECTIONS.ASC,
      });
      expect(result.status).toBe('success');
      expect(result.data[0].name).toBe('Alpha');
      expect(result.data[1].name).toBe('Zebra');
    });

    it('sorts terms descending', async () => {
      addTerm({
        name: 'Alpha',
        scope: 'Global',
        translationDE: 'Alpha',
        translationES: '',
        keepAsIs: false,
        notes: '',
      });
      addTerm({
        name: 'Zebra',
        scope: 'Global',
        translationDE: 'Zebra',
        translationES: '',
        keepAsIs: false,
        notes: '',
      });

      const result = await getGlossaryTerms({
        sortColumn: 'name',
        sortDirection: SORT_DIRECTIONS.DESC,
      });
      expect(result.status).toBe('success');
      expect(result.data[0].name).toBe('Zebra');
      expect(result.data[1].name).toBe('Alpha');
    });

    it('paginates results correctly', async () => {
      for (let i = 0; i < 15; i++) {
        addTerm({
          name: `PagTerm${String(i).padStart(2, '0')}`,
          scope: 'Global',
          translationDE: `DE${i}`,
          translationES: '',
          keepAsIs: false,
          notes: '',
        });
      }

      const result = await getGlossaryTerms({ page: 1, pageSize: 10 });
      expect(result.status).toBe('success');
      expect(result.data).toHaveLength(10);
      expect(result.totalPages).toBe(2);
      expect(result.totalItems).toBe(15);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
    });

    it('returns second page of paginated results', async () => {
      for (let i = 0; i < 15; i++) {
        addTerm({
          name: `PagTerm${String(i).padStart(2, '0')}`,
          scope: 'Global',
          translationDE: `DE${i}`,
          translationES: '',
          keepAsIs: false,
          notes: '',
        });
      }

      const result = await getGlossaryTerms({ page: 2, pageSize: 10 });
      expect(result.status).toBe('success');
      expect(result.data).toHaveLength(5);
      expect(result.page).toBe(2);
    });

    it('combines search, sort, and pagination', async () => {
      addTerm({
        name: 'Zebra',
        scope: 'Global',
        translationDE: 'Zebra',
        translationES: '',
        keepAsIs: false,
        notes: 'animal',
      });
      addTerm({
        name: 'Apple',
        scope: 'Global',
        translationDE: 'Apfel',
        translationES: '',
        keepAsIs: false,
        notes: 'fruit',
      });
      addTerm({
        name: 'Avocado',
        scope: 'Project',
        translationDE: 'Avocado',
        translationES: '',
        keepAsIs: false,
        notes: 'fruit',
      });

      const result = await getGlossaryTerms({
        query: 'a',
        sortColumn: 'name',
        sortDirection: SORT_DIRECTIONS.ASC,
        page: 1,
        pageSize: 2,
      });
      expect(result.status).toBe('success');
      expect(result.data).toHaveLength(2);
      expect(result.data[0].name).toBe('Apple');
      expect(result.data[1].name).toBe('Avocado');
    });
  });

  describe('createGlossaryTerm', () => {
    it('returns a promise that resolves', async () => {
      const result = await createGlossaryTerm({
        name: 'NewTerm',
        scope: 'Global',
        translationDE: 'Neu',
        translationES: '',
        keepAsIs: false,
        notes: '',
      });
      expect(result).toBeDefined();
    });

    it('creates a valid term successfully', async () => {
      const result = await createGlossaryTerm({
        name: 'Created',
        scope: 'Global',
        translationDE: 'Erstellt',
        translationES: 'Creado',
        keepAsIs: false,
        notes: 'A note',
      });
      expect(result.status).toBe('success');
      expect(result.term).toBeDefined();
      expect(result.term.name).toBe('Created');
      expect(result.term.scope).toBe('Global');
      expect(result.term.translationDE).toBe('Erstellt');
      expect(result.term.translationES).toBe('Creado');
      expect(result.term.id).toBeDefined();
    });

    it('returns error for missing name', async () => {
      const result = await createGlossaryTerm({
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

    it('returns error for missing scope', async () => {
      const result = await createGlossaryTerm({
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

    it('returns error for invalid scope', async () => {
      const result = await createGlossaryTerm({
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

    it('returns error for no translation and keepAsIs false', async () => {
      const result = await createGlossaryTerm({
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

    it('returns error for duplicate term name', async () => {
      await createGlossaryTerm({
        name: 'Duplicate',
        scope: 'Global',
        translationDE: 'DE',
        translationES: '',
        keepAsIs: false,
        notes: '',
      });

      const result = await createGlossaryTerm({
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

    it('persists created term to repository', async () => {
      await createGlossaryTerm({
        name: 'Persisted',
        scope: 'Global',
        translationDE: 'DE',
        translationES: '',
        keepAsIs: false,
        notes: '',
      });

      const terms = getTerms();
      expect(terms).toHaveLength(1);
      expect(terms[0].name).toBe('Persisted');
    });
  });

  describe('updateGlossaryTerm', () => {
    it('returns a promise that resolves', async () => {
      const createResult = await createGlossaryTerm({
        name: 'ToUpdate',
        scope: 'Global',
        translationDE: 'DE',
        translationES: '',
        keepAsIs: false,
        notes: '',
      });

      const result = await updateGlossaryTerm(createResult.term.id, {
        name: 'Updated',
      });
      expect(result).toBeDefined();
    });

    it('updates an existing term successfully', async () => {
      const createResult = await createGlossaryTerm({
        name: 'Original',
        scope: 'Global',
        translationDE: 'OrigDE',
        translationES: '',
        keepAsIs: false,
        notes: '',
      });

      const result = await updateGlossaryTerm(createResult.term.id, {
        name: 'Updated',
        translationDE: 'UpdatedDE',
        notes: 'Updated notes',
      });
      expect(result.status).toBe('success');
      expect(result.term.name).toBe('Updated');
      expect(result.term.translationDE).toBe('UpdatedDE');
      expect(result.term.notes).toBe('Updated notes');
      expect(result.term.scope).toBe('Global');
    });

    it('returns error for non-existent term id', async () => {
      const result = await updateGlossaryTerm('nonexistent-id', {
        name: 'Test',
      });
      expect(result.status).toBe('error');
      expect(result.message).toContain('Term not found');
    });

    it('returns error for empty id', async () => {
      const result = await updateGlossaryTerm('', { name: 'Test' });
      expect(result.status).toBe('error');
      expect(result.message).toContain('Term id is required');
    });

    it('returns error for invalid update data', async () => {
      const createResult = await createGlossaryTerm({
        name: 'ValidTerm',
        scope: 'Global',
        translationDE: 'DE',
        translationES: '',
        keepAsIs: false,
        notes: '',
      });

      const result = await updateGlossaryTerm(createResult.term.id, {
        name: '',
      });
      expect(result.status).toBe('error');
      expect(result.message).toContain('Name is required');
    });

    it('returns error for duplicate name on update', async () => {
      await createGlossaryTerm({
        name: 'First',
        scope: 'Global',
        translationDE: 'DE1',
        translationES: '',
        keepAsIs: false,
        notes: '',
      });
      const secondResult = await createGlossaryTerm({
        name: 'Second',
        scope: 'Global',
        translationDE: 'DE2',
        translationES: '',
        keepAsIs: false,
        notes: '',
      });

      const result = await updateGlossaryTerm(secondResult.term.id, {
        name: 'First',
      });
      expect(result.status).toBe('error');
      expect(result.message).toContain('Duplicate term name');
    });

    it('updates the updatedAt timestamp', async () => {
      const createResult = await createGlossaryTerm({
        name: 'TimeTest',
        scope: 'Global',
        translationDE: 'DE',
        translationES: '',
        keepAsIs: false,
        notes: '',
      });
      const originalUpdatedAt = createResult.term.updatedAt;

      const result = await updateGlossaryTerm(createResult.term.id, {
        notes: 'new note',
      });
      expect(result.status).toBe('success');
      expect(result.term.updatedAt).not.toBe(originalUpdatedAt);
    });
  });

  describe('deleteGlossaryTerm', () => {
    it('returns a promise that resolves', async () => {
      const createResult = await createGlossaryTerm({
        name: 'ToDelete',
        scope: 'Global',
        translationDE: 'DE',
        translationES: '',
        keepAsIs: false,
        notes: '',
      });

      const result = await deleteGlossaryTerm(createResult.term.id);
      expect(result).toBeDefined();
    });

    it('deletes an existing term successfully', async () => {
      const createResult = await createGlossaryTerm({
        name: 'ToDelete',
        scope: 'Global',
        translationDE: 'DE',
        translationES: '',
        keepAsIs: false,
        notes: '',
      });

      const result = await deleteGlossaryTerm(createResult.term.id);
      expect(result.status).toBe('success');

      const terms = getTerms();
      expect(terms).toHaveLength(0);
    });

    it('returns error for non-existent term id', async () => {
      const result = await deleteGlossaryTerm('nonexistent-id');
      expect(result.status).toBe('error');
      expect(result.message).toContain('Term not found');
    });

    it('returns error for empty id', async () => {
      const result = await deleteGlossaryTerm('');
      expect(result.status).toBe('error');
      expect(result.message).toContain('Term id is required');
    });

    it('persists deletion to repository', async () => {
      const createResult = await createGlossaryTerm({
        name: 'DeletePersist',
        scope: 'Global',
        translationDE: 'DE',
        translationES: '',
        keepAsIs: false,
        notes: '',
      });

      await deleteGlossaryTerm(createResult.term.id);

      const raw = localStorage.getItem('glossaryTerms_v1');
      const parsed = JSON.parse(raw);
      expect(parsed).toHaveLength(0);
    });
  });

  describe('importGlossaryTerms', () => {
    it('returns a promise that resolves', async () => {
      const result = await importGlossaryTerms([
        {
          name: 'Import1',
          scope: 'Global',
          translationDE: 'DE1',
          translationES: '',
          keepAsIs: false,
          notes: '',
        },
      ]);
      expect(result).toBeDefined();
    });

    it('imports valid terms successfully', async () => {
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

      const result = await importGlossaryTerms(termsToImport);
      expect(result.status).toBe('success');
      expect(result.imported).toHaveLength(2);
      expect(result.skipped).toBe(0);
      expect(result.errors).toHaveLength(0);
      expect(result.message).toContain('Imported 2 term(s)');
    });

    it('skips invalid terms and reports errors', async () => {
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

      const result = await importGlossaryTerms(termsToImport);
      expect(result.status).toBe('success');
      expect(result.imported).toHaveLength(1);
      expect(result.skipped).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].row).toBe(2);
    });

    it('skips duplicate terms within import batch', async () => {
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

      const result = await importGlossaryTerms(termsToImport);
      expect(result.imported).toHaveLength(1);
      expect(result.skipped).toBe(1);
      expect(result.errors[0].message).toContain('Duplicate');
    });

    it('skips terms that duplicate existing terms', async () => {
      await createGlossaryTerm({
        name: 'Existing',
        scope: 'Global',
        translationDE: 'DE',
        translationES: '',
        keepAsIs: false,
        notes: '',
      });

      const result = await importGlossaryTerms([
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

    it('returns error for empty array', async () => {
      const result = await importGlossaryTerms([]);
      expect(result.status).toBe('error');
      expect(result.message).toContain('No terms to import');
    });

    it('returns error for null input', async () => {
      const result = await importGlossaryTerms(null);
      expect(result.status).toBe('error');
      expect(result.message).toContain('No terms to import');
    });

    it('persists imported terms to repository', async () => {
      await importGlossaryTerms([
        {
          name: 'Persisted',
          scope: 'Global',
          translationDE: 'DE',
          translationES: '',
          keepAsIs: false,
          notes: '',
        },
      ]);

      const terms = getTerms();
      expect(terms).toHaveLength(1);
      expect(terms[0].name).toBe('Persisted');
    });
  });

  describe('exportGlossaryTerms', () => {
    it('returns a promise that resolves', async () => {
      const result = await exportGlossaryTerms();
      expect(result).toBeDefined();
    });

    it('exports terms as a Blob successfully', async () => {
      await createGlossaryTerm({
        name: 'ExportTerm',
        scope: 'Global',
        translationDE: 'DE',
        translationES: 'ES',
        keepAsIs: false,
        notes: 'Export note',
      });

      const result = await exportGlossaryTerms();
      expect(result.status).toBe('success');
      expect(result.data).toBeInstanceOf(Blob);
      expect(result.data.type).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
    });

    it('exports empty glossary without error', async () => {
      const result = await exportGlossaryTerms();
      expect(result.status).toBe('success');
      expect(result.data).toBeInstanceOf(Blob);
    });
  });

  describe('all functions return promises', () => {
    it('getGlossaryTerms returns a promise', () => {
      const result = getGlossaryTerms();
      expect(result).toBeInstanceOf(Promise);
    });

    it('createGlossaryTerm returns a promise', () => {
      const result = createGlossaryTerm({
        name: 'PromiseTest',
        scope: 'Global',
        translationDE: 'DE',
        translationES: '',
        keepAsIs: false,
        notes: '',
      });
      expect(result).toBeInstanceOf(Promise);
    });

    it('updateGlossaryTerm returns a promise', () => {
      const result = updateGlossaryTerm('some-id', { name: 'Test' });
      expect(result).toBeInstanceOf(Promise);
    });

    it('deleteGlossaryTerm returns a promise', () => {
      const result = deleteGlossaryTerm('some-id');
      expect(result).toBeInstanceOf(Promise);
    });

    it('importGlossaryTerms returns a promise', () => {
      const result = importGlossaryTerms([]);
      expect(result).toBeInstanceOf(Promise);
    });

    it('exportGlossaryTerms returns a promise', () => {
      const result = exportGlossaryTerms();
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('integration: create, fetch, update, delete flow', () => {
    it('performs full CRUD lifecycle correctly', async () => {
      // Create
      const createResult = await createGlossaryTerm({
        name: 'Lifecycle',
        scope: 'Global',
        translationDE: 'Lebenszyklus',
        translationES: 'Ciclo de vida',
        keepAsIs: false,
        notes: 'Test lifecycle',
      });
      expect(createResult.status).toBe('success');
      const termId = createResult.term.id;

      // Fetch
      const fetchResult = await getGlossaryTerms();
      expect(fetchResult.status).toBe('success');
      expect(fetchResult.data).toHaveLength(1);
      expect(fetchResult.data[0].name).toBe('Lifecycle');

      // Update
      const updateResult = await updateGlossaryTerm(termId, {
        name: 'LifecycleUpdated',
        notes: 'Updated lifecycle',
      });
      expect(updateResult.status).toBe('success');
      expect(updateResult.term.name).toBe('LifecycleUpdated');

      // Verify update via fetch
      const fetchAfterUpdate = await getGlossaryTerms();
      expect(fetchAfterUpdate.data[0].name).toBe('LifecycleUpdated');

      // Delete
      const deleteResult = await deleteGlossaryTerm(termId);
      expect(deleteResult.status).toBe('success');

      // Verify deletion via fetch
      const fetchAfterDelete = await getGlossaryTerms();
      expect(fetchAfterDelete.data).toHaveLength(0);
    });
  });
});