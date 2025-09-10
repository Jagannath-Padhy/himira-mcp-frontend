import { Box, Paper, Typography, useTheme } from '@mui/material';

type MessageBubbleProps = {
  type: 'user' | 'bot';
  content: string;
};

export default function MessageBubble({ type, content }: MessageBubbleProps) {
  const isUser = type === 'user';
  const theme = useTheme();

  return (
    <Box display="flex" justifyContent={isUser ? 'flex-end' : 'flex-start'}>
      <Paper
        elevation={1}
        sx={{
          maxWidth: '75%',
          px: 2,
          py: 1,
          borderRadius: 2,
          bgcolor: theme.palette.primary.main,
          color: theme.palette.common.white,
        }}
      >
        <Typography variant="body1">{content}</Typography>
      </Paper>
    </Box>
  );
}
