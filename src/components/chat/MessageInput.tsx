import { IconButton, Paper } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useState } from 'react';
import { TextField } from '@components';

type MessageInputProps = {
  onSend: (message: string) => void;
};

export default function MessageInput({ onSend }: MessageInputProps) {
  const [value, setValue] = useState('');

  const handleSend = () => {
    if (!value.trim()) return;
    onSend(value.trim());
    setValue('');
  };

  return (
    <Paper elevation={2} sx={{ display: 'flex', alignItems: 'center' }}>
      <TextField
        fullWidth
        placeholder="Type your message..."
        variant="outlined"
        size="small"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        slotProps={{
          input: {
            endAdornment: (
              <IconButton color="primary" onClick={handleSend} disabled={!value.trim()}>
                <SendIcon />
              </IconButton>
            ),
          },
        }}
      />
    </Paper>
  );
}
