import React from 'react';
import PropTypes from 'prop-types';
import { SortableHeader } from './SortableHeader.jsx';
import { GlossaryRow } from './GlossaryRow.jsx';

/**
 * Main glossary table component.
 * Renders a table with SortableHeader columns and GlossaryRow for each term.
 * Handles empty state display when no terms are available.
 * @param {object} props
 * @param {Array<object>} props.terms - Array of glossary term objects to display
 * @param {string} props.sortColumn - The currently active sort column
 * @param {string} props.sortDirection - The current sort direction ('asc' or 'desc')
 * @param {Function} props.onSort - Callback fired with column key when a header is clicked
 * @param {Function} props.onEdit - Callback fired with the term object when Edit is clicked
 * @param {Function} props.onDelete - Callback fired with the term object when Delete is clicked
 * @returns {React.ReactElement} The glossary table element
 */
export function GlossaryTable({ terms, sortColumn, sortDirection, onSort, onEdit, onDelete }) {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'scope', label: 'Scope' },
    { key: 'translationDE', label: 'Translation (DE)' },
    { key: 'translationES', label: 'Translation (ES)' },
    { key: 'keepAsIs', label: 'Keep As Is' },
    { key: 'notes', label: 'Notes' },
  ];

  const hasTerms = Array.isArray(terms) && terms.length > 0;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200" role="table">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <SortableHeader
                key={col.key}
                column={col.key}
                label={col.label}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={onSort}
              />
            ))}
            <th
              scope="col"
              className="px-4 py-3 text-left text-sm font-semibold text-gray-700"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {hasTerms ? (
            terms.map((term) => (
              <GlossaryRow
                key={term.id}
                term={term}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length + 1}
                className="px-4 py-12 text-center text-sm text-gray-500"
              >
                <div className="flex flex-col items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="font-medium text-gray-500">No glossary terms found</p>
                  <p className="text-gray-400">
                    Add a new term or adjust your search criteria.
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

GlossaryTable.propTypes = {
  terms: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      scope: PropTypes.string.isRequired,
      translationDE: PropTypes.string,
      translationES: PropTypes.string,
      keepAsIs: PropTypes.bool,
      notes: PropTypes.string,
    })
  ).isRequired,
  sortColumn: PropTypes.string.isRequired,
  sortDirection: PropTypes.string.isRequired,
  onSort: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default GlossaryTable;