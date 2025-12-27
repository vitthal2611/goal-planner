import React from "react";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import { lightTheme } from "./theme/mobileTheme";
import AtomicHabitsTracker from "./components/atomic/AtomicHabitsTracker";
import { loadSampleData } from "./data/atomicHabitsData";

if (!localStorage.getItem("atomic_habits")) {
  loadSampleData();
}

export default function AtomicHabitsApp() {
  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <AtomicHabitsTracker />
      </Box>
    </ThemeProvider>
  );
}