import { Typography, Box } from '@mui/material';
import { useParams } from 'react-router-dom';

export default function PrintPage() {
  const { rosterId } = useParams();

  return (
    <Box>
      <Typography variant="h3" gutterBottom>
        Print Roster
      </Typography>
      <Typography>Print view for roster {rosterId}</Typography>
    </Box>
  );
}
