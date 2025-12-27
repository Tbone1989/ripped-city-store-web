import { Product } from '../types';

/**
 * RIPPED CITY INC - SHOPIFY STOREFRONT API INTEGRATION
 * 
 * Store: ripcityinc.myshopify.com
 * Token: 277459cd37a9fa5c4b7e03507d4597ea (CORRECTED)
 */
const SHOPIFY_DOMAIN = 'ripcityinc.myshopify.com';
const STOREFRONT_ACCESS_TOKEN = '277459cd37a9fa5c4b7e03507d4597ea';
const API_VERSION = '2024-01';

const GRAPHQL_QUERY = `
{
  products(first: 50) {
    edges {
      node {
        id
        handle
        title
        description
        productType
        tags
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 5) {
          edges {
            node {
              url
              altText
            }
          }
        }
        variants(first: 10) {
          edges {
            node {
              id
              title
              availableForSale
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
    }
  }
}
`;

// Fallback products in case API fails
const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'fb-1',
    handle: 'ripped-city-tank',
    title: 'Ripped City Tank Top',
    price: 29.98,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=500',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=500'],
    category: 'Tank Tops',
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Premium gym tank top by Ripped City Inc.',
  }
];

const extractSizesAndColors = (variants: any[]): { sizes: string[], colors: string[] } => {
  const sizes = new Set<string>();
  const colors = new Set<string>();
  
  variants.forEach(v => {
    v.node.selectedOptions?.forEach((opt: any) => {
      if (opt.name.toLowerCase() === 'size') sizes.add(opt.value);
      if (opt.name.toLowerCase() === 'color') colors.add(opt.value);
    });
  });
  
  return { sizes: Array.from(sizes), colors: Array.from(colors) };
};

const mapCategory = (productType: string): string => {
  const type = productType?.toLowerCase() || '';
  if (type.includes('tank')) return 'Tank Tops';
  if (type.includes('tshirt') || type.includes('shirt')) return 'Shirts';
  if (type.includes('hoodie')) return 'Hoodies';
  if (type.includes('short')) return 'Shorts';
  if (type.includes('pant') || type.includes('jogger')) return 'Pants';
  if (type.includes('hat') || type.includes('beanie') || type.includes('cap')) return 'Accessories';
  return 'Apparel';
};

const transformProduct = (node: any): Product => {
  const { sizes, colors } = extractSizesAndColors(node.variants?.edges || []);
  const images = node.images?.edges?.map((e: any) => e.node.url) || [];
  
  return {
    id: node.id.replace('gid://shopify/Product/', ''),
    handle: node.handle,
    title: node.title,
    price: parseFloat(node.priceRange?.minVariantPrice?.amount || '0'),
    image: images[0] || 'https://via.placeholder.com/500',
    images: images.length > 0 ? images : ['https://via.placeholder.com/500'],
    category: mapCategory(node.productType),
    sizes: sizes.length > 0 ? sizes : undefined,
    colors: colors.length > 0 ? colors : undefined,
    description: node.description || '',
  };
};

export const fetchShopifyProducts = async (): Promise<Product[]> => {
  console.log('[Ripped City] Fetching products from Shopify...');
  
  try {
    const response = await fetch(
      `https://${SHOPIFY_DOMAIN}/api/${API_VERSION}/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
        },
        body: JSON.stringify({ query: GRAPHQL_QUERY }),
      }
    );

    if (!response.ok) {
      console.error('[Ripped City] Shopify API error:', response.status);
      return FALLBACK_PRODUCTS;
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error('[Ripped City] GraphQL errors:', data.errors);
      return FALLBACK_PRODUCTS;
    }

    const products = data.data?.products?.edges || [];
    
    if (products.length === 0) {
      console.log('[Ripped City] No products returned, using fallback');
      return FALLBACK_PRODUCTS;
    }

    const transformedProducts = products.map((edge: any) => transformProduct(edge.node));
    console.log(`[Ripped City] Successfully fetched ${transformedProducts.length} products`);
    
    return transformedProducts;
  } catch (error) {
    console.error('[Ripped City] Error fetching products:', error);
    return FALLBACK_PRODUCTS;
  }
};

export default { fetchShopifyProducts };
