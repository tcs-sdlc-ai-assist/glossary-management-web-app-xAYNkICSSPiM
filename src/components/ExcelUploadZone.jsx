import React, { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { SUPPORTED_FILE_ACCEPT } from '../constants.js';
import { validateFileType } from '../services/excelService.js';

/**
 * File upload drag-and-drop zone component for Excel/CSV import.
 * Supports drag-and-drop and click-to-browse.
 * Validates file type (.xlsx, .xls, .csv) and shows error for invalid files.
 * Calls onFileSelected callback with the selected File object.
 * Includes ARIA dropzone attributes.
 * @param {object} props
 * @param {Function} props.onFileSelected - Callback fired with the selected File object
 * @param {boolean} [props.disabled] - Whether the upload zone is disabled
 * @returns {React.ReactElement} The file upload zone element
 */
export function ExcelUploadZone({ onFileSelected, disabled }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const fileInputRef = useRef(null);

  /**
   * Processes a selected or dropped file, validates type, and calls onFileSelected.
   * @param {File} file - The file to process
   */
  const processFile = useCallback((file) => {
    if (!file) {
      return;
    }

    setError('');
    setSelectedFileName('');

    const validation = validateFileType(file);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setSelectedFileName(file.name);
    onFileSelected(file);
  }, [onFileSelected]);

  /**
   * Handles click on the upload zone to open file browser.
   */
  const handleClick = () => {
    if (disabled) {
      return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  /**
   * Handles keydown events on the upload zone for accessibility.
   * @param {React.KeyboardEvent<HTMLDivElement>} e - The keydown event
   */
  const handleKeyDown = (e) => {
    if (disabled) {
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  /**
   * Handles file input change events.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event
   */
  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      processFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Handles drag enter events.
   * @param {React.DragEvent<HTMLDivElement>} e - The drag event
   */
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  /**
   * Handles drag over events.
   * @param {React.DragEvent<HTMLDivElement>} e - The drag event
   */
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  /**
   * Handles drag leave events.
   * @param {React.DragEvent<HTMLDivElement>} e - The drag event
   */
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  /**
   * Handles drop events.
   * @param {React.DragEvent<HTMLDivElement>} e - The drop event
   */
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) {
      return;
    }

    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const baseClasses =
    'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 transition-colors';
  const stateClasses = disabled
    ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-300'
    : isDragOver
      ? 'cursor-pointer border-blue-500 bg-blue-50'
      : 'cursor-pointer border-gray-300 bg-white hover:border-blue-400 hover:bg-gray-50';

  return (
    <div>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload Excel or CSV file"
        aria-disabled={disabled ? 'true' : 'false'}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`${baseClasses} ${stateClasses}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`mb-3 h-10 w-10 ${disabled ? 'text-gray-300' : isDragOver ? 'text-blue-500' : 'text-gray-400'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <p className={`text-sm font-medium ${disabled ? 'text-gray-300' : 'text-gray-700'}`}>
          {isDragOver ? 'Drop file here' : 'Drag & drop a file here, or click to browse'}
        </p>
        <p className={`mt-1 text-xs ${disabled ? 'text-gray-300' : 'text-gray-500'}`}>
          Supported formats: .xlsx, .xls, .csv
        </p>
        {selectedFileName && !error && (
          <p className="mt-2 text-sm font-medium text-green-600">
            Selected: {selectedFileName}
          </p>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={SUPPORTED_FILE_ACCEPT}
          onChange={handleFileChange}
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
          disabled={disabled}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

ExcelUploadZone.propTypes = {
  onFileSelected: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

ExcelUploadZone.defaultProps = {
  disabled: false,
};

export default ExcelUploadZone;