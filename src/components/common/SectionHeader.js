import React from 'react';
import { Box, Typography, Chip } from '@mui/material';

export const SectionHeader = ({ 
  title, 
  icon, 
  iconColor, 
  count, 
  countColor = 'default',
  action,
  sx = {}
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        mb: 3,
        pb: 2,
        borderBottom: '2px solid',
        borderColor: 'grey.200',
        ...sx
      }}
    >
      {icon && (
        <Box
          sx={{
            color: iconColor,
            mr: 1.5,
            display: 'flex',
            alignItems: 'center',
            fontSize: { xs: 22, sm: 28 }
          }}
        >
          {icon}
        </Box>
      )}
      
      <Typography variant="h5" sx={{ fontWeight: 600, flex: 1 }}>
        {title}
      </Typography>

      {count !== undefined && (
        <Chip
          label={count}
          size="small"
          color={countColor}
          sx={{
            fontWeight: 600,
            minWidth: 50
          }}
        />
      )}

      {action}
    </Box>
  );
};
