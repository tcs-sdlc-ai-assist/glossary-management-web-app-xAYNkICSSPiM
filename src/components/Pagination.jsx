import React from 'react';
import PropTypes from 'prop-types';

/**
 * Pagination controls component.
 * Displays previous/next buttons, current page number, total pages, and total entries count.
 * Disables buttons at boundaries. Calls onPageChange callback.
 * Includes ARIA navigation landmark.
 * @param {object} props
 * @param {number} props.currentPage - The current active page (1-based)
 * @param {number} props.totalPages - The total number of pages
 * @param {number} props.totalItems - The total number of entries
 * @param {Function} props.onPageChange - Callback fired with the new page number
 * @returns {React.ReactElement} The pagination controls element
 */
export function Pagination({ currentPage, totalPages, totalItems, onPageChange }) {
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  /**
   * Handles clicking the previous page button.
   */
  const handlePrevious = () => {
    if (!isFirstPage) {
      onPageChange(currentPage - 1);
    }
  };

  /**
   * Handles clicking the next page button.
   */
  const handleNext = () => {
    if (!isLastPage) {
      onPageChange(currentPage + 1);
    }
  };

  /**
   * Handles keydown events on the previous button for accessibility.
   * @param {React.KeyboardEvent<HTMLButtonElement>} e - The keydown event
   */
  const handlePreviousKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handlePrevious();
    }
  };

  /**
   * Handles keydown events on the next button for accessibility.
   * @param {React.KeyboardEvent<HTMLButtonElement>} e - The keydown event
   */
  const handleNextKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleNext();
    }
  };

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6"
    >
      <div className="flex flex-1 items-center justify-between">
        <p className="text-sm text-gray-700">
          Page{' '}
          <span className="font-medium">{currentPage}</span>
          {' '}of{' '}
          <span className="font-medium">{totalPages}</span>
          {' '}—{' '}
          <span className="font-medium">{totalItems}</span>
          {' '}{totalItems === 1 ? 'entry' : 'entries'} total
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handlePrevious}
            onKeyDown={handlePreviousKeyDown}
            disabled={isFirstPage}
            aria-label="Go to previous page"
            className={`inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isFirstPage
                ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-300'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-1 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Previous
          </button>
          <button
            type="button"
            onClick={handleNext}
            onKeyDown={handleNextKeyDown}
            disabled={isLastPage}
            aria-label="Go to next page"
            className={`inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isLastPage
                ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-300'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Next
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="ml-1 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  totalItems: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

export default Pagination;