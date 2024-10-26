import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Hedra UI
        </Typography>
        <Box>
          <Button
            color="inherit"
            component={RouterLink}
            to="/"
          >
            Character Creator
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/voice-manager"
          >
            Voice Manager
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/ai-workshop"
          >
            AI Workshop
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/chat"
          >
            Chat
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
