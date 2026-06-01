import React, { useState, useCallback } from 'react';
import { NotificationProvider, useNotificationContext } from './context/NotificationContext.jsx';
import { useGlossary } from './hooks/useGlossary.js';
import { SearchBar } from './components/SearchBar.jsx';
import { GlossaryTable } from './components/GlossaryTable.jsx';
import { Pagination } from './components/Pagination.jsx';
import { TermModal } from './components/TermModal.jsx';
import { DeleteModal } from './components/DeleteModal.jsx';
import { ImportExcelModal } from './components/ImportExcelModal.jsx';
import { Snackbar } from './components/Snackbar.jsx';

/**
 * Inner application component that uses the glossary hook and notification context.
 * @returns {React.ReactElement} The main application layout
 */
function AppContent() {
  const {
    terms,
    loading,
    searchQuery,
    sortColumn,
    sortDirection,
    currentPage,
    totalPages,
    totalItems,
    addTerm,
    editTerm,
    removeTerm,
    handleSearch,
    handleSort,
    handlePageChange,
    handleImportData,
    handleExport,
  } = useGlossary();

  const { showNotification } = useNotificationContext();

  const [isTermModalOpen, setIsTermModalOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingTerm, setDeletingTerm] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  /**
   * Opens the add term modal.
   */
  const handleAddClick = useCallback(() => {
    setEditingTerm(null);
    setIsTermModalOpen(true);
  }, []);

  /**
   * Opens the edit term modal with the selected term.
   * @param {object} term - The term to edit
   */
  const handleEditClick = useCallback((term) => {
    setEditingTerm(term);
    setIsTermModalOpen(true);
  }, []);

  /**
   * Closes the term modal.
   */
  const handleTermModalClose = useCallback(() => {
    setIsTermModalOpen(false);
    setEditingTerm(null);
  }, []);

  /**
   * Handles saving a term (add or edit).
   * @param {object} termData - The term data to save
   */
  const handleTermSave = useCallback(async (termData) => {
    if (editingTerm) {
      const result = await editTerm(editingTerm.id, termData);
      if (result.status === 'success') {
        setIsTermModalOpen(false);
        setEditingTerm(null);
      }
    } else {
      const result = await addTerm(termData);
      if (result.status === 'success') {
        setIsTermModalOpen(false);
        setEditingTerm(null);
      }
    }
  }, [editingTerm, editTerm, addTerm]);

  /**
   * Opens the delete confirmation modal.
   * @param {object} term - The term to delete
   */
  const handleDeleteClick = useCallback((term) => {
    setDeletingTerm(term);
    setIsDeleteModalOpen(true);
  }, []);

  /**
   * Confirms deletion of the selected term.
   */
  const handleDeleteConfirm = useCallback(async () => {
    if (deletingTerm) {
      await removeTerm(deletingTerm.id);
      setIsDeleteModalOpen(false);
      setDeletingTerm(null);
    }
  }, [deletingTerm, removeTerm]);

  /**
   * Cancels deletion and closes the delete modal.
   */
  const handleDeleteCancel = useCallback(() => {
    setIsDeleteModalOpen(false);
    setDeletingTerm(null);
  }, []);

  /**
   * Opens the import modal.
   */
  const handleImportClick = useCallback(() => {
    setIsImportModalOpen(true);
  }, []);

  /**
   * Closes the import modal.
   */
  const handleImportClose = useCallback(() => {
    setIsImportModalOpen(false);
  }, []);

  /**
   * Handles importing parsed terms from the import modal.
   * @param {Array<object>} parsedTerms - Array of parsed term data
   */
  const handleImportConfirm = useCallback(async (parsedTerms) => {
    const result = await handleImportData(parsedTerms);
    if (result.status === 'success') {
      setIsImportModalOpen(false);
    }
    return result;
  }, [handleImportData]);

  /**
   * Handles exporting glossary terms.
   */
  const handleExportClick = useCallback(async () => {
    await handleExport();
  }, [handleExport]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Glossary Management
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your glossary terms, translations, and definitions.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleImportClick}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                Import
              </button>
              <button
                type="button"
                onClick={handleExportClick}
                disabled={loading}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Export
              </button>
              <button
                type="button"
                onClick={handleAddClick}
                className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Term
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <SearchBar value={searchQuery} onSearch={handleSearch} />
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="mb-4 flex items-center justify-center gap-2 text-sm text-gray-500">
            <svg
              className="h-5 w-5 animate-spin text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </div>
        )}

        {/* Glossary Table */}
        <GlossaryTable
          terms={terms}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={handlePageChange}
        />

        {/* Term Modal (Add/Edit) */}
        <TermModal
          isOpen={isTermModalOpen}
          term={editingTerm}
          existingTerms={terms}
          onSave={handleTermSave}
          onClose={handleTermModalClose}
        />

        {/* Delete Confirmation Modal */}
        <DeleteModal
          isOpen={isDeleteModalOpen}
          term={deletingTerm}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />

        {/* Import Excel Modal */}
        <ImportExcelModal
          isOpen={isImportModalOpen}
          onImport={handleImportConfirm}
          onClose={handleImportClose}
        />

        {/* Snackbar Notifications */}
        <Snackbar />
      </div>
    </div>
  );
}

/**
 * Root application component.
 * Wraps the app content in NotificationProvider for global notification state.
 * @returns {React.ReactElement} The root application element
 */
function App() {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
}

export default App;