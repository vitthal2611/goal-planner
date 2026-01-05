// Input sanitization utility to prevent XSS attacks
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const sanitizeCSVData = (csvData) => {
  if (!csvData || typeof csvData !== 'object') return csvData;
  
  const sanitized = {};
  Object.keys(csvData).forEach(key => {
    if (typeof csvData[key] === 'string') {
      sanitized[key] = sanitizeInput(csvData[key]);
    } else {
      sanitized[key] = csvData[key];
    }
  });
  
  return sanitized;
};

export const validatePaymentMethod = (method) => {
  if (!method || typeof method !== 'string') return false;
  
  // Allow only alphanumeric characters, spaces, hyphens, and underscores
  const validPattern = /^[a-zA-Z0-9\s\-_]+$/;
  return validPattern.test(method) && method.length <= 50;
};