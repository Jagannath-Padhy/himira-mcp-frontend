import React, { useEffect, useRef, useState } from 'react';
import { Box, TextField } from '@mui/material';

interface OTPInputProps {
  length?: number;
  getFullOtp: (otp: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  resetOtp?: boolean;
  setResetOtp?: (reset: boolean) => void;
  disabled?: boolean;
}

const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  getFullOtp,
  onKeyDown,
  resetOtp = false,
  setResetOtp,
  disabled = false,
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resetOtp) {
      setOtp(new Array(length).fill(''));
      inputRefs.current[0]?.focus();
      setResetOtp?.(false);
    }
  }, [resetOtp, length, setResetOtp]);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;
    
    if (value.length >= length) {
      const otpArray = value.slice(0, length).split('');
      setOtp(otpArray);
      getFullOtp(otpArray.join(''));
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    const combinedOtp = newOtp.join('');
    if (combinedOtp.length === length) getFullOtp(combinedOtp);

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('Text').trim();
    if (!/^\d+$/.test(pasteData)) return;

    const otpArray = pasteData.slice(0, length).split('');
    setOtp(otpArray);
    getFullOtp(otpArray.join(''));
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }

    if (index === length - 1 && e.key === 'Enter' && onKeyDown) {
      onKeyDown(e as React.KeyboardEvent<HTMLInputElement>);
    }
  };

  const handleClick = (index: number) => {
    inputRefs.current[index]?.setSelectionRange(1, 1);
    if (index > 0 && !otp[index - 1]) {
      const emptyIndex = otp.indexOf('');
      if (emptyIndex !== -1) inputRefs.current[emptyIndex]?.focus();
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      {otp.map((value, index) => (
        <TextField
          key={index}
          inputRef={(el) => {
            inputRefs.current[index] = el;
          }}
          type="tel"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="-"
          value={value}
          onChange={(e) => handleChange(index, e)}
          onPaste={handlePaste}
          onClick={() => handleClick(index)}
          onKeyDown={(e) => handleKeyDown(index, e as React.KeyboardEvent<HTMLInputElement>)}
          disabled={disabled}
          name={`otp-${index}`}
          sx={{
            width: 50,
            height: 50,
            '& .MuiOutlinedInput-root': {
              height: 50,
              textAlign: 'center',
              fontSize: '1.5rem',
              fontWeight: 600,
              borderRadius: 2,
              '& input': {
                padding: 0,
                textAlign: 'center',
              },
            },
            '& .MuiInputBase-input': {
              padding: 0,
            },
          }}
          inputProps={{
            maxLength: 1,
            style: { textAlign: 'center' },
          }}
        />
      ))}
    </Box>
  );
};

export default OTPInput;
