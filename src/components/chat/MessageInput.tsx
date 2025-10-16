import { IconButton, Paper, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useState } from 'react';
import { TextField } from '@components';

type MessageInputProps = {
  onSend: (message: string) => void;
  isLoading?: boolean;
};

export default function MessageInput({ onSend, isLoading = false }: MessageInputProps) {
  const [value, setValue] = useState('');

  const handleSend = () => {
    if (!value.trim() || isLoading) return;
    onSend(value.trim());
    setValue('');
  };

  return (
    <Paper elevation={2} sx={{ display: 'flex', alignItems: 'center' }}>
      <TextField
        fullWidth
        placeholder={isLoading ? "Searching..." : "Type your message..."}
        variant="outlined"
        size="small"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={isLoading}
        sx={{
          cursor: isLoading ? 'not-allowed' : 'text',
          '& .MuiInputBase-root': {
            cursor: isLoading ? 'not-allowed' : 'text',
          },
          '& .MuiInputBase-input': {
            cursor: isLoading ? 'not-allowed' : 'text',
          },
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        slotProps={{
          input: {
            endAdornment: (
              <IconButton
                color="primary"
                onClick={handleSend}
                disabled={!value.trim() || isLoading}
              >
                {isLoading ? <CircularProgress size={20} /> : <SendIcon />}
              </IconButton>
            ),
          },
        }}
      />
    </Paper>
  );
}
