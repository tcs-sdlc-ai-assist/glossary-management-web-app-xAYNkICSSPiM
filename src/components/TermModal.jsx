import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { SCOPE_OPTIONS } from '../constants.js';
import { validateTerm } from '../models/glossaryModel.js';

/**
 * Modal component for adding or editing a glossary term.
 * Contains form fields: name, scope, German translation, Spanish translation,
 * keep-as-is checkbox, and notes textarea.
 * Validates inputs on submit. Displays inline error messages.
 * Supports keyboard navigation and focus trapping for accessibility.
 * @param {object} props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {object|null} props.term - The term to edit (null for add mode)
 * @param {Array<object>} props.existingTerms - Array of existing terms for duplicate checking
 * @param {Function} props.onSave - Callback fired with term data on successful submit
 * @param {Function} props.onClose - Callback fired when the modal is closed
 * @returns {React.ReactElement|null} The modal element or null if not open
 */
export function TermModal({ isOpen, term, existingTerms, onSave, onClose }) {
  const isEditMode = Boolean(term);

  const [name, setName] = useState('');
  const [scope, setScope] = useState('');
  const [translationDE, setTranslationDE] = useState('');
  const [translationES, setTranslationES] = useState('');
  const [keepAsIs, setKeepAsIs] = useState(false);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  const modalRef = useRef(null);
  const nameInputRef = useRef(null);
  const previousFocusRef = useRef(null);

  /**
   * Populates form fields when the modal opens or the term changes.
   */
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;

      if (term) {
        setName(term.name || '');
        setScope(term.scope || '');
        setTranslationDE(term.translationDE || '');
        setTranslationES(term.translationES || '');
        setKeepAsIs(Boolean(term.keepAsIs));
        setNotes(term.notes || '');
      } else {
        setName('');
        setScope('');
        setTranslationDE('');
        setTranslationES('');
        setKeepAsIs(false);
        setNotes('');
      }
      setErrors({});
    }
  }, [isOpen, term]);

  /**
   * Focuses the name input when the modal opens.
   */
  useEffect(() => {
    if (isOpen && nameInputRef.current) {
      const timer = setTimeout(() => {
        nameInputRef.current.focus();
      }, 50);
      return () => clearTimeout(timer);
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
   * Checks if a term name is a duplicate among existing terms.
   * @param {string} termName - The name to check
   * @returns {boolean} True if duplicate
   */
  const checkDuplicate = useCallback((termName) => {
    if (!termName || !Array.isArray(existingTerms)) {
      return false;
    }
    const normalizedName = termName.trim().toLowerCase();
    const excludeId = term ? term.id : null;
    return existingTerms.some(
      (t) =>
        t.name.trim().toLowerCase() === normalizedName &&
        (excludeId === null || t.id !== excludeId)
    );
  }, [existingTerms, term]);

  /**
   * Validates the form and returns an errors object.
   * @returns {object} An object mapping field names to error messages
   */
  const validateForm = useCallback(() => {
    const formErrors = {};

    const termData = {
      name,
      scope,
      translationDE,
      translationES,
      keepAsIs,
      notes,
    };

    const validation = validateTerm(termData);
    if (!validation.valid) {
      for (const err of validation.errors) {
        if (err.includes('Name is required')) {
          formErrors.name = 'Name is required';
        }
        if (err.includes('Scope is required')) {
          formErrors.scope = 'Scope is required';
        }
        if (err.includes('Scope must be one of')) {
          formErrors.scope = err;
        }
        if (err.includes('At least one translation')) {
          formErrors.translation = err;
        }
      }
    }

    if (!formErrors.name && checkDuplicate(name)) {
      formErrors.name = 'A term with this name already exists';
    }

    return formErrors;
  }, [name, scope, translationDE, translationES, keepAsIs, notes, checkDuplicate]);

  /**
   * Handles form submission.
   * @param {React.FormEvent<HTMLFormElement>} e - The form submit event
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    const termData = {
      name: name.trim(),
      scope,
      translationDE: translationDE.trim(),
      translationES: translationES.trim(),
      keepAsIs,
      notes: notes.trim(),
    };

    onSave(termData);
  };

  /**
   * Handles clicking the overlay backdrop to close the modal.
   * @param {React.MouseEvent<HTMLDivElement>} e - The click event
   */
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  /**
   * Gets all focusable elements within the modal.
   * @returns {Array<HTMLElement>} Array of focusable elements
   */
  const getFocusableElements = useCallback(() => {
    if (!modalRef.current) {
      return [];
    }
    const selectors = 'input, select, textarea, button, [tabindex]:not([tabindex="-1"])';
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
      onClose();
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
  }, [onClose, getFocusableElements]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="term-modal-title"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg rounded-lg bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2
            id="term-modal-title"
            className="text-lg font-semibold text-gray-900"
          >
            {isEditMode ? 'Edit Term' : 'Add New Term'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-4 px-6 py-4">
            {/* Name field */}
            <div>
              <label
                htmlFor="term-name"
                className="block text-sm font-medium text-gray-700"
              >
                Name <span className="text-red-500">*</span>
              </label>
              <input
                ref={nameInputRef}
                id="term-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.name;
                      return next;
                    });
                  }
                }}
                className={`mt-1 w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500'
                }`}
                aria-required="true"
                aria-invalid={errors.name ? 'true' : 'false'}
                aria-describedby={errors.name ? 'term-name-error' : undefined}
                placeholder="Enter term name"
              />
              {errors.name && (
                <p id="term-name-error" className="mt-1 text-sm text-red-600" role="alert">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Scope field */}
            <div>
              <label
                htmlFor="term-scope"
                className="block text-sm font-medium text-gray-700"
              >
                Scope <span className="text-red-500">*</span>
              </label>
              <select
                id="term-scope"
                value={scope}
                onChange={(e) => {
                  setScope(e.target.value);
                  if (errors.scope) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.scope;
                      return next;
                    });
                  }
                }}
                className={`mt-1 w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.scope
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500'
                }`}
                aria-required="true"
                aria-invalid={errors.scope ? 'true' : 'false'}
                aria-describedby={errors.scope ? 'term-scope-error' : undefined}
              >
                <option value="">Select scope</option>
                {SCOPE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.scope && (
                <p id="term-scope-error" className="mt-1 text-sm text-red-600" role="alert">
                  {errors.scope}
                </p>
              )}
            </div>

            {/* Translation DE field */}
            <div>
              <label
                htmlFor="term-translation-de"
                className="block text-sm font-medium text-gray-700"
              >
                Translation (DE)
              </label>
              <input
                id="term-translation-de"
                type="text"
                value={translationDE}
                onChange={(e) => {
                  setTranslationDE(e.target.value);
                  if (errors.translation) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.translation;
                      return next;
                    });
                  }
                }}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter German translation"
              />
            </div>

            {/* Translation ES field */}
            <div>
              <label
                htmlFor="term-translation-es"
                className="block text-sm font-medium text-gray-700"
              >
                Translation (ES)
              </label>
              <input
                id="term-translation-es"
                type="text"
                value={translationES}
                onChange={(e) => {
                  setTranslationES(e.target.value);
                  if (errors.translation) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.translation;
                      return next;
                    });
                  }
                }}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Spanish translation"
              />
            </div>

            {/* Keep As Is checkbox */}
            <div className="flex items-center gap-2">
              <input
                id="term-keep-as-is"
                type="checkbox"
                checked={keepAsIs}
                onChange={(e) => {
                  setKeepAsIs(e.target.checked);
                  if (errors.translation) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.translation;
                      return next;
                    });
                  }
                }}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <label
                htmlFor="term-keep-as-is"
                className="text-sm font-medium text-gray-700"
              >
                Keep As Is
              </label>
            </div>

            {/* Translation error */}
            {errors.translation && (
              <p className="text-sm text-red-600" role="alert">
                {errors.translation}
              </p>
            )}

            {/* Notes field */}
            <div>
              <label
                htmlFor="term-notes"
                className="block text-sm font-medium text-gray-700"
              >
                Notes
              </label>
              <textarea
                id="term-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter additional notes"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isEditMode ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

TermModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  term: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    scope: PropTypes.string.isRequired,
    translationDE: PropTypes.string,
    translationES: PropTypes.string,
    keepAsIs: PropTypes.bool,
    notes: PropTypes.string,
  }),
  existingTerms: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

TermModal.defaultProps = {
  term: null,
};

export default TermModal;