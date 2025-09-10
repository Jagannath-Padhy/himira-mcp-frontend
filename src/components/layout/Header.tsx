import { Box, IconButton, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

type HeaderProps = {
  onMenuClick?: () => void;
};

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
      <Box display="flex" alignItems="center" gap={1}>
        {/* Hamburger only on mobile */}
        <IconButton
          edge="start"
          color="inherit"
          sx={{ display: { xs: 'inline-flex', md: 'none' } }}
          onClick={onMenuClick}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" fontWeight={600}>
          Shopping Assistant
        </Typography>
      </Box>
    </Box>
  );
}
