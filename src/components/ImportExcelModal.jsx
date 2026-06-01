import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { ExcelUploadZone } from './ExcelUploadZone.jsx';
import { parseFile } from '../services/excelService.js';
import { MAX_PREVIEW_ROWS } from '../constants.js';

/**
 * Modal for importing glossary terms from Excel/CSV files.
 * Contains ExcelUploadZone for file selection, then displays a preview table
 * of up to 50 parsed rows. User can confirm or cancel import.
 * Shows loading state during parsing and import.
 * Calls onImport callback with parsed terms array.
 * @param {object} props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {Function} props.onImport - Callback fired with parsed terms array on confirm
 * @param {Function} props.onClose - Callback fired when the modal is closed
 * @returns {React.ReactElement|null} The modal element or null if not open
 */
export function ImportExcelModal({ isOpen, onImport, onClose }) {
  const [parsedTerms, setParsedTerms] = useState([]);
  const [previewTerms, setPreviewTerms] = useState([]);
  const [parseError, setParseError] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [hasFile, setHasFile] = useState(false);

  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  /**
   * Resets modal state when opened or closed.
   */
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      setParsedTerms([]);
      setPreviewTerms([]);
      setParseError('');
      setIsParsing(false);
      setIsImporting(false);
      setHasFile(false);
    }
  }, [isOpen]);

  /**
   * Restores focus to the previously focused element when the modal closes.
   */
  useEffect(() => {
    if (!isOpen && previousFocusRef.current) {
      const el = previousFocusRef.current;
      previousFocusRef.current = null;
      if (el && typeof el.focus === 'function') {
        el.focus();
      }
    }
  }, [isOpen]);

  /**
   * Gets all focusable elements within the modal.
   * @returns {Array<HTMLElement>} Array of focusable elements
   */
  const getFocusableElements = useCallback(() => {
    if (!modalRef.current) {
      return [];
    }
    const selectors = 'button, input, [tabindex]:not([tabindex="-1"])';
    return Array.from(modalRef.current.querySelectorAll(selectors)).filter(
      (el) => !el.disabled && el.offsetParent !== null
    );
  }, []);

  /**
   * Handles keydown events for focus trapping and escape to close.
   * @param {React.KeyboardEvent<HTMLDivElement>} e - The keydown event
   */
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      if (!isImporting) {
        onClose();
      }
      return;
    }

    if (e.key === 'Tab') {
      const focusable = getFocusableElements();
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  }, [onClose, getFocusableElements, isImporting]);

  /**
   * Handles clicking the overlay backdrop to close the modal.
   * @param {React.MouseEvent<HTMLDivElement>} e - The click event
   */
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isImporting) {
      onClose();
    }
  };

  /**
   * Handles file selection from ExcelUploadZone.
   * Parses the file and populates the preview table.
   * @param {File} file - The selected file
   */
  const handleFileSelected = async (file) => {
    setIsParsing(true);
    setParseError('');
    setParsedTerms([]);
    setPreviewTerms([]);
    setHasFile(false);

    try {
      const result = await parseFile(file);

      if (result.status === 'error') {
        setParseError(result.message || 'Failed to parse file');
        setIsParsing(false);
        return;
      }

      const terms = result.data || [];
      if (terms.length === 0) {
        setParseError('The file contains no valid data rows');
        setIsParsing(false);
        return;
      }

      setParsedTerms(terms);
      setPreviewTerms(terms.slice(0, MAX_PREVIEW_ROWS));
      setHasFile(true);
    } catch (err) {
      setParseError(err.message || 'Failed to parse file');
    } finally {
      setIsParsing(false);
    }
  };

  /**
   * Handles clicking the confirm import button.
   */
  const handleConfirmImport = async () => {
    if (parsedTerms.length === 0) {
      return;
    }

    setIsImporting(true);
    try {
      await onImport(parsedTerms);
    } finally {
      setIsImporting(false);
    }
  };

  /**
   * Handles clicking the cancel button.
   */
  const handleCancel = () => {
    if (!isImporting) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  const totalRows = parsedTerms.length;
  const previewCount = previewTerms.length;
  const hasMoreRows = totalRows > MAX_PREVIEW_ROWS;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-modal-title"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={modalRef}
        className="flex w-full max-w-3xl flex-col rounded-lg bg-white shadow-xl"
        style={{ maxHeight: '90vh' }}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2
            id="import-modal-title"
            className="text-lg font-semibold text-gray-900"
          >
            Import Glossary Terms
          </h2>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isImporting}
            className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* File Upload Zone */}
          <ExcelUploadZone
            onFileSelected={handleFileSelected}
            disabled={isParsing || isImporting}
          />

          {/* Parsing Loading State */}
          {isParsing && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
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
              <span>Parsing file...</span>
            </div>
          )}

          {/* Parse Error */}
          {parseError && (
            <div className="mt-4 rounded-md bg-red-50 p-3" role="alert">
              <div className="flex items-start gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 flex-shrink-0 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm text-red-700">{parseError}</p>
              </div>
            </div>
          )}

          {/* Preview Table */}
          {hasFile && previewTerms.length > 0 && !isParsing && (
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">
                  Preview ({previewCount} of {totalRows} row{totalRows !== 1 ? 's' : ''})
                </p>
                {hasMoreRows && (
                  <p className="text-xs text-gray-500">
                    Showing first {MAX_PREVIEW_ROWS} rows
                  </p>
                )}
              </div>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200" role="table">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-semibold text-gray-700"
                      >
                        #
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-semibold text-gray-700"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-semibold text-gray-700"
                      >
                        Scope
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-semibold text-gray-700"
                      >
                        Translation (DE)
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-semibold text-gray-700"
                      >
                        Translation (ES)
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-semibold text-gray-700"
                      >
                        Keep As Is
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-semibold text-gray-700"
                      >
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {previewTerms.map((term, index) => (
                      <tr
                        key={index}
                        className="transition-colors hover:bg-gray-50"
                      >
                        <td className="whitespace-nowrap px-3 py-2 text-xs text-gray-500">
                          {index + 1}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-xs font-medium text-gray-900">
                          {term.name || '—'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-xs text-gray-700">
                          {term.scope ? (
                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                              {term.scope}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-xs text-gray-700">
                          {term.translationDE || '—'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-xs text-gray-700">
                          {term.translationES || '—'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-xs text-gray-700">
                          {term.keepAsIs ? (
                            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                              No
                            </span>
                          )}
                        </td>
                        <td
                          className="max-w-xs truncate px-3 py-2 text-xs text-gray-700"
                          title={term.notes || ''}
                        >
                          {term.notes || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isImporting}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={!hasFile || parsedTerms.length === 0 || isParsing || isImporting}
            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isImporting ? (
              <>
                <svg
                  className="mr-2 h-4 w-4 animate-spin"
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
                Importing...
              </>
            ) : (
              <>
                Import {totalRows > 0 ? `${totalRows} Term${totalRows !== 1 ? 's' : ''}` : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

ImportExcelModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onImport: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ImportExcelModal;