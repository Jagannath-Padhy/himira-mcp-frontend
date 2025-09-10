import { useState } from 'react';
import { Box, Button, Paper, Typography, Stack } from '@mui/material';
import { MuiTelInput, matchIsValidTel } from 'mui-tel-input';
import { MuiOtpInput } from 'mui-one-time-password-input';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();

  const handleSendOtp = () => {
    if (!matchIsValidTel(phone)) return;
    // mock sending OTP
    setOtpSent(true);
  };

  const handleVerifyOtp = () => {
    if (otp.length !== 6) return;
    // ✅ Save auth before navigating
    localStorage.setItem('auth', 'true');
    navigate('/');
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      bgcolor="background.default"
    >
      <Paper sx={{ p: 4, width: 360, borderRadius: 2 }} elevation={3}>
        <Typography variant="h5" mb={3} textAlign="center" fontWeight={600}>
          Welcome Back
        </Typography>

        {!otpSent ? (
          <Stack spacing={2}>
            <MuiTelInput
              value={phone}
              onChange={setPhone}
              defaultCountry="IN"
              fullWidth
              forceCallingCode
              label="Phone Number"
              helperText={phone && !matchIsValidTel(phone) ? 'Enter a valid phone number' : ''}
              error={phone.length > 0 && !matchIsValidTel(phone)}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleSendOtp}
              disabled={!matchIsValidTel(phone)}
            >
              Send OTP
            </Button>
          </Stack>
        ) : (
          <Stack spacing={2}>
            <MuiOtpInput
              value={otp}
              onChange={setOtp}
              length={6}
              gap={1}
              TextFieldsProps={{
                size: 'small',
                sx: {
                  '& .MuiOutlinedInput-root': {
                    width: '100%',
                    height: 50,
                    borderRadius: 2,
                  },
                  '& .MuiInputBase-input': {
                    p: 0,
                    textAlign: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    lineHeight: '56px',
                  },
                },
              }}
            />

            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleVerifyOtp}
              disabled={otp.length !== 6}
            >
              Verify OTP
            </Button>
            <Button
              variant="text"
              fullWidth
              onClick={() => {
                setOtpSent(false);
                setOtp('');
              }}
            >
              Change Phone Number
            </Button>
          </Stack>
        )}
      </Paper>
    </Box>
  );
}
