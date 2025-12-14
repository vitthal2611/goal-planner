import React, { useState } from 'react';
import { Card, CardContent, CardActions, IconButton, Button, Box } from '@mui/material';
import { Edit, Check, Close } from '@mui/icons-material';

/**
 * Reusable editable card pattern
 * Handles view/edit mode toggle with draft state
 */
export const EditableCard = ({ 
  children, 
  onSave, 
  onCancel,
  renderView,
  renderEdit,
  elevation = 2,
  sx = {}
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(null);

  const handleEdit = () => {
    setIsEditing(true);
    setDraft({});
  };

  const handleSave = async () => {
    try {
      await onSave(draft);
      setIsEditing(false);
      setDraft(null);
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setDraft(null);
    onCancel?.();
  };

  return (
    <Card elevation={elevation} sx={{ position: 'relative', ...sx }}>
      {!isEditing && (
        <IconButton
          onClick={handleEdit}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 1,
            bgcolor: 'background.paper',
            '&:hover': { bgcolor: 'primary.50' }
          }}
        >
          <Edit />
        </IconButton>
      )}

      <CardContent>
        {isEditing ? renderEdit(draft, setDraft) : renderView()}
      </CardContent>

      {isEditing && (
        <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
          <Button
            startIcon={<Close />}
            onClick={handleCancel}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            startIcon={<Check />}
            onClick={handleSave}
            variant="contained"
          >
            Save
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

/**
 * Inline editable field pattern
 */
export const InlineEdit = ({
  value,
  onSave,
  renderView,
  renderEdit,
  sx = {}
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const handleSave = () => {
    onSave(draft);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ...sx }}>
        {renderEdit(draft, setDraft)}
        <IconButton size="small" onClick={handleSave} color="primary">
          <Check />
        </IconButton>
        <IconButton size="small" onClick={handleCancel}>
          <Close />
        </IconButton>
      </Box>
    );
  }

  return (
    <Box 
      onClick={() => setIsEditing(true)}
      sx={{ 
        cursor: 'pointer',
        '&:hover': { bgcolor: 'action.hover' },
        borderRadius: 1,
        p: 0.5,
        ...sx
      }}
    >
      {renderView(value)}
    </Box>
  );
};
