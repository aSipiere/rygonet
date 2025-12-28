import { Typography, Box, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
      }}
    >
      <Typography variant="h1" gutterBottom>
        404
      </Typography>
      <Typography variant="h5" gutterBottom>
        Page Not Found
      </Typography>
      <Typography variant="body1" paragraph>
        The page you're looking for doesn't exist.
      </Typography>
      <Button variant="contained" component={RouterLink} to="/">
        Go Home
      </Button>
    </Box>
  );
}
