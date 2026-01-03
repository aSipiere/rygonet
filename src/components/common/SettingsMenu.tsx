import { useState } from 'react';
import { Box, IconButton, Menu, MenuItem, FormControlLabel, Switch, Divider as MuiDivider } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { useSettings, ColorTheme } from '@/contexts/SettingsContext';
import { COLOR_THEMES } from '@/theme/colorThemes';

export function SettingsMenu() {
  const { settings, toggleScanlines, setColorTheme } = useSettings();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleThemeChange = (theme: ColorTheme) => {
    setColorTheme(theme);
    handleClose();
  };

  return (
    <Box>
      <IconButton
        onClick={handleClick}
        sx={{
          color: 'primary.main',
          padding: { xs: 1, sm: 1, md: 1 },
          '&:hover': {
            backgroundColor: 'rgba(46, 127, 255, 0.1)',
          },
        }}
      >
        <SettingsIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.3rem', md: '1.5rem' } }} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 20, 0.95)',
            border: '1px solid',
            borderColor: 'primary.main',
            boxShadow: '0 0 20px rgba(46, 127, 255, 0.3)',
            fontFamily: 'monospace',
            minWidth: { xs: '200px', sm: '240px', md: '280px' },
            maxWidth: { xs: '90vw', sm: '400px' },
          },
        }}
      >
        <Box sx={{ px: { xs: 1.5, sm: 2 }, py: { xs: 1, sm: 1.5 } }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.scanlinesEnabled}
                onChange={toggleScanlines}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: 'primary.main',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: 'primary.main',
                  },
                }}
              />
            }
            label="CRT Scanlines"
            sx={{
              color: 'text.primary',
              fontFamily: 'monospace',
              '& .MuiFormControlLabel-label': {
                fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' },
              },
            }}
          />
        </Box>

        <MuiDivider sx={{ borderColor: 'primary.main', opacity: 0.3, my: 1 }} />

        <Box sx={{ px: { xs: 1.5, sm: 2 }, py: { xs: 1, sm: 1.5 } }}>
          <Box sx={{ color: 'text.secondary', fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' }, mb: 1, textTransform: 'uppercase' }}>
            Color Theme
          </Box>
          {(Object.keys(COLOR_THEMES) as ColorTheme[]).map((themeKey) => (
            <MenuItem
              key={themeKey}
              onClick={() => handleThemeChange(themeKey)}
              selected={settings.colorTheme === themeKey}
              sx={{
                fontFamily: 'monospace',
                fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem' },
                color: 'text.primary',
                minHeight: { xs: '44px', sm: '40px' },
                px: { xs: 1, sm: 1.5 },
                '&.Mui-selected': {
                  backgroundColor: 'rgba(46, 127, 255, 0.2)',
                  '&:hover': {
                    backgroundColor: 'rgba(46, 127, 255, 0.3)',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(46, 127, 255, 0.1)',
                },
              }}
            >
              {settings.colorTheme === themeKey && '> '}
              {COLOR_THEMES[themeKey].name}
            </MenuItem>
          ))}
        </Box>
      </Menu>
    </Box>
  );
}
