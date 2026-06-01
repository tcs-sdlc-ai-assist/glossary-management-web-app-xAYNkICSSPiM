import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getGlossaryTerms,
  createGlossaryTerm,
  updateGlossaryTerm,
  deleteGlossaryTerm,
  importGlossaryTerms,
  exportGlossaryTerms,
} from '../services/mockApi.js';
import { parseFile } from '../services/excelService.js';
import { loadFromLocalStorage } from '../services/glossaryRepository.js';
import { useDebounce } from './useDebounce.js';
import {
  PAGE_SIZE,
  SORT_DIRECTIONS,
  NOTIFICATION_TYPES,
  NOTIFICATION_DURATION,
  DEBOUNCE_DELAY,
} from '../constants.js';

/**
 * Central state management hook for glossary operations.
 * Manages terms array, search query, sort config, pagination state.
 * Provides handlers for CRUD, search, sort, paginate, import, and export.
 * @returns {object} State and action handlers for glossary management
 */
export function useGlossary() {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, DEBOUNCE_DELAY);

  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState(SORT_DIRECTIONS.ASC);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [notification, setNotification] = useState(null);

  /**
   * Shows a notification message that auto-dismisses.
   * @param {string} type - Notification type ('success' or 'error')
   * @param {string} message - Notification message
   */
  const showNotification = useCallback((type, message) => {
    setNotification({ type, message, id: Date.now() });
  }, []);

  /**
   * Dismisses the current notification.
   */
  const dismissNotification = useCallback(() => {
    setNotification(null);
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, NOTIFICATION_DURATION);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  /**
   * Fetches glossary terms with current search, sort, and pagination state.
   */
  const fetchTerms = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getGlossaryTerms({
        query: debouncedSearchQuery || undefined,
        sortColumn,
        sortDirection,
        page: currentPage,
        pageSize,
      });

      if (result.status === 'success') {
        setTerms(result.data || []);
        if (result.totalPages !== undefined) {
          setTotalPages(result.totalPages);
        }
        if (result.totalItems !== undefined) {
          setTotalItems(result.totalItems);
        }
      } else {
        setError(result.message || 'Failed to fetch terms');
        setTerms([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch terms');
      setTerms([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchQuery, sortColumn, sortDirection, currentPage, pageSize]);

  // Hydrate from localStorage on mount
  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  // Fetch terms whenever search, sort, or pagination changes
  useEffect(() => {
    fetchTerms();
  }, [fetchTerms]);

  // Reset to page 1 when search query or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, sortColumn, sortDirection]);

  /**
   * Adds a new glossary term.
   * @param {object} termData - The term data to add
   * @returns {Promise<object>} Result with status and term or error message
   */
  const addTerm = useCallback(async (termData) => {
    setLoading(true);
    try {
      const result = await createGlossaryTerm(termData);
      if (result.status === 'success') {
        showNotification(NOTIFICATION_TYPES.SUCCESS, `Term "${result.term.name}" added successfully`);
        await fetchTerms();
      } else {
        showNotification(NOTIFICATION_TYPES.ERROR, result.message || 'Failed to add term');
      }
      return result;
    } catch (err) {
      const message = err.message || 'Failed to add term';
      showNotification(NOTIFICATION_TYPES.ERROR, message);
      return { status: 'error', message };
    } finally {
      setLoading(false);
    }
  }, [fetchTerms, showNotification]);

  /**
   * Updates an existing glossary term.
   * @param {string} id - The term id to update
   * @param {object} updates - The fields to update
   * @returns {Promise<object>} Result with status and term or error message
   */
  const editTerm = useCallback(async (id, updates) => {
    setLoading(true);
    try {
      const result = await updateGlossaryTerm(id, updates);
      if (result.status === 'success') {
        showNotification(NOTIFICATION_TYPES.SUCCESS, `Term "${result.term.name}" updated successfully`);
        await fetchTerms();
      } else {
        showNotification(NOTIFICATION_TYPES.ERROR, result.message || 'Failed to update term');
      }
      return result;
    } catch (err) {
      const message = err.message || 'Failed to update term';
      showNotification(NOTIFICATION_TYPES.ERROR, message);
      return { status: 'error', message };
    } finally {
      setLoading(false);
    }
  }, [fetchTerms, showNotification]);

  /**
   * Deletes a glossary term by id.
   * @param {string} id - The term id to delete
   * @returns {Promise<object>} Result with status or error message
   */
  const removeTerm = useCallback(async (id) => {
    setLoading(true);
    try {
      const result = await deleteGlossaryTerm(id);
      if (result.status === 'success') {
        showNotification(NOTIFICATION_TYPES.SUCCESS, 'Term deleted successfully');
        await fetchTerms();
      } else {
        showNotification(NOTIFICATION_TYPES.ERROR, result.message || 'Failed to delete term');
      }
      return result;
    } catch (err) {
      const message = err.message || 'Failed to delete term';
      showNotification(NOTIFICATION_TYPES.ERROR, message);
      return { status: 'error', message };
    } finally {
      setLoading(false);
    }
  }, [fetchTerms, showNotification]);

  /**
   * Handles search query changes.
   * @param {string} query - The new search query
   */
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  /**
   * Handles sort column/direction changes.
   * @param {string} column - The column to sort by
   */
  const handleSort = useCallback((column) => {
    setSortColumn((prevColumn) => {
      if (prevColumn === column) {
        setSortDirection((prevDir) =>
          prevDir === SORT_DIRECTIONS.ASC ? SORT_DIRECTIONS.DESC : SORT_DIRECTIONS.ASC
        );
        return prevColumn;
      }
      setSortDirection(SORT_DIRECTIONS.ASC);
      return column;
    });
  }, []);

  /**
   * Handles page changes.
   * @param {number} page - The page number to navigate to
   */
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  /**
   * Imports glossary terms from a file.
   * @param {File} file - The file to import
   * @returns {Promise<object>} Result with status, imported terms, skipped count, and errors
   */
  const handleImport = useCallback(async (file) => {
    setLoading(true);
    try {
      const parseResult = await parseFile(file);

      if (parseResult.status === 'error') {
        showNotification(NOTIFICATION_TYPES.ERROR, parseResult.message || 'Failed to parse file');
        return parseResult;
      }

      const importResult = await importGlossaryTerms(parseResult.data);

      if (importResult.status === 'success') {
        showNotification(NOTIFICATION_TYPES.SUCCESS, importResult.message);
        await fetchTerms();
      } else {
        showNotification(NOTIFICATION_TYPES.ERROR, importResult.message || 'Failed to import terms');
      }

      return importResult;
    } catch (err) {
      const message = err.message || 'Failed to import terms';
      showNotification(NOTIFICATION_TYPES.ERROR, message);
      return { status: 'error', message, imported: [], skipped: 0, errors: [] };
    } finally {
      setLoading(false);
    }
  }, [fetchTerms, showNotification]);

  /**
   * Imports glossary terms from pre-parsed term data array.
   * @param {Array<object>} termDataArray - Array of term data to import
   * @returns {Promise<object>} Result with status, imported terms, skipped count, and errors
   */
  const handleImportData = useCallback(async (termDataArray) => {
    setLoading(true);
    try {
      const importResult = await importGlossaryTerms(termDataArray);

      if (importResult.status === 'success') {
        showNotification(NOTIFICATION_TYPES.SUCCESS, importResult.message);
        await fetchTerms();
      } else {
        showNotification(NOTIFICATION_TYPES.ERROR, importResult.message || 'Failed to import terms');
      }

      return importResult;
    } catch (err) {
      const message = err.message || 'Failed to import terms';
      showNotification(NOTIFICATION_TYPES.ERROR, message);
      return { status: 'error', message, imported: [], skipped: 0, errors: [] };
    } finally {
      setLoading(false);
    }
  }, [fetchTerms, showNotification]);

  /**
   * Exports all glossary terms to an XLSX file and triggers download.
   * @returns {Promise<object>} Result with status or error message
   */
  const handleExport = useCallback(async () => {
    setLoading(true);
    try {
      const result = await exportGlossaryTerms();

      if (result.status === 'success' && result.data) {
        const url = URL.createObjectURL(result.data);
        const link = document.createElement('a');
        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
        link.href = url;
        link.download = `glossary-export-${timestamp}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showNotification(NOTIFICATION_TYPES.SUCCESS, 'Glossary exported successfully');
      } else {
        showNotification(NOTIFICATION_TYPES.ERROR, result.message || 'Failed to export glossary');
      }

      return result;
    } catch (err) {
      const message = err.message || 'Failed to export glossary';
      showNotification(NOTIFICATION_TYPES.ERROR, message);
      return { status: 'error', message };
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  return {
    // State
    terms,
    loading,
    error,
    searchQuery,
    sortColumn,
    sortDirection,
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    notification,

    // Actions
    fetchTerms,
    addTerm,
    editTerm,
    removeTerm,
    handleSearch,
    handleSort,
    handlePageChange,
    handleImport,
    handleImportData,
    handleExport,
    showNotification,
    dismissNotification,
  };
}