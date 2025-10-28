import { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Paper, 
  Typography, 
  Stack, 
  TextField, 
  Alert, 
  IconButton, 
  InputAdornment,
  // Divider,
  CircularProgress,
  Fade,
} from '@mui/material';
import { 
  // Visibility, 
  // VisibilityOff, 
  Phone, 
  Google,
  ArrowBack,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { login } from '../../lib/auth';
import { useFirebaseAuth } from '../../hooks';
import { OTPInput } from '@components';
import { useUser } from '../../contexts/UserContext';

type LoginStep = 'method' | 'phone' | 'otp' | 'email';

export default function Login() {
  const [currentStep, setCurrentStep] = useState<LoginStep>('method');
  // Email Login => NOT USED FOR NOW 
  // const [email, setEmail] = useState('');
  // const [password, setPassword] = useState('');
  // const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('7351477479');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  
  const navigate = useNavigate();
  const { updateUserFromFirebase } = useUser();
  const {
    signInWithGoogle,
    googleLoading,
    sendOTP,
    verifyOTP,
    phoneLoading,
    error: firebaseError,
    clearError,
  } = useFirebaseAuth();

  // Timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpTimer > 0) {
      timer = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpTimer]);

  // Email Login => NOT USED FOR NOW 

  // const handleTogglePasswordVisibility = () => {
  //   setShowPassword(!showPassword);
  // };

  // const handleEmailLogin = () => {
  //   // Clear previous error
  //   setError('');
    
  //   // Static credentials
  //   const validEmail = 'ashish.jain@ondc.org';
  //   const validPassword = '12345';
    
  //   if (email === validEmail && password === validPassword) {
  //     // Use the auth.ts login function
  //     login();
  //     navigate('/');
  //   } else {
  //     setError('Invalid email or password. Please try again.');
  //   }
  // };

  const handleGoogleLogin = async () => {
    try {
      clearError();
      const user = await signInWithGoogle();
      
      // Store user data in context and localStorage
      updateUserFromFirebase(user);
      login();
      navigate('/');
    } catch (err) {
      console.error('Google login failed:', err);
      setError(firebaseError || 'Google login failed. Please try again.');
    }
  };

  const handlePhoneSubmit = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      clearError();
      const formattedPhone = `+91${phoneNumber}`;
      const result = await sendOTP(formattedPhone);
      setConfirmationResult(result);
      setCurrentStep('otp');
      setOtpTimer(120); // 2 minutes timer
    } catch (err) {
      console.error('OTP send failed:', err);
      setError(firebaseError || 'Failed to send OTP. Please try again.');
    }
  };

  const handleOTPSubmit = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }

    try {
      clearError();
      const user = await verifyOTP(confirmationResult, otp);
      
      // Store user data in context and localStorage
      updateUserFromFirebase(user);
      login();
      navigate('/');
    } catch (err) {
      console.error('OTP verification failed:', err);
      setError(firebaseError || 'Invalid OTP. Please try again.');
    }
  };

  const handleResendOTP = async () => {
    if (otpTimer > 0) return;
    
    try {
      clearError();
      const formattedPhone = `+91${phoneNumber}`;
      const result = await sendOTP(formattedPhone);
      setConfirmationResult(result);
      setOtpTimer(120);
      setOtp('');
    } catch (err) {
      console.error('OTP resend failed:', err);
      setError(firebaseError || 'Failed to resend OTP. Please try again.');
    }
  };

  const handleOTPChange = (otpValue: string) => {
    setOtp(otpValue);
    setError('');
  };

  const goBack = () => {
    if (currentStep === 'otp') {
      setCurrentStep('phone');
    } else if (currentStep === 'phone') {
      setCurrentStep('method');
    } else if (currentStep === 'email') {
      setCurrentStep('method');
    }
    setError('');
    clearError();
  };

  const renderMethodSelection = () => (
    <Stack spacing={2}>
      <Typography variant="h5" textAlign="center" fontWeight={600} mb={2}>
        Welcome Back
      </Typography>
      
      <Typography variant="body2" textAlign="center" color="text.secondary" mb={3}>
        Choose your preferred login method
      </Typography>

      <Button
        variant="outlined"
        fullWidth
        startIcon={<Phone />}
        onClick={() => setCurrentStep('phone')}
        sx={{
          py: 1.5,
          borderRadius: 2,
          fontSize: '1rem',
          fontWeight: 600,
        }}
      >
        Continue with Phone
      </Button>

      <Button
        variant="outlined"
        fullWidth
        startIcon={<Google />}
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        sx={{
          py: 1.5,
          borderRadius: 2,
          fontSize: '1rem',
          fontWeight: 600,
        }}
      >
        {googleLoading ? <CircularProgress size={20} /> : 'Continue with Google'}
      </Button>

      {/* <Divider sx={{ my: 2 }}>
        <Typography variant="body2" color="text.secondary">
          OR
        </Typography>
      </Divider>

      <Button
        variant="text"
        fullWidth
        onClick={() => setCurrentStep('email')}
        sx={{
          py: 1.5,
          borderRadius: 2,
          fontSize: '1rem',
          fontWeight: 600,
        }}
      >
        Use Email & Password
      </Button> */}
    </Stack>
  );

  const renderPhoneInput = () => (
    <Stack spacing={2}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <IconButton onClick={goBack} sx={{ mr: 1 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" fontWeight={600}>
          Enter Phone Number
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" mb={2}>
        We'll send you a verification code
      </Typography>

      <TextField
        fullWidth
        label="Phone Number"
        type="tel"
        value={phoneNumber}
        onChange={(e) => {
          const value = e.target.value.replace(/\D/g, '');
          if (value.length <= 10) {
            setPhoneNumber(value);
          }
        }}
        variant="outlined"
        InputProps={{
          startAdornment: <InputAdornment position="start">+91</InputAdornment>,
        }}
        placeholder="Enter 10-digit phone number"
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
          },
        }}
      />

      <Button
        variant="contained"
        fullWidth
        onClick={handlePhoneSubmit}
        disabled={phoneLoading || phoneNumber.length !== 10}
        sx={{
          py: 1.5,
          borderRadius: 2,
          fontSize: '1rem',
          fontWeight: 600,
        }}
      >
        {phoneLoading ? <CircularProgress size={20} /> : 'Send OTP'}
      </Button>
    </Stack>
  );

  const renderOTPInput = () => (
    <Stack spacing={2}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <IconButton onClick={goBack} sx={{ mr: 1 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" fontWeight={600}>
          Enter OTP
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" mb={2}>
        We've sent a 6-digit code to +91{phoneNumber}
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <OTPInput
          length={6}
          getFullOtp={handleOTPChange}
          disabled={phoneLoading}
        />
      </Box>

      <Button
        variant="contained"
        fullWidth
        onClick={handleOTPSubmit}
        disabled={phoneLoading || otp.length !== 6}
        sx={{
          py: 1.5,
          borderRadius: 2,
          fontSize: '1rem',
          fontWeight: 600,
        }}
      >
        {phoneLoading ? <CircularProgress size={20} /> : 'Verify OTP'}
      </Button>

      <Box sx={{ textAlign: 'center' }}>
        <Button
          variant="text"
          onClick={handleResendOTP}
          disabled={phoneLoading || otpTimer > 0}
          sx={{
            fontSize: '0.875rem',
            textTransform: 'none',
          }}
        >
        
      
          {otpTimer > 0 ? (
            `Resend OTP in ${Math.floor(otpTimer / 60)}:${String(otpTimer % 60).padStart(2, '0')}`
          ) : (
            'Resend OTP'
          )}
        </Button>
      </Box>
    </Stack>
  );

  // Email Login => NOT USED FOR NOW 

  // const renderEmailLogin = () => (
  //   <Stack spacing={2}>
  //     <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
  //       <IconButton onClick={goBack} sx={{ mr: 1 }}>
  //         <ArrowBack />
  //       </IconButton>
  //       <Typography variant="h5" fontWeight={600}>
  //         Email Login
  //       </Typography>
  //     </Box>

  //     <TextField
  //       fullWidth
  //       label="Email"
  //       type="email"
  //       value={email}
  //       onChange={(e) => setEmail(e.target.value)}
  //       variant="outlined"
  //       sx={{
  //         '& .MuiOutlinedInput-root': {
  //           borderRadius: 2,
  //         },
  //       }}
  //     />
      
  //     <TextField
  //       fullWidth
  //       label="Password"
  //       type={showPassword ? 'text' : 'password'}
  //       value={password}
  //       onChange={(e) => setPassword(e.target.value)}
  //       variant="outlined"
  //       InputProps={{
  //         endAdornment: (
  //           <InputAdornment position="end">
  //             <IconButton
  //               aria-label="toggle password visibility"
  //               onClick={handleTogglePasswordVisibility}
  //               edge="end"
  //               sx={{ color: 'text.secondary' }}
  //             >
  //               {showPassword ? <VisibilityOff /> : <Visibility />}
  //             </IconButton>
  //           </InputAdornment>
  //         ),
  //       }}
  //       sx={{
  //         '& .MuiOutlinedInput-root': {
  //           borderRadius: 2,
  //         },
  //       }}
  //     />
      
  //     <Button
  //       variant="contained"
  //       fullWidth
  //       onClick={handleEmailLogin}
  //       disabled={!email || !password}
  //       sx={{
  //         py: 1.5,
  //         borderRadius: 2,
  //         fontSize: '1rem',
  //         fontWeight: 600,
  //       }}
  //     >
  //       Login
  //     </Button>
  //   </Stack>
  // );

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      bgcolor="background.default"
    >
      <Paper sx={{ p: 4, width: 410, borderRadius: 2 }} elevation={3}>
        <Fade in={true}>
          <Box>
            {(error || firebaseError) && (
              <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>
                {error || firebaseError}
              </Alert>
            )}

            {currentStep === 'method' && renderMethodSelection()}
            {currentStep === 'phone' && renderPhoneInput()}
            {currentStep === 'otp' && renderOTPInput()}
            {/* {currentStep === 'email' && renderEmailLogin()} */}
          </Box>
        </Fade>

        {/* ReCAPTCHA container */}
        <div id="recaptcha" style={{ display: 'none' }}></div>
      </Paper>
    </Box>
  );
}
