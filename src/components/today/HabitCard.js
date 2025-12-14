import React from 'react';
import { Card, CardContent, Checkbox, Chip, Box, Typography, Zoom, useMediaQuery, useTheme } from '@mui/material';
import { CheckCircle, RadioButtonUnchecked } from '@mui/icons-material';
import { getFrequencyLabel } from '../../utils/frequencyRules';

export const HabitCard = ({ habit, log, onToggle, isAnimating }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDone = log?.status === 'done';
  const isSkipped = log?.status === 'skipped';

  return (
    <Card 
      elevation={isDone ? 2 : 0}
      sx={{ 
        cursor: 'pointer',
        bgcolor: isDone ? 'success.50' : isSkipped ? 'grey.100' : 'background.paper',
        border: '1px solid',
        borderColor: isDone ? 'success.main' : isSkipped ? 'grey.300' : 'divider',
        transform: isAnimating ? 'scale(1.02)' : 'scale(1)',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': { 
          bgcolor: isDone ? 'success.100' : isSkipped ? 'grey.200' : 'grey.50',
          borderColor: isDone ? 'success.dark' : 'primary.main',
          transform: isMobile ? 'none' : 'translateY(-2px)',
          boxShadow: isMobile ? 0 : 4
        },
        '&:active': {
          transform: 'scale(0.98)',
          transition: 'transform 0.1s'
        }
      }}
      onClick={() => onToggle(habit.id, log?.status)}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', minHeight: { xs: 60, sm: 48 } }}>
          <Zoom in={true} timeout={300}>
            <Checkbox
              checked={isDone}
              icon={<RadioButtonUnchecked sx={{ fontSize: { xs: 32, sm: 28 } }} />}
              checkedIcon={<CheckCircle sx={{ fontSize: { xs: 32, sm: 28 } }} />}
              sx={{ 
                mr: { xs: 1.5, sm: 2.5 },
                p: { xs: 1.5, sm: 1.5 },
                minWidth: 48,
                minHeight: 48,
                '&:hover': { bgcolor: 'transparent' }
              }}
              onClick={(e) => {
                e.stopPropagation();
                onToggle(habit.id, log?.status);
              }}
            />
          </Zoom>
          
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="body1" 
              sx={{ 
                fontWeight: 500,
                textDecoration: isSkipped ? 'line-through' : 'none',
                color: isSkipped ? 'text.secondary' : 'text.primary',
                mb: { xs: 0.5, sm: 0.75 },
                fontSize: { xs: '1rem', sm: '1rem' },
                lineHeight: 1.5
              }}
            >
              {habit.name}
            </Typography>
            {isMobile ? (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.6 }}>
                {habit.time}
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {habit.trigger} • {habit.time} • {habit.location}
                </Typography>
                {habit.frequency !== 'daily' && (
                  <Chip 
                    label={getFrequencyLabel(habit)} 
                    size="small" 
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                )}
              </Box>
            )}
          </Box>

          {isDone && (
            <Chip 
              label="Done" 
              size="small" 
              color="success" 
              sx={{ fontWeight: 600, ml: 1 }}
            />
          )}
          {isSkipped && (
            <Chip 
              label="Skipped" 
              size="small" 
              sx={{ fontWeight: 600, ml: 1 }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};