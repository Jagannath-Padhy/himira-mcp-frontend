import { Box, Paper, Typography, useTheme, keyframes } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const wave = keyframes`
  0%, 100% { transform: translateY(0); }
  25% { transform: translateY(-2px); }
  50% { transform: translateY(2px); }
  75% { transform: translateY(-1px); }
`;

type MessageBubbleProps = {
  type: 'user' | 'bot';
  content: string;
  animated?: boolean; // when true, apply subtle execution animation for bot bubbles
};

export default function MessageBubble({ type, content, animated = false }: MessageBubbleProps) {
  const isUser = type === 'user';
  const theme = useTheme();

  const AnimatedWaveText = ({ text }: { text: string }) => (
    <Box component="span">
      {text.split('').map((ch, idx) => (
        <Box
          // eslint-disable-next-line react/no-array-index-key
          key={idx}
          component="span"
          sx={{
            display: 'inline-block',
            animation: `${wave} 1.8s ease-in-out infinite`,
            animationDelay: `${idx * 0.06}s`,
          }}
        >
          {ch === ' ' ? '\u00A0' : ch}
        </Box>
      ))}
    </Box>
  );

  return (
    <Box display="flex" justifyContent={isUser ? 'flex-end' : 'flex-start'} mt={3}>
      <Paper
        elevation={1}
        sx={{
          maxWidth: '75%',
          px: 2,
          py: 1,
          borderRadius: 2,
          bgcolor: isUser
            ? theme.palette.primary.main
            : animated
              ? 'transparent'
              : theme.palette.grey[100],
          color: isUser ? theme.palette.common.white : theme.palette.text.primary,
          // Animated gradient border for conversation chunks
          position: 'relative',
          ...(animated
            ? {
                border: '1px solid',
                borderColor: theme.palette.primary.light,
                backgroundImage:
                  'linear-gradient(90deg, rgba(25,118,210,0.06) 0%, rgba(25,118,210,0.12) 50%, rgba(25,118,210,0.06) 100%)',
                backgroundSize: '200% 100%',
                boxShadow: '0 2px 10px rgba(25,118,210,0.12)',
              }
            : {}),
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
          <Typography variant="body1">
            {animated ? <AnimatedWaveText text={content} /> : content}
          </Typography>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => (
                <Typography variant="body1" component="p" sx={{ lineHeight: 1.6 }}>
                  {animated ? <AnimatedWaveText text={String(children as unknown as string)} /> : children}
                </Typography>
              ),
              li: ({ children }) => (
                <Typography variant="body2" component="li" sx={{ lineHeight: 1.6 }}>
                  {animated ? <AnimatedWaveText text={String(children as unknown as string)} /> : children}
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
