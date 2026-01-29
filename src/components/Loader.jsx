import React from 'react';
import '../css/Loader.css';

export const Loader = ({ visible = true, size = 'md' }) => {
  if (!visible) return null;

  return (
    <div className="loader-overlay">
      <div className={`loader loader-${size}`}>
        <div className="spinner"></div>
      </div>
    </div>
  );
};

// Button Loader Component (inline with button)
export const ButtonLoader = ({ loading, children, disabled, ...props }) => {
  return (
    <button
      disabled={loading || disabled}
      style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
      {...props}
    >
      {loading ? (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <div className="mini-spinner"></div>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Loader;
