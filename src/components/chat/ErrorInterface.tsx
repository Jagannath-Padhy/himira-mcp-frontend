import { Box, Card, CardContent, Typography, Button, Alert, Stack, Chip } from '@mui/material';
import { Error, Refresh, Support, Home } from '@mui/icons-material';
import { ErrorData } from '@interfaces';

type ErrorInterfaceProps = {
  error: ErrorData;
  onSend: (msg: string) => void;
};

const ErrorInterface = ({ error, onSend }: ErrorInterfaceProps) => {
  const getErrorIcon = (errorType: string) => {
    switch (errorType) {
      case 'validation_error':
        return <Error color="warning" />;
      case 'session_error':
        return <Home color="error" />;
      case 'backend_error':
        return <Error color="error" />;
      default:
        return <Error color="error" />;
    }
  };

  const getErrorSeverity = (errorType: string): 'error' | 'warning' | 'info' => {
    switch (errorType) {
      case 'validation_error':
        return 'warning';
      case 'session_error':
        return 'error';
      case 'backend_error':
        return 'error';
      default:
        return 'error';
    }
  };

  const getRecoveryButton = (recoveryAction?: string) => {
    switch (recoveryAction) {
      case 'retry_operation':
        return (
          <Button
            variant="contained"
            color="primary"
            startIcon={<Refresh />}
            onClick={() => onSend('try again')}
          >
            Try Again
          </Button>
        );
      case 'reinitialize_session':
        return (
          <Button
            variant="contained"
            color="primary"
            startIcon={<Home />}
            onClick={() => onSend('start new session')}
          >
            Start New Session
          </Button>
        );
      case 'contact_support':
        return (
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Support />}
            onClick={() => onSend('contact support')}
          >
            Contact Support
          </Button>
        );
      case 'reload_page':
        return (
          <Button
            variant="contained"
            color="primary"
            startIcon={<Refresh />}
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        );
      default:
        if (error.retry_possible) {
          return (
            <Button
              variant="contained"
              color="primary"
              startIcon={<Refresh />}
              onClick={() => onSend('retry')}
            >
              Retry
            </Button>
          );
        }
        return null;
    }
  };

  const getErrorTitle = (errorType: string) => {
    switch (errorType) {
      case 'validation_error':
        return 'Validation Error';
      case 'session_error':
        return 'Session Error';
      case 'backend_error':
        return 'Service Error';
      case 'network_error':
        return 'Connection Error';
      case 'timeout_error':
        return 'Request Timeout';
      default:
        return 'Error Occurred';
    }
  };

  return (
    <Card sx={{ mb: 2, border: '1px solid', borderColor: 'error.main' }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          {getErrorIcon(error.error_type)}
          <Typography variant="h6" color="error" fontWeight={600}>
            {getErrorTitle(error.error_type)}
          </Typography>
          <Chip
            label={error.error_type.replace(/_/g, ' ').toUpperCase()}
            size="small"
            color="error"
            variant="outlined"
          />
        </Box>

        <Alert severity={getErrorSeverity(error.error_type)} sx={{ mb: 2 }}>
          <Typography variant="body1" gutterBottom>
            {error.message}
          </Typography>
        </Alert>

        <Stack spacing={2}>
          {/* Error Details */}
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Error Details:
            </Typography>
            <Typography variant="body2">• Type: {error.error_type}</Typography>
            {error.recovery_action && (
              <Typography variant="body2">
                • Suggested Action: {error.recovery_action.replace(/_/g, ' ')}
              </Typography>
            )}
            <Typography variant="body2">
              • Retry Available: {error.retry_possible ? 'Yes' : 'No'}
            </Typography>
          </Box>

          {/* Recovery Actions */}
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Recovery Options:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {getRecoveryButton(error.recovery_action)}
            </Stack>
          </Box>

          {/* Additional Help */}
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              If the problem persists:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button variant="text" size="small" onClick={() => onSend('start over')}>
                Start Over
              </Button>
              <Button variant="text" size="small" onClick={() => onSend('view cart')}>
                Check Cart
              </Button>
              <Button variant="text" size="small" onClick={() => onSend('contact support')}>
                Contact Support
              </Button>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ErrorInterface;
