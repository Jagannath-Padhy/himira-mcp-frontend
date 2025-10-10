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
} from '@mui/material';
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

  const handleImageError = () => {
    console.warn('⚠️ Image failed to load for product:', product.name, 'URL:', imgSrc, '- Using fallback image');
    setImgSrc('/FallbackImage.jpeg');
  };

  console.log('🎴 Rendering ProductCard:', product.name, 'Images:', product.images);

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
      </CardContent>

      <CardActions>
        <Button
          size="small"
          color="primary"
          variant="contained"
          fullWidth
          onClick={() => onSend(`add ${product.name} to cart`)}
        >
          Add to Cart
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
