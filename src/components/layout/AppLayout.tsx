import { ReactNode } from 'react';
import { Box, Drawer } from '@mui/material';

type AppLayoutProps = {
  sidebar: ReactNode;
  header: ReactNode;
  children: ReactNode;
  mobileSidebarOpen?: boolean;
  onCloseMobileSidebar?: () => void;
};

export default function AppLayout({
  sidebar,
  header,
  children,
  mobileSidebarOpen = false,
  onCloseMobileSidebar,
}: AppLayoutProps) {
  return (
    <Box display="flex" height="100vh" width="100vw">
      {/* Desktop Sidebar */}
      {/* <Box
        component="aside"
        sx={{
          width: 280,
          borderRight: 1,
          borderColor: 'divider',
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          bgcolor: 'background.paper',
        }}
      >
        {sidebar}
      </Box> */}

      {/* Mobile Sidebar Drawer */}
      <Drawer
        open={mobileSidebarOpen}
        onClose={onCloseMobileSidebar}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: 280 },
        }}
      >
        {sidebar}
      </Drawer>

      {/* Main Area */}
      <Box display="flex" flexDirection="column" flexGrow={1}>
        <Box
          component="header"
          sx={{
            height: 70,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            bgcolor: 'background.paper',
          }}
        >
          {header}
        </Box>

        <Box component="main" flexGrow={1} overflow="hidden">
          {children}
        </Box>
      </Box>
    </Box>
  );
}
