import React from 'react';
import { Button } from './ui/button';
import { ShoppingCart } from 'lucide-react';
import { CMSProduct, productToSnipcartFormat } from '@/lib/snipcart';

interface SnipcartBuyButtonProps {
  product: CMSProduct;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children?: React.ReactNode;
}

export const SnipcartBuyButton: React.FC<SnipcartBuyButtonProps> = ({
  product,
  className,
  variant = 'default',
  size = 'default',
  children
}) => {
  const snipcartProduct = productToSnipcartFormat(product);
  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;

  return (
    <Button
      className={`snipcart-add-item ${className || ''}`}
      variant={variant}
      size={size}
      data-item-id={snipcartProduct.id}
      data-item-price={price}
      data-item-url={snipcartProduct.url}
      data-item-description={snipcartProduct.description}
      data-item-image={snipcartProduct.image}
      data-item-name={snipcartProduct.name}
      data-item-weight={snipcartProduct.weight}
      data-item-quantity={snipcartProduct.quantity}
      data-item-shippable={snipcartProduct.shippable ? 'true' : 'false'}
      data-item-taxable={snipcartProduct.taxable ? 'true' : 'false'}
      data-item-categories={snipcartProduct.categories?.join('|')}
    >
      {children || (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </>
      )}
    </Button>
  );
};
