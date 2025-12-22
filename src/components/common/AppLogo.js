import React from 'react';
import { Box } from '@mui/material';

export const AppLogo = ({ size = 40, sx = {} }) => {
  return (
    <Box
      component="img"
      src="/logo.svg"
      alt="Goal Planner"
      sx={{
        width: size,
        height: size,
        ...sx
      }}
    />
  );
};