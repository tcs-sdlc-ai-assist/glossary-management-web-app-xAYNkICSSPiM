import { useState, useEffect, useCallback } from 'react';
import { NOTIFICATION_TYPES, NOTIFICATION_DURATION } from '../constants.js';

/**
 * Custom React hook for notification/snackbar management.
 * Manages notification queue with type (success/error), message, and auto-dismiss timer.
 * @returns {object} An object containing notification state and action handlers
 * @returns {object|null} return.notification - Current notification object with { id, type, message } or null
 * @returns {Function} return.showNotification - Function to show a notification: (type: string, message: string) => void
 * @returns {Function} return.dismissNotification - Function to dismiss the current notification: () => void
 */
export function useNotification() {
  const [notification, setNotification] = useState(null);

  /**
   * Shows a notification message that auto-dismisses after NOTIFICATION_DURATION.
   * @param {string} type - Notification type ('success' or 'error')
   * @param {string} message - Notification message
   */
  const showNotification = useCallback((type, message) => {
    if (!type || !message) {
      return;
    }

    const validTypes = [NOTIFICATION_TYPES.SUCCESS, NOTIFICATION_TYPES.ERROR];
    const resolvedType = validTypes.includes(type) ? type : NOTIFICATION_TYPES.ERROR;

    setNotification({
      id: Date.now(),
      type: resolvedType,
      message,
    });
  }, []);

  /**
   * Dismisses the current notification.
   */
  const dismissNotification = useCallback(() => {
    setNotification(null);
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, NOTIFICATION_DURATION);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [notification]);

  return {
    notification,
    showNotification,
    dismissNotification,
  };
}