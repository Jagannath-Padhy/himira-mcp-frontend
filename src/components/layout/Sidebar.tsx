import {
  Avatar,
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
  ListItemIcon,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import { useState } from 'react';
import { useDesignSystem } from '@hooks';
import type { ChatSession } from '@interfaces';

type SidebarProps = {
  chats: ChatSession[];
  activeChatId: string;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onSwitch: (id: string) => void;
};

export default function Sidebar({
  chats,
  activeChatId,
  onCreate,
  onDelete,
  onSwitch,
}: SidebarProps) {
  const { mode, setMode } = useDesignSystem();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.removeItem('auth');
    window.location.reload();
  };

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Box p={2}>
        <ListItemButton
          onClick={onCreate}
          sx={{
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            borderRadius: 2,
            fontWeight: 600,
            justifyContent: 'center',
            '&:hover': { bgcolor: 'primary.dark' },
          }}
        >
          + New Chat
        </ListItemButton>
      </Box>

      <Divider />

      <Box flexGrow={1} overflow="auto">
        <List disablePadding>
          {chats.map((chat) => (
            <ListItemButton
              key={chat.id}
              selected={chat.id === activeChatId}
              onClick={() => onSwitch(chat.id)}
              sx={{ display: 'flex', justifyContent: 'space-between' }}
            >
              <ListItemText
                primary={
                  <Typography variant="body2" noWrap>
                    {chat.title}
                  </Typography>
                }
              />
              <DeleteIcon
                fontSize="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(chat.id);
                }}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>

      <Divider />

      <Box p={1}>
        <ListItemButton
          onClick={handleOpen}
          sx={{
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Avatar
            alt="John Doe"
            src="https://wallpapers.com/images/high/yellow-monochrome-luffy-pfp-no-face-digital-art-0unovrqnxiroytqn.webp"
          />
          <Typography variant="body2" fontWeight={500}>
            John Doe
          </Typography>
        </ListItemButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{
            elevation: 4,
            sx: { borderRadius: 2, minWidth: 220, p: 1 },
          }}
        >
          <Box px={2} py={1} display="flex" alignItems="center" gap={1.5}>
            <Avatar
              alt="John Doe"
              src="https://wallpapers.com/images/high/yellow-monochrome-luffy-pfp-no-face-digital-art-0unovrqnxiroytqn.webp"
            />
            <Box>
              <Typography variant="body2" fontWeight={600}>
                John Doe
              </Typography>
              <Typography variant="caption" color="text.secondary">
                john@example.com
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 1 }} />

          <MenuItem
            onClick={() => {
              setMode(mode === 'light' ? 'dark' : 'light');
              handleClose();
            }}
          >
            <ListItemIcon>
              {mode === 'light' ? (
                <DarkModeIcon fontSize="small" />
              ) : (
                <LightModeIcon fontSize="small" />
              )}
            </ListItemIcon>
            <ListItemText>{mode === 'light' ? 'Dark Mode' : 'Light Mode'}</ListItemText>
          </MenuItem>

          <MenuItem onClick={handleClose}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Profile</ListItemText>
          </MenuItem>

          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Logout</ListItemText>
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}
