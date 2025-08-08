// client/src/components/ToastNotification.jsx
import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faTimes } from '@fortawesome/free-solid-svg-icons';

const ToastNotification = ({ message, type = 'warning', onClose }) => {
  // Automatically close the toast after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  const styleConfig = {
    warning: {
      bg: 'bg-yellow-500/90',
      iconColor: 'text-yellow-900',
      icon: faExclamationTriangle,
    },
    // We can add other types like 'success' or 'error' later
  };

  const styles = styleConfig[type];

  return (
    <div
      className={`fixed top-5 right-5 z-50 flex items-center p-4 rounded-lg shadow-lg text-white ${styles.bg} animate-fade-in-right`}
    >
      <div className={`flex-shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-lg ${styles.iconColor} bg-yellow-100`}>
        <FontAwesomeIcon icon={styles.icon} />
      </div>
      <div className="ml-3 text-sm font-medium">{message}</div>
      <button
        type="button"
        className="ml-auto -mx-1.5 -my-1.5 bg-white/20 text-white hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8"
        onClick={onClose}
        aria-label="Close"
      >
        <FontAwesomeIcon icon={faTimes} />
      </button>
    </div>
  );
};

export default ToastNotification;