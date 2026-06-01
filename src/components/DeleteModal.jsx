import React, { useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * Confirmation modal for deleting a glossary term.
 * Displays term name and confirmation message.
 * Has Confirm and Cancel buttons. Calls onConfirm or onCancel callbacks.
 * Includes focus trapping and ARIA dialog role.
 * @param {object} props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {object|null} props.term - The term to delete
 * @param {string} props.term.id - Unique term identifier
 * @param {string} props.term.name - Term name
 * @param {Function} props.onConfirm - Callback fired when deletion is confirmed
 * @param {Function} props.onCancel - Callback fired when deletion is cancelled
 * @returns {React.ReactElement|null} The modal element or null if not open
 */
export function DeleteModal({ isOpen, term, onConfirm, onCancel }) {
  const modalRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const previousFocusRef = useRef(null);

  /**
   * Focuses the cancel button when the modal opens and stores previous focus.
   */
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;

      const timer = setTimeout(() => {
        if (cancelButtonRef.current) {
          cancelButtonRef.current.focus();
        }
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
   * Gets all focusable elements within the modal.
   * @returns {Array<HTMLElement>} Array of focusable elements
   */
  const getFocusableElements = useCallback(() => {
    if (!modalRef.current) {
      return [];
    }
    const selectors = 'button, [tabindex]:not([tabindex="-1"])';
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
      onCancel();
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
  }, [onCancel, getFocusableElements]);

  /**
   * Handles clicking the overlay backdrop to close the modal.
   * @param {React.MouseEvent<HTMLDivElement>} e - The click event
   */
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  /**
   * Handles clicking the confirm button.
   */
  const handleConfirm = () => {
    onConfirm();
  };

  /**
   * Handles clicking the cancel button.
   */
  const handleCancel = () => {
    onCancel();
  };

  if (!isOpen) {
    return null;
  }

  const termName = term ? term.name : '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={modalRef}
        className="w-full max-w-md rounded-lg bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2
            id="delete-modal-title"
            className="text-lg font-semibold text-gray-900"
          >
            Delete Term
          </h2>
          <button
            type="button"
            onClick={handleCancel}
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

        <div className="px-6 py-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 rounded-full bg-red-100 p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-700">
                Are you sure you want to delete the term{' '}
                <span className="font-semibold text-gray-900">&quot;{termName}&quot;</span>?
              </p>
              <p className="mt-1 text-sm text-gray-500">
                This action cannot be undone.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

DeleteModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  term: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }),
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

DeleteModal.defaultProps = {
  term: null,
};

export default DeleteModal;