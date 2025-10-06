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

type ProductCardProps = {
  product: Product;
  onSend: (msg: string) => void;
};

const ProductCard = ({ product, onSend }: ProductCardProps) => {
  const formatPrice = (price: number) => `₹${price.toFixed(2)}`;

  return (
    <Card sx={{ maxWidth: 280, borderRadius: 2, height: '100%' }}>
      {product.images && product.images.length > 0 ? (
        <CardMedia
          component="img"
          height="140"
          image={product.images[0]}
          alt={product.name}
          sx={{ objectFit: 'cover' }}
        />
      ) : (
        <Box
          height={140}
          display="flex"
          alignItems="center"
          justifyContent="center"
          bgcolor="grey.100"
        >
          <Typography color="text.secondary">No Image</Typography>
        </Box>
      )}
      <CardContent>
        <Typography variant="subtitle1" fontWeight={600} noWrap>
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {product.description || 'No description available'}
        </Typography>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <Typography variant="h6" color="primary" fontWeight={600}>
            {formatPrice(product.price)}
          </Typography>
          <Chip label={product.category} size="small" variant="outlined" color="secondary" />
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
