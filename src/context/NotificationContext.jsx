import React, { createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import { useNotification } from '../hooks/useNotification.js';

/**
 * @typedef {object} NotificationContextValue
 * @property {object|null} notification - Current notification object with { id, type, message } or null
 * @property {Function} showNotification - Function to show a notification: (type: string, message: string) => void
 * @property {Function} dismissNotification - Function to dismiss the current notification: () => void
 */

const NotificationContext = createContext(null);

/**
 * Provides app-wide notification state and actions to all child components.
 * Uses the useNotification hook internally for notification management.
 * @param {object} props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement} The context provider wrapping children
 */
export function NotificationProvider({ children }) {
  const { notification, showNotification, dismissNotification } = useNotification();

  const value = {
    notification,
    showNotification,
    dismissNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Custom hook to consume the NotificationContext.
 * Must be used within a NotificationProvider.
 * @returns {NotificationContextValue} The notification context value
 */
export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}

export { NotificationContext };