import { Box, Paper, Typography, useTheme } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
          bgcolor: isUser ? theme.palette.primary.main : theme.palette.grey[100],
          color: isUser ? theme.palette.common.white : theme.palette.text.primary,
          '& p': {
            margin: '0.5em 0',
            '&:first-of-type': {
              marginTop: 0,
            },
            '&:last-child': {
              marginBottom: 0,
            },
          },
          '& ul, & ol': {
            margin: '0.5em 0',
            paddingLeft: '1.5em',
          },
          '& li': {
            margin: '0.25em 0',
          },
          '& strong': {
            fontWeight: 600,
          },
          '& em': {
            fontStyle: 'italic',
          },
        }}
      >
        {isUser ? (
          <Typography variant="body1">{content}</Typography>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => (
                <Typography variant="body1" component="p" sx={{ lineHeight: 1.6 }}>
                  {children}
                </Typography>
              ),
              li: ({ children }) => (
                <Typography variant="body2" component="li" sx={{ lineHeight: 1.6 }}>
                  {children}
                </Typography>
              ),
              strong: ({ children }) => (
                <Box component="strong" sx={{ fontWeight: 600 }}>
                  {children}
                </Box>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        )}
      </Paper>
    </Box>
  );
}
