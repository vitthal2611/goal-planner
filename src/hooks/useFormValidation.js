import { useState, useCallback } from 'react';
import { sanitizeUserContent } from '../utils/sanitize.js';

export const useFormValidation = (validationSchema, initialValues = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = useCallback((name, value) => {
    try {
      const fieldSchema = validationSchema.shape[name];
      if (fieldSchema) {
        fieldSchema.parse(value);
        return null;
      }
    } catch (error) {
      return error.errors[0]?.message || 'Invalid input';
    }
    return null;
  }, [validationSchema]);

  const handleChange = useCallback((name, value) => {
    // Sanitize input
    const sanitizedValue = typeof value === 'string' ? sanitizeUserContent(value) : value;
    
    setValues(prev => ({ ...prev, [name]: sanitizedValue }));
    
    // Validate field if it has been touched
    if (touched[name]) {
      const error = validateField(name, sanitizedValue);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [validateField, touched]);

  const handleBlur = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [validateField, values]);

  const validateAll = useCallback(() => {
    try {
      const validatedData = validationSchema.parse(values);
      setErrors({});
      return { success: true, data: validatedData };
    } catch (error) {
      const fieldErrors = {};
      error.errors.forEach(err => {
        const field = err.path[0];
        if (!fieldErrors[field]) {
          fieldErrors[field] = err.message;
        }
      });
      setErrors(fieldErrors);
      return { success: false, errors: fieldErrors };
    }
  }, [validationSchema, values]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    isValid: Object.keys(errors).length === 0 && Object.keys(touched).length > 0
  };
};