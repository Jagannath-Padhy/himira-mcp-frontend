import { Product } from '@interfaces';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  IconButton,
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import { useState } from 'react';

type ProductCardProps = {
  product: Product;
  onSend: (msg: string) => void;
};

const ProductCard = ({ product, onSend }: ProductCardProps) => {
  const formatPrice = (price: number) => `₹${price.toFixed(2)}`;
  const [imgSrc, setImgSrc] = useState<string>(
    product.images && product.images.length > 0 && product.images[0].trim() !== ''
      ? product.images[0]
      : '/FallbackImage.jpeg'
  );
  const [quantity, setQuantity] = useState<number>(1);

  const handleImageError = () => {
    console.warn('⚠️ Image failed to load for product:', product.name, 'URL:', imgSrc, '- Using fallback image');
    setImgSrc('/FallbackImage.jpeg');
  };

  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrement = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleAddToCart = () => {
    onSend(`add ${quantity} ${product.name} to cart`);
  };

  return (
    <Card
      sx={{
        borderRadius: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {imgSrc ? (
        <CardMedia
          component="img"
          image={imgSrc}
          alt={product.name}
          onError={handleImageError}
          sx={{
            height: 320,
            width: '100%',
            objectFit: 'cover',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        />
      ) : (
        <Box
          sx={{
            height: 320,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'grey.100',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography color="text.secondary">No Image</Typography>
        </Box>
      )}

      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          flexGrow: 1,
          p: 1.25,
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          sx={{ minHeight: 32 }}
        >
          <Chip
            label={product.category}
            size="small"
            variant="outlined"
            color="secondary"
          />
        </Box>
        <Typography
          variant="body1"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: '24px',
          }}
        >
          {product.name}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: '20px',
          }}
        >
          {product.description || 'No description available'}
        </Typography>

        <Box display="flex" gap={0.5}>
          <Typography
            variant="body1"
            fontWeight={600}
            sx={{
              lineHeight: '22px',
            }}
          >
            {formatPrice(product.price)}
          </Typography>
        </Box>
        {product.provider.name && (
          <Typography variant="caption" color="text.secondary">
            Provider: {product.provider.name}
          </Typography>
        )}

        {/* Quantity Controls */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{
            border: '1px solid rgb(151, 151, 151)',
            borderRadius: '32px',
            width: '112px',
            minWidth: '112px',
            maxWidth: '112px',
            minHeight: '44px',
            bgcolor: 'rgb(255, 255, 255)',
            mt: 0.5,
          }}
        >
          <IconButton
            size="small"
            onClick={handleDecrement}
            sx={{ width: 24, height: 24 }}
          >
            <Remove fontSize="small" />
          </IconButton>
          <Typography
            variant="body1"
            fontWeight={600}
            textAlign="center"
            sx={{ px: 1.875, py: 0.625 }}
          >
            {quantity}
          </Typography>
          <IconButton
            size="small"
            onClick={handleIncrement}
            sx={{ width: 24, height: 24 }}
          >
            <Add fontSize="small" />
          </IconButton>
        </Box>
      </CardContent>

      <CardActions>
        <Button
          size="small"
          color="primary"
          variant="contained"
          fullWidth
          onClick={handleAddToCart}
        >
          Add to Cart
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
