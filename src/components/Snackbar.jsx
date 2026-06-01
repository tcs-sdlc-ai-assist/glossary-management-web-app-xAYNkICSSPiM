import React from 'react';
import PropTypes from 'prop-types';
import { useNotificationContext } from '../context/NotificationContext.jsx';
import { NOTIFICATION_TYPES } from '../constants.js';

/**
 * Snackbar/notification component that displays success or error messages.
 * Uses ARIA live region for accessibility.
 * Includes dismiss button and auto-dismiss timer (handled by NotificationContext).
 * @returns {React.ReactElement|null} The snackbar element or null if no notification
 */
export function Snackbar() {
  const { notification, dismissNotification } = useNotificationContext();

  if (!notification) {
    return null;
  }

  const isSuccess = notification.type === NOTIFICATION_TYPES.SUCCESS;
  const isError = notification.type === NOTIFICATION_TYPES.ERROR;

  const baseClasses =
    'fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white text-sm max-w-md transition-all';
  const typeClasses = isSuccess
    ? 'bg-green-600'
    : isError
      ? 'bg-red-600'
      : 'bg-gray-700';

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`${baseClasses} ${typeClasses}`}
    >
      <span className="flex-1">{notification.message}</span>
      <button
        type="button"
        onClick={dismissNotification}
        className="ml-2 flex-shrink-0 rounded p-1 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
        aria-label="Dismiss notification"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
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
  );
}

Snackbar.propTypes = {};

export default Snackbar;