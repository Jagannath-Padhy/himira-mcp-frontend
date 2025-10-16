import { Box, IconButton, Typography, Badge, Chip, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import { useNavigate } from 'react-router-dom';
import { logout } from '@lib';

type HeaderProps = {
  onMenuClick?: () => void;
  cartItemCount?: number;
  cartTotal?: number;
  onCartClick?: () => void;
};

export default function Header({
  onMenuClick,
  cartItemCount = 0,
  cartTotal = 0,
  onCartClick,
}: HeaderProps) {
  const formatPrice = (price: number) => `₹${price.toFixed(2)}`;
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
          ONDC MCP
        </Typography>
      </Box>

      {/* Cart Information */}
      <Box display="flex" alignItems="center" gap={2}>
        {cartItemCount > 0 && (
          <>
            <Chip
              label={`${cartItemCount} items • ${formatPrice(cartTotal)}`}
              color="primary"
              variant="outlined"
              size="small"
            />
            <IconButton
              color="inherit"
              onClick={onCartClick}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              }}
            >
              <Badge badgeContent={cartItemCount} color="error">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          </>
        )}
        <Tooltip title="Logout">
          <IconButton color="inherit" onClick={handleLogout}>
            <PowerSettingsNewIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
