import React, { useState } from 'react';
import { Box, Button, Paper, Typography, LinearProgress, Alert } from '@mui/material';
import { runAllPersistenceTests } from './firebasePersistence.test';

export default function TestRunner() {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);

  const handleRunTests = async () => {
    setRunning(true);
    setResults(null);
    
    try {
      const testResults = await runAllPersistenceTests();
      setResults(testResults);
    } catch (error) {
      setResults({
        passed: 0,
        failed: 1,
        total: 1,
        results: [{ success: false, message: error.message }]
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          🧪 Firebase Persistence Tests
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Test all CRUD operations for Goals, Habits, Logs, and Reviews
        </Typography>

        <Button
          variant="contained"
          size="large"
          onClick={handleRunTests}
          disabled={running}
          fullWidth
        >
          {running ? 'Running Tests...' : 'Run All Tests'}
        </Button>

        {running && (
          <Box sx={{ mt: 3 }}>
            <LinearProgress />
            <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
              Testing database operations...
            </Typography>
          </Box>
        )}

        {results && (
          <Box sx={{ mt: 3 }}>
            <Alert severity={results.failed === 0 ? 'success' : 'error'} sx={{ mb: 2 }}>
              <Typography variant="h6">
                {results.failed === 0 ? '✅ All Tests Passed!' : '❌ Some Tests Failed'}
              </Typography>
              <Typography variant="body2">
                Passed: {results.passed} | Failed: {results.failed} | Total: {results.total}
              </Typography>
              <Typography variant="body2">
                Success Rate: {((results.passed / results.total) * 100).toFixed(1)}%
              </Typography>
            </Alert>

            {results.results.map((result, index) => (
              <Alert 
                key={index} 
                severity={result.success ? 'success' : 'error'}
                sx={{ mb: 1 }}
              >
                {result.message}
              </Alert>
            ))}
          </Box>
        )}

        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Tests Include:
          </Typography>
          <Typography variant="body2" component="div">
            • Goal CRUD operations (Create, Read, Update, Delete)<br/>
            • Habit CRUD operations<br/>
            • Daily Log CRUD operations<br/>
            • Review CRUD operations<br/>
            • Bulk operations (multiple records)<br/>
            • Data integrity & relationships
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
