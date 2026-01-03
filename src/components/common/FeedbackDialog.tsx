import { useState } from 'react';
import {
  Dialog,
  Box,
  Typography,
  Stack,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { TerminalBox } from './TerminalBox';
import { Divider } from './Divider';

interface FeedbackDialogProps {
  open: boolean;
  onClose: () => void;
}

export function FeedbackDialog({ open, onClose }: FeedbackDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('bug');
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/.netlify/functions/create-feedback-issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          category,
          userEmail: userEmail || undefined,
          url: window.location.href,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit feedback');
      }

      setSuccess(true);
      // Reset form after 2 seconds and close dialog
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setCategory('bug');
    setUserEmail('');
    setError(null);
    setSuccess(false);
    onClose();
  };

  const isFormValid = title.trim() && description.trim();

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: 'background.paper',
          boxShadow: 'none',
          margin: { xs: 1, sm: 2 },
          maxHeight: { xs: '95vh', sm: '90vh' },
        },
      }}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
          },
        },
      }}
    >
      <TerminalBox title="SUBMIT FEEDBACK" variant="heavy">
        {success ? (
          <Box sx={{ textAlign: 'center', py: { xs: 2, sm: 3 } }}>
            <Typography
              variant="h6"
              sx={{
                color: 'success.main',
                fontFamily: 'monospace',
                mb: 1,
                fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' },
              }}
            >
              ✓ FEEDBACK SUBMITTED
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontFamily: 'monospace',
                fontSize: { xs: '0.75rem', sm: '0.85rem' },
              }}
            >
              Thank you! Your feedback has been recorded as a GitHub issue.
            </Typography>
          </Box>
        ) : (
          <>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                mb: { xs: 1.5, sm: 2 },
                fontFamily: 'monospace',
                fontSize: { xs: '0.75rem', sm: '0.85rem' },
              }}
            >
              &gt; Report bugs, request features, or share feedback
            </Typography>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: { xs: 1.5, sm: 2 },
                  fontFamily: 'monospace',
                  fontSize: { xs: '0.75rem', sm: '0.85rem' },
                }}
              >
                {error}
              </Alert>
            )}

            <Stack spacing={{ xs: 1.5, sm: 2 }}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontSize: { xs: '0.85rem', sm: '1rem' } }}>Category</InputLabel>
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  label="Category"
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: { xs: '0.85rem', sm: '0.95rem' },
                  }}
                >
                  <MenuItem value="bug" sx={{ fontFamily: 'monospace', fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
                    Bug Report
                  </MenuItem>
                  <MenuItem value="feature" sx={{ fontFamily: 'monospace', fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
                    Feature Request
                  </MenuItem>
                  <MenuItem value="improvement" sx={{ fontFamily: 'monospace', fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
                    Improvement
                  </MenuItem>
                  <MenuItem value="question" sx={{ fontFamily: 'monospace', fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
                    Question
                  </MenuItem>
                  <MenuItem value="other" sx={{ fontFamily: 'monospace', fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
                    Other
                  </MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
                required
                placeholder="Brief summary of your feedback"
                sx={{
                  '& input': {
                    fontFamily: 'monospace',
                    fontSize: { xs: '0.85rem', sm: '0.95rem' },
                  },
                  '& label': {
                    fontSize: { xs: '0.85rem', sm: '1rem' },
                  },
                }}
              />

              <TextField
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                required
                multiline
                rows={4}
                placeholder="Provide details about your feedback..."
                sx={{
                  '& textarea': {
                    fontFamily: 'monospace',
                    fontSize: { xs: '0.85rem', sm: '0.95rem' },
                  },
                  '& label': {
                    fontSize: { xs: '0.85rem', sm: '1rem' },
                  },
                }}
              />

              <TextField
                label="Email (optional)"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                fullWidth
                type="email"
                placeholder="For follow-up (optional)"
                sx={{
                  '& input': {
                    fontFamily: 'monospace',
                    fontSize: { xs: '0.85rem', sm: '0.95rem' },
                  },
                  '& label': {
                    fontSize: { xs: '0.85rem', sm: '1rem' },
                  },
                }}
              />

              <Divider variant="simple" />

              <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 } }}>
                <Button
                  onClick={handleClose}
                  disabled={loading}
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' },
                    minHeight: { xs: '44px', sm: '40px' },
                  }}
                  fullWidth
                >
                  CANCEL
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={!isFormValid || loading}
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' },
                    minHeight: { xs: '44px', sm: '40px' },
                  }}
                  fullWidth
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'SUBMIT'
                  )}
                </Button>
              </Box>
            </Stack>
          </>
        )}
      </TerminalBox>
    </Dialog>
  );
}
