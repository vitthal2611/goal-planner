import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  IconButton, 
  Collapse,
  TextField,
  LinearProgress
} from '@mui/material';
import { 
  ExpandMore, 
  Edit, 
  TrendingDown, 
  MoreVert,
  Check,
  Close
} from '@mui/icons-material';

export const MonthlyProgressCard = ({ goal, onUpdateProgress }) => {
  const [expanded, setExpanded] = useState(false);
  const [editingMonth, setEditingMonth] = useState(null);
  const [editValue, setEditValue] = useState('');

  const monthlyData = [
    { month: 'Dec 2025', target: 2, actual: 0, isCurrent: true },
    { month: 'Jan 2026', target: 2, actual: 0, isCurrent: false },
    { month: 'Feb 2026', target: 2, actual: 0, isCurrent: false },
    { month: 'Mar 2026', target: 2, actual: 0, isCurrent: false },
    { month: 'Apr 2026', target: 2, actual: 0, isCurrent: false },
  ];

  const startEdit = (monthKey, currentValue) => {
    setEditingMonth(monthKey);
    setEditValue(currentValue || '');
  };

  const saveEdit = () => {
    if (editingMonth && onUpdateProgress) {
      onUpdateProgress(editingMonth, parseFloat(editValue) || 0);
    }
    setEditingMonth(null);
    setEditValue('');
  };

  return (
    <Card 
      elevation={0}
      sx={{ 
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': { 
          boxShadow: '0 4px 16px rgba(91, 124, 153, 0.12)',
          transform: 'translateY(-2px)'
        }
      }}
    >
      <Box sx={{ 
        background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
        p: 3,
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              read a 2 book each month
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                NaN / 24.2
              </Typography>
              <Chip 
                icon={<TrendingDown />}
                label="Behind"
                size="small"
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white', 
                  fontWeight: 600,
                  '& .MuiChip-icon': { color: 'white' }
                }}
              />
            </Box>
          </Box>
          <IconButton sx={{ color: 'white' }}>
            <MoreVert />
          </IconButton>
        </Box>
        
        <Typography variant="h2" sx={{ fontWeight: 800, mb: 2 }}>
          NaN%
        </Typography>
      </Box>

      <CardContent sx={{ p: 0 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            p: 3, 
            cursor: 'pointer',
            '&:hover': { bgcolor: 'grey.50' }
          }}
          onClick={() => setExpanded(!expanded)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            <Box sx={{ fontSize: '1.2rem' }}>📊</Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Monthly Progress Tracking
            </Typography>
          </Box>
          <IconButton 
            sx={{ 
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease'
            }}
          >
            <ExpandMore />
          </IconButton>
        </Box>

        <Collapse in={expanded}>
          <Box sx={{ px: 3, pb: 3 }}>
            <Box sx={{ display: 'flex', fontWeight: 600, color: 'text.secondary', mb: 2, px: 2 }}>
              <Box sx={{ flex: 1 }}>Month</Box>
              <Box sx={{ width: 80, textAlign: 'center' }}>Target</Box>
              <Box sx={{ width: 80, textAlign: 'center' }}>Actual</Box>
              <Box sx={{ width: 100, textAlign: 'center' }}>Progress</Box>
            </Box>
            
            {monthlyData.map((row, index) => {
              const progress = row.target > 0 ? (row.actual / row.target) * 100 : 0;
              return (
                <Box 
                  key={index}
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    borderRadius: 2,
                    mb: 1,
                    bgcolor: row.isCurrent ? 'primary.50' : 'transparent',
                    '&:hover': { bgcolor: row.isCurrent ? 'primary.100' : 'grey.50' }
                  }}
                >
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: row.isCurrent ? 600 : 400 }}>
                      {row.month}
                    </Typography>
                    {row.isCurrent && (
                      <Chip 
                        label="Current" 
                        size="small" 
                        color="primary"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                  
                  <Box sx={{ width: 80, textAlign: 'center' }}>
                    <Typography variant="body2">{row.target}</Typography>
                  </Box>
                  
                  <Box sx={{ width: 80, textAlign: 'center' }}>
                    {editingMonth === `${index}` ? (
                      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', justifyContent: 'center' }}>
                        <TextField
                          size="small"
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          sx={{ width: 50 }}
                        />
                        <IconButton size="small" onClick={saveEdit}>
                          <Check sx={{ fontSize: 16 }} />
                        </IconButton>
                        <IconButton size="small" onClick={() => setEditingMonth(null)}>
                          <Close sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        <Typography variant="body2">{row.actual}</Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => startEdit(`${index}`, row.actual)}
                          sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
                        >
                          <Edit sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                  
                  <Box sx={{ width: 100, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(progress, 100)}
                      sx={{ 
                        flex: 1, 
                        height: 6, 
                        borderRadius: 3,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                          bgcolor: progress >= 100 ? 'success.main' : 
                                  progress >= 50 ? 'warning.main' : 'error.main'
                        }
                      }}
                    />
                    <Typography variant="caption" sx={{ minWidth: 30, textAlign: 'right' }}>
                      {Math.round(progress)}%
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};