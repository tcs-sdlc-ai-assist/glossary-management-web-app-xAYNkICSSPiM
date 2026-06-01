import React from 'react';
import PropTypes from 'prop-types';
import { SORT_DIRECTIONS } from '../constants.js';

/**
 * Clickable table column header component for sorting.
 * Displays column label with sort direction indicator (▲/▼/neutral).
 * Calls onSort callback with column key. Includes proper ARIA attributes for sort state.
 * @param {object} props
 * @param {string} props.column - The column key used for sorting
 * @param {string} props.label - The display label for the column header
 * @param {string} props.sortColumn - The currently active sort column
 * @param {string} props.sortDirection - The current sort direction ('asc' or 'desc')
 * @param {Function} props.onSort - Callback fired with the column key when header is clicked
 * @returns {React.ReactElement} The sortable header element
 */
export function SortableHeader({ column, label, sortColumn, sortDirection, onSort }) {
  const isActive = sortColumn === column;

  /**
   * Determines the ARIA sort value for the column header.
   * @returns {string} The ARIA sort attribute value
   */
  const getAriaSortValue = () => {
    if (!isActive) {
      return 'none';
    }
    return sortDirection === SORT_DIRECTIONS.ASC ? 'ascending' : 'descending';
  };

  /**
   * Renders the sort direction indicator.
   * @returns {React.ReactElement} The sort indicator element
   */
  const renderSortIndicator = () => {
    if (!isActive) {
      return (
        <span className="ml-1 text-gray-300" aria-hidden="true">
          ▲
        </span>
      );
    }

    if (sortDirection === SORT_DIRECTIONS.ASC) {
      return (
        <span className="ml-1 text-blue-600" aria-hidden="true">
          ▲
        </span>
      );
    }

    return (
      <span className="ml-1 text-blue-600" aria-hidden="true">
        ▼
      </span>
    );
  };

  /**
   * Handles click events on the header.
   */
  const handleClick = () => {
    onSort(column);
  };

  /**
   * Handles keydown events on the header for accessibility.
   * @param {React.KeyboardEvent<HTMLTableCellElement>} e - The keydown event
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSort(column);
    }
  };

  return (
    <th
      scope="col"
      role="columnheader"
      aria-sort={getAriaSortValue()}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="cursor-pointer select-none px-4 py-3 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
    >
      <span className="inline-flex items-center">
        {label}
        {renderSortIndicator()}
      </span>
    </th>
  );
}

SortableHeader.propTypes = {
  column: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  sortColumn: PropTypes.string.isRequired,
  sortDirection: PropTypes.string.isRequired,
  onSort: PropTypes.func.isRequired,
};

export default SortableHeader;