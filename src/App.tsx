import { useEffect, useState } from 'react';
import { fetchShopifyProducts } from './services/shopifyService';
import { Product } from './types';
import { ShoppingCart, Star, Menu, X } from 'lucide-react';

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const fetchedProducts = await fetchShopifyProducts();
        setProducts(fetchedProducts);
        setError(null);
      } catch (err) {
        setError('Failed to load products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const categories = ['All', ...new Set(products.map(p => p.category))];
  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-red-600">RIPPED CITY INC.</h1>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="hover:text-red-500 transition">Shop</a>
            <a href="#" className="hover:text-red-500 transition">Collections</a>
            <a href="#" className="hover:text-red-500 transition">About</a>
          </nav>
          <button className="p-2 hover:bg-gray-800 rounded-full transition">
            <ShoppingCart className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative h-[60vh] flex items-center justify-center bg-gradient-to-br from-red-900 to-black">
        <div className="text-center px-4">
          <h2 className="text-5xl md:text-7xl font-black mb-4">ELEVATE YOUR GAME</h2>
          <p className="text-xl text-gray-300 mb-8">Premium Fitness Apparel for Champions</p>
          <button className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded-full font-bold transition">
            SHOP NOW
          </button>
        </div>
      </section>

      {/* Products */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold mb-8 text-center">Our Products</h3>
        
        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 rounded-full transition ${
                selectedCategory === cat 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Loading products from Shopify...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-full"
            >
              Retry
            </button>
          </div>
        )}

        {/* Product Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map(product => (
              <div 
                key={product.id}
                className="group bg-gray-900 rounded-2xl overflow-hidden hover:transform hover:scale-105 transition duration-300"
              >
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={product.image || product.images[0]} 
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                </div>
                <div className="p-4">
                  <span className="text-xs text-red-500 font-semibold">{product.category}</span>
                  <h4 className="font-bold mt-1 mb-2 line-clamp-2">{product.title}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-red-500">
                      ${product.price.toFixed(2)}
                    </span>
                    <button className="bg-red-600 hover:bg-red-700 p-2 rounded-full transition">
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                  {product.sizes && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {product.sizes.slice(0, 4).map(size => (
                        <span key={size} className="text-xs bg-gray-800 px-2 py-1 rounded">
                          {size}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400">No products found in this category.</p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">RIPPED CITY INC.</h2>
          <p className="text-gray-400 mb-8">Premium Fitness Apparel</p>
          <p className="text-gray-600 text-sm">© 2025 Ripped City Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
