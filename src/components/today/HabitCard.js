import React from 'react';
import { Card, CardContent, Checkbox, Chip, Box, Typography, Zoom } from '@mui/material';
import { CheckCircle, RadioButtonUnchecked } from '@mui/icons-material';

export const HabitCard = ({ habit, log, onToggle, isAnimating }) => {
  const isDone = log?.status === 'done';
  const isSkipped = log?.status === 'skipped';

  return (
    <Card 
      sx={{ 
        cursor: 'pointer',
        bgcolor: isDone ? 'success.50' : isSkipped ? 'grey.100' : 'background.paper',
        border: '2px solid',
        borderColor: isDone ? 'success.main' : isSkipped ? 'grey.300' : 'grey.200',
        borderRadius: 2.5,
        transform: isAnimating ? 'scale(1.02)' : 'scale(1)',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': { 
          bgcolor: isDone ? 'success.100' : isSkipped ? 'grey.200' : 'grey.50',
          borderColor: isDone ? 'success.dark' : 'primary.light',
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        },
        '&:active': {
          transform: 'scale(0.98)'
        }
      }}
      onClick={() => onToggle(habit.id, log?.status)}
    >
      <CardContent sx={{ 
        p: 2.5,
        '&:last-child': { pb: 2.5 }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 48 }}>
          {/* Larger tap target for checkbox */}
          <Zoom in={true} timeout={300}>
            <Checkbox
              checked={isDone}
              icon={<RadioButtonUnchecked sx={{ fontSize: 28 }} />}
              checkedIcon={<CheckCircle sx={{ fontSize: 28 }} />}
              sx={{ 
                mr: 2,
                p: 1.5,
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
                fontWeight: 600,
                textDecoration: isSkipped ? 'line-through' : 'none',
                color: isSkipped ? 'text.secondary' : 'text.primary',
                mb: 0.5
              }}
            >
              {habit.name}
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ display: 'block', lineHeight: 1.5 }}
            >
              {habit.trigger} • {habit.time} • {habit.location}
            </Typography>
          </Box>

          {isDone && (
            <Chip 
              label="Done" 
              size="small" 
              color="success" 
              sx={{ fontWeight: 600 }}
            />
          )}
          {isSkipped && (
            <Chip 
              label="Skipped" 
              size="small" 
              sx={{ fontWeight: 600 }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};