import React, { useState, useRef, useEffect } from 'react';
import { useHapticFeedback } from '../hooks/useMobileEnhancements';

const MobileFormOptimized = ({ 
  onSubmit, 
  children, 
  className = '',
  validateOnChange = true,
  showProgress = false 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const formRef = useRef(null);
  const { success, error: errorHaptic } = useHapticFeedback();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit?.(e);
      success();
    } catch (err) {
      errorHaptic();
      console.error('Form submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form 
      ref={formRef}
      onSubmit={handleSubmit}
      className={`mobile-form-optimized ${className}`}
      noValidate
    >
      {children}
      
      <style jsx>{`
        .mobile-form-optimized {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 16px;
        }

        .mobile-form-optimized input,
        .mobile-form-optimized select,
        .mobile-form-optimized textarea {
          min-height: 48px;
          font-size: 16px; /* Prevent iOS zoom */
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          background: white;
          transition: all 0.2s ease;
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          box-sizing: border-box;
        }

        .mobile-form-optimized input:focus,
        .mobile-form-optimized select:focus,
        .mobile-form-optimized textarea:focus {
          outline: none;
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
          transform: translateY(-1px);
        }

        .mobile-form-optimized input:invalid,
        .mobile-form-optimized select:invalid,
        .mobile-form-optimized textarea:invalid {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }

        .mobile-form-optimized button {
          min-height: 48px;
          font-size: 16px;
          font-weight: 600;
          padding: 12px 24px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }

        .mobile-form-optimized button:active {
          transform: scale(0.98);
        }

        .mobile-form-optimized button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }
      `}</style>
    </form>
  );
};

// Enhanced Input Component
const MobileInput = ({ 
  label, 
  error, 
  warning,
  type = 'text', 
  required = false,
  validate,
  ...props 
}) => {
  const [value, setValue] = useState(props.value || '');
  const [localError, setLocalError] = useState('');
  const [localWarning, setLocalWarning] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    if (validate) {
      const validation = validate(newValue);
      setLocalError(validation.error || '');
      setLocalWarning(validation.warning || '');
    }
    
    props.onChange?.(e);
  };

  const handleFocus = (e) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    props.onBlur?.(e);
  };

  return (
    <div className="mobile-input-wrapper">
      {label && (
        <label className="mobile-input-label">
          {label}
          {required && <span className="required-indicator">*</span>}
        </label>
      )}
      
      <div className="mobile-input-container">
        <input
          ref={inputRef}
          type={type}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`mobile-input ${error || localError ? 'error' : ''} ${warning || localWarning ? 'warning' : ''} ${isFocused ? 'focused' : ''}`}
          required={required}
          {...props}
        />
        
        {(error || localError) && (
          <div className="input-error" role="alert">
            <span className="error-icon">⚠️</span>
            {error || localError}
          </div>
        )}
        
        {(warning || localWarning) && !error && !localError && (
          <div className="input-warning" role="alert">
            <span className="warning-icon">💡</span>
            {warning || localWarning}
          </div>
        )}
      </div>

      <style jsx>{`
        .mobile-input-wrapper {
          display: flex;
          flex-direction: column;
          gap: 6px;
          width: 100%;
        }

        .mobile-input-label {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .required-indicator {
          color: #ef4444;
          font-weight: 700;
        }

        .mobile-input-container {
          position: relative;
          width: 100%;
        }

        .mobile-input {
          width: 100%;
          min-height: 48px;
          font-size: 16px;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          background: white;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-sizing: border-box;
          -webkit-appearance: none;
          appearance: none;
        }

        .mobile-input:focus {
          outline: none;
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
          transform: translateY(-1px);
        }

        .mobile-input.error {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }

        .mobile-input.warning {
          border-color: #f59e0b;
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
        }

        .input-error,
        .input-warning {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 6px;
          font-size: 12px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 8px;
          animation: slideIn 0.2s ease;
        }

        .input-error {
          color: #dc2626;
          background: #fef2f2;
          border: 1px solid #fecaca;
        }

        .input-warning {
          color: #d97706;
          background: #fffbeb;
          border: 1px solid #fed7aa;
        }

        .error-icon,
        .warning-icon {
          font-size: 14px;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Number input optimizations */
        .mobile-input[type="number"] {
          -moz-appearance: textfield;
        }

        .mobile-input[type="number"]::-webkit-outer-spin-button,
        .mobile-input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        /* Date input optimizations */
        .mobile-input[type="date"] {
          position: relative;
        }

        .mobile-input[type="date"]::-webkit-calendar-picker-indicator {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          font-size: 16px;
        }
      `}</style>
    </div>
  );
};

// Enhanced Button Component
const MobileButton = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  ...props 
}) => {
  const { lightTap } = useHapticFeedback();

  const handleClick = (e) => {
    if (!disabled && !loading) {
      lightTap();
      props.onClick?.(e);
    }
  };

  const variants = {
    primary: { bg: '#10b981', color: 'white', hoverBg: '#059669' },
    secondary: { bg: '#6b7280', color: 'white', hoverBg: '#4b5563' },
    danger: { bg: '#ef4444', color: 'white', hoverBg: '#dc2626' },
    outline: { bg: 'transparent', color: '#374151', border: '2px solid #e5e7eb' }
  };

  const sizes = {
    small: { padding: '8px 16px', fontSize: '14px', minHeight: '40px' },
    medium: { padding: '12px 24px', fontSize: '16px', minHeight: '48px' },
    large: { padding: '16px 32px', fontSize: '18px', minHeight: '56px' }
  };

  const variantStyle = variants[variant];
  const sizeStyle = sizes[size];

  return (
    <button
      className={`mobile-button ${variant} ${size} ${fullWidth ? 'full-width' : ''} ${loading ? 'loading' : ''}`}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {loading && <div className="button-spinner" />}
      {icon && !loading && <span className="button-icon">{icon}</span>}
      <span className={`button-text ${loading ? 'loading' : ''}`}>
        {children}
      </span>

      <style jsx>{`
        .mobile-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 600;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          position: relative;
          overflow: hidden;
          
          background: ${variantStyle.bg};
          color: ${variantStyle.color};
          padding: ${sizeStyle.padding};
          font-size: ${sizeStyle.fontSize};
          min-height: ${sizeStyle.minHeight};
          ${variantStyle.border ? `border: ${variantStyle.border};` : ''}
        }

        .mobile-button.full-width {
          width: 100%;
        }

        .mobile-button:not(:disabled):active {
          transform: scale(0.98);
        }

        .mobile-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }

        .mobile-button.loading {
          cursor: wait;
        }

        .button-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .button-text.loading {
          opacity: 0.7;
        }

        .button-icon {
          font-size: 1.1em;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Hover effects for desktop */
        @media (hover: hover) {
          .mobile-button:not(:disabled):hover {
            background: ${variantStyle.hoverBg || variantStyle.bg};
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
        }
      `}</style>
    </button>
  );
};

export { MobileFormOptimized, MobileInput, MobileButton };