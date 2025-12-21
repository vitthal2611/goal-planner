import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Chip, 
  Typography, 
  IconButton, 
  Collapse,
  CircularProgress
} from '@mui/material';
import { AutoAwesome, ExpandMore, ExpandLess } from '@mui/icons-material';

const generateSuggestions = async (input, type, context = {}) => {
  // Create AI prompt based on type
  let aiPrompt = '';
  const currentYear = new Date().getFullYear();
  
  if (type === 'goal') {
    aiPrompt = `I want to set up my goals for ${currentYear} with below description [${input}] act as best goal planner suggest a goal name based on that`;
  } else if (type === 'habit') {
    const goalTitle = context.goalTitle || 'my goal';
    aiPrompt = `Based on the goal "${goalTitle}", suggest habit names for: ${input}`;
  } else if (type === 'trigger') {
    const goalTitle = context.goalTitle || 'my goal';
    aiPrompt = `For the habit "${input}" related to goal "${goalTitle}", suggest trigger phrases`;
  }
  
  // Log AI prompt data to console
  console.log('🤖 AI Suggestion Prompt:', {
    prompt: aiPrompt,
    input,
    type,
    context,
    goalTitle: context.goalTitle,
    timestamp: new Date().toISOString()
  });
  
  // Simulate AI call with realistic delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Return empty array since we're not using hardcoded data
  // In real implementation, this would call actual AI service
  console.log('⚠️ No AI service connected. This would call real AI with the above prompt.');
  
  try {
    const response = await fetch('/.netlify/functions/ai-suggestions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt: aiPrompt, type, context })
    });
    
    if (!response.ok) {
      throw new Error(`AI service error: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ AI Response:', result);
    return result.suggestions || [];
  } catch (error) {
    console.log('❌ AI service unavailable:', error.message);
    return [];
  }

};

export const InlineAISuggestions = ({ 
  input, 
  type, 
  onSuggestionClick, 
  placeholder = "Start typing to see AI suggestions...",
  context = {}
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Stabilize context to prevent infinite re-renders
  const stableContext = useMemo(() => context, [JSON.stringify(context)]);

  useEffect(() => {
    if (input && input.length > 2) {
      setLoading(true);
      
      // Debounce: wait 1 second after user stops typing
      const timeoutId = setTimeout(() => {
        generateSuggestions(input, type, stableContext).then(results => {
          setSuggestions(results);
          setLoading(false);
          if (results.length > 0) {
            setExpanded(true);
          }
        });
      }, 1000);
      
      // Cleanup timeout if input changes before 1 second
      return () => clearTimeout(timeoutId);
    } else {
      setSuggestions([]);
      setExpanded(false);
      setLoading(false);
    }
  }, [input, type, stableContext]);

  if (!input || input.length <= 2) {
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1, 
        color: 'text.secondary',
        fontSize: '0.875rem',
        mt: 1
      }}>
        <AutoAwesome sx={{ fontSize: 16 }} />
        <Typography variant="caption">{placeholder}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 1 }}>
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1, 
          cursor: 'pointer',
          color: 'primary.main'
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <AutoAwesome sx={{ fontSize: 16 }} />
        <Typography variant="caption" sx={{ fontWeight: 500 }}>
          {loading ? 'AI is thinking...' : `${suggestions.length} AI suggestions`}
        </Typography>
        {loading ? (
          <CircularProgress size={12} />
        ) : suggestions.length > 0 ? (
          <IconButton size="small" sx={{ p: 0 }}>
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        ) : null}
      </Box>

      <Collapse in={expanded && !loading && suggestions.length > 0}>
        <Box sx={{ 
          mt: 2, 
          p: 2,
          bgcolor: 'primary.50',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'primary.200'
        }}>
          <Typography variant="subtitle2" sx={{ 
            fontWeight: 600, 
            mb: 1.5,
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <AutoAwesome sx={{ fontSize: 16 }} />
            AI Suggestions
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {suggestions.map((suggestion, index) => (
              <Box
                key={index}
                onClick={() => onSuggestionClick(suggestion)}
                sx={{ 
                  p: 1.5,
                  bgcolor: 'white',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'primary.200',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  transition: 'all 0.2s',
                  '&:hover': { 
                    bgcolor: 'primary.100',
                    borderColor: 'primary.main',
                    transform: 'translateY(-1px)',
                    boxShadow: 1
                  }
                }}
              >
                {type === 'goal' ? 
                  `${suggestion.title} (${suggestion.target} ${suggestion.unit})` :
                  type === 'trigger' ?
                    suggestion.trigger :
                    suggestion.name
                }
              </Box>
            ))}
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
};