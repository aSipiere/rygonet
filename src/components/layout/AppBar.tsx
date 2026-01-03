import { AppBar as MuiAppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { APP_NAME } from '@utils/constants';
import { SettingsMenu } from '@components/common/SettingsMenu';

export function AppBar() {
  return (
    <MuiAppBar position="static">
      <Toolbar sx={{ py: 1 }}>
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
            }}
          >
            {APP_NAME.toUpperCase()}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              letterSpacing: '0.1em',
              fontSize: '0.7rem',
            }}
          >
            198X ARMY ROSTER SYSTEM v1.0
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button
            color="inherit"
            component={RouterLink}
            to="/"
            sx={{
              color: 'primary.main',
              fontSize: '0.85rem',
              px: 2,
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
              fontSize: '0.85rem',
              px: 2,
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
              fontSize: '0.85rem',
              px: 2,
              '&:hover': {
                backgroundColor: (theme) => `${theme.palette.primary.main}1A`,
              },
            }}
          >
            [FACTIONS]
          </Button>
          <SettingsMenu />
        </Box>
      </Toolbar>
    </MuiAppBar>
  );
}
