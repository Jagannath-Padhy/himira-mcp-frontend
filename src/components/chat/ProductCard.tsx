import { Product } from '@interfaces';
import { Button, Card, CardActions, CardContent, CardMedia, Typography } from '@mui/material';

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Card sx={{ maxWidth: 240, borderRadius: 2 }}>
      <CardMedia component="img" height="140" image={product.imageUrl} alt={product.name} />
      <CardContent>
        <Typography variant="subtitle1" fontWeight={600} noWrap>
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {product.description}
        </Typography>
        <Typography variant="subtitle2" color="primary" mt={1}>
          {product.price}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          color="primary"
          href={product.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          View
        </Button>
      </CardActions>
    </Card>
  );
}
