import React from 'react';
import PropTypes from 'prop-types';

/**
 * Search input component for filtering glossary terms.
 * Renders a text input with search icon, placeholder text, and clear button.
 * Calls onSearch callback on input change. Includes proper ARIA label for accessibility.
 * @param {object} props
 * @param {string} props.value - Current search query value
 * @param {Function} props.onSearch - Callback fired on input change with the new query string
 * @returns {React.ReactElement} The search bar element
 */
export function SearchBar({ value, onSearch }) {
  /**
   * Handles input change events.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event
   */
  const handleChange = (e) => {
    onSearch(e.target.value);
  };

  /**
   * Clears the search input.
   */
  const handleClear = () => {
    onSearch('');
  };

  /**
   * Handles keydown events on the clear button for accessibility.
   * @param {React.KeyboardEvent<HTMLButtonElement>} e - The keydown event
   */
  const handleClearKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClear();
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
          />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Search glossary terms..."
        aria-label="Search glossary terms"
        className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          onKeyDown={handleClearKeyDown}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
          aria-label="Clear search"
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
      )}
    </div>
  );
}

SearchBar.propTypes = {
  value: PropTypes.string.isRequired,
  onSearch: PropTypes.func.isRequired,
};

export default SearchBar;