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
          '&:hover': {
            backgroundColor: 'rgba(46, 127, 255, 0.1)',
          },
        }}
      >
        <SettingsIcon />
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
          },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
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
                fontSize: '0.9rem',
              },
            }}
          />
        </Box>

        <MuiDivider sx={{ borderColor: 'primary.main', opacity: 0.3, my: 1 }} />

        <Box sx={{ px: 2, py: 1 }}>
          <Box sx={{ color: 'text.secondary', fontSize: '0.75rem', mb: 1, textTransform: 'uppercase' }}>
            Color Theme
          </Box>
          {(Object.keys(COLOR_THEMES) as ColorTheme[]).map((themeKey) => (
            <MenuItem
              key={themeKey}
              onClick={() => handleThemeChange(themeKey)}
              selected={settings.colorTheme === themeKey}
              sx={{
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                color: 'text.primary',
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
