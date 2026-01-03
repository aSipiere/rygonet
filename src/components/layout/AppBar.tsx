import { useState } from 'react';
import { AppBar as MuiAppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import FeedbackIcon from '@mui/icons-material/Feedback';
import { APP_NAME } from '@utils/constants';
import { SettingsMenu } from '@components/common/SettingsMenu';
import { FeedbackDialog } from '@components/common/FeedbackDialog';

export function AppBar() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <MuiAppBar position="static">
      <Toolbar sx={{ py: { xs: 0.5, sm: 0.75, md: 1 } }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              textDecoration: 'none',
              color: 'primary.main',
              fontWeight: 700,
              letterSpacing: '0.15em',
              display: 'block',
              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' },
            }}
          >
            {APP_NAME.toUpperCase()}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              letterSpacing: '0.1em',
              fontSize: { xs: '0.5rem', sm: '0.6rem', md: '0.7rem' },
              display: { xs: 'none', sm: 'block' },
            }}
          >
            198X ARMY ROSTER SYSTEM v1.0
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 0.75, md: 1 }, alignItems: 'center' }}>
          <Button
            color="inherit"
            component={RouterLink}
            to="/"
            sx={{
              color: 'primary.main',
              fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.85rem' },
              px: { xs: 0.5, sm: 1, md: 2 },
              minWidth: { xs: 'auto', sm: '64px' },
              '&:hover': {
                backgroundColor: (theme) => `${theme.palette.primary.main}1A`,
              },
            }}
          >
            [HOME]
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/builder"
            sx={{
              color: 'primary.main',
              fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.85rem' },
              px: { xs: 0.5, sm: 1, md: 2 },
              minWidth: { xs: 'auto', sm: '64px' },
              '&:hover': {
                backgroundColor: (theme) => `${theme.palette.primary.main}1A`,
              },
            }}
          >
            [BUILDER]
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/factions"
            sx={{
              color: 'primary.main',
              fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.85rem' },
              px: { xs: 0.5, sm: 1, md: 2 },
              minWidth: { xs: 'auto', sm: '64px' },
              '&:hover': {
                backgroundColor: (theme) => `${theme.palette.primary.main}1A`,
              },
            }}
          >
            [FACTIONS]
          </Button>
          <Button
            color="inherit"
            onClick={() => setFeedbackOpen(true)}
            startIcon={<FeedbackIcon sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' } }} />}
            sx={{
              color: 'primary.main',
              fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.85rem' },
              px: { xs: 0.5, sm: 1, md: 2 },
              minWidth: { xs: 'auto', sm: '64px' },
              '&:hover': {
                backgroundColor: (theme) => `${theme.palette.primary.main}1A`,
              },
            }}
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              [FEEDBACK]
            </Box>
            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
              [FB]
            </Box>
          </Button>
          <SettingsMenu />
        </Box>
      </Toolbar>
      <FeedbackDialog open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </MuiAppBar>
  );
}
