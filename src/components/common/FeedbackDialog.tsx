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
          backgroundColor: 'transparent',
          boxShadow: 'none',
        },
      }}
    >
      <TerminalBox title="SUBMIT FEEDBACK" variant="heavy">
        {success ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography
              variant="h6"
              sx={{ color: 'success.main', fontFamily: 'monospace', mb: 1 }}
            >
              ✓ FEEDBACK SUBMITTED
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', fontFamily: 'monospace' }}
            >
              Thank you! Your feedback has been recorded as a GitHub issue.
            </Typography>
          </Box>
        ) : (
          <>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', mb: 2, fontFamily: 'monospace' }}
            >
              &gt; Report bugs, request features, or share feedback
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2, fontFamily: 'monospace' }}>
                {error}
              </Alert>
            )}

            <Stack spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  label="Category"
                  sx={{ fontFamily: 'monospace' }}
                >
                  <MenuItem value="bug" sx={{ fontFamily: 'monospace' }}>
                    Bug Report
                  </MenuItem>
                  <MenuItem value="feature" sx={{ fontFamily: 'monospace' }}>
                    Feature Request
                  </MenuItem>
                  <MenuItem value="improvement" sx={{ fontFamily: 'monospace' }}>
                    Improvement
                  </MenuItem>
                  <MenuItem value="question" sx={{ fontFamily: 'monospace' }}>
                    Question
                  </MenuItem>
                  <MenuItem value="other" sx={{ fontFamily: 'monospace' }}>
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
                sx={{ '& input': { fontFamily: 'monospace' } }}
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
                sx={{ '& textarea': { fontFamily: 'monospace' } }}
              />

              <TextField
                label="Email (optional)"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                fullWidth
                type="email"
                placeholder="For follow-up (optional)"
                sx={{ '& input': { fontFamily: 'monospace' } }}
              />

              <Divider variant="simple" />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  onClick={handleClose}
                  disabled={loading}
                  sx={{ fontFamily: 'monospace' }}
                  fullWidth
                >
                  CANCEL
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={!isFormValid || loading}
                  sx={{ fontFamily: 'monospace' }}
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
