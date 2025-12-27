import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  Alert
} from '@mui/material';
import AtomicHabit from '../../models/AtomicHabit';

const IDENTITY_EXAMPLES = [
  "walks for 10 minutes",
  "reads one page",
  "drinks a glass of water",
  "writes three sentences",
  "does 5 push-ups"
];

const WEEKDAYS = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 0, label: 'Sun' }
];

export default function HabitCreationDialog({ open, onClose, onSave, existingHabitsCount = 0 }) {
  const [formData, setFormData] = useState({
    name: '',
    trigger: '',
    time: '09:00',
    location: '',
    frequency: 'daily',
    weeklyDays: []
  });
  
  const [errors, setErrors] = useState([]);
  const [showIdentityHelper, setShowIdentityHelper] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors.length > 0) setErrors([]);
  };

  const handleWeeklyDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      weeklyDays: prev.weeklyDays.includes(day)
        ? prev.weeklyDays.filter(d => d !== day)
        : [...prev.weeklyDays, day]
    }));
  };

  const handleSave = () => {
    if (existingHabitsCount >= 5) {
      setErrors(['Maximum 5 active habits allowed. Archive or delete existing habits first.']);
      return;
    }

    const habit = new AtomicHabit(formData);
    const validation = AtomicHabit.validate(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    onSave(habit);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      name: '',
      trigger: '',
      time: '09:00',
      location: '',
      frequency: 'daily',
      weeklyDays: []
    });
    setErrors([]);
    setShowIdentityHelper(false);
    onClose();
  };

  const suggestIdentityFormat = () => {
    const randomExample = IDENTITY_EXAMPLES[Math.floor(Math.random() * IDENTITY_EXAMPLES.length)];
    setFormData(prev => ({ ...prev, name: `I am a person who ${randomExample}` }));
    setShowIdentityHelper(false);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Habit</DialogTitle>
      <DialogContent>
        {errors.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </Alert>
        )}

        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Habit Name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="I am a person who..."
            helperText="Use identity-based language for stronger habits"
            sx={{ mb: 1 }}
          />
          
          {!showIdentityHelper ? (
            <Button 
              size="small" 
              onClick={() => setShowIdentityHelper(true)}
              sx={{ textTransform: 'none' }}
            >
              Need help with identity-based wording?
            </Button>
          ) : (
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Try: "I am a person who walks for 10 minutes"
              </Typography>
              <Button size="small" onClick={suggestIdentityFormat}>
                Use Example
              </Button>
              <Button size="small" onClick={() => setShowIdentityHelper(false)}>
                Close
              </Button>
            </Box>
          )}
        </Box>

        <TextField
          fullWidth
          label="Trigger"
          value={formData.trigger}
          onChange={(e) => handleInputChange('trigger', e.target.value)}
          placeholder="After morning coffee"
          helperText="Link to an existing habit or event"
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Time"
            type="time"
            value={formData.time}
            onChange={(e) => handleInputChange('time', e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ flex: 1 }}
          />
          
          <TextField
            label="Location"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="Kitchen, gym, desk..."
            sx={{ flex: 1 }}
          />
        </Box>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Frequency</InputLabel>
          <Select
            value={formData.frequency}
            onChange={(e) => handleInputChange('frequency', e.target.value)}
          >
            <MenuItem value="daily">Daily</MenuItem>
            <MenuItem value="weekly">Weekly</MenuItem>
          </Select>
        </FormControl>

        {formData.frequency === 'weekly' && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Select Days
            </Typography>
            <FormGroup row>
              {WEEKDAYS.map(day => (
                <FormControlLabel
                  key={day.value}
                  control={
                    <Checkbox
                      checked={formData.weeklyDays.includes(day.value)}
                      onChange={() => handleWeeklyDayToggle(day.value)}
                    />
                  }
                  label={day.label}
                />
              ))}
            </FormGroup>
          </Box>
        )}

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Keep it small:</strong> Start with habits that take 2 minutes or less. 
            You can always build up once the identity is established.
          </Typography>
        </Alert>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Create Habit
        </Button>
      </DialogActions>
    </Dialog>
  );
}