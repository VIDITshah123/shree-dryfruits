import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { productAPI, categoryAPI } from '../services/api'
import { useCart } from '../context/CartContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './Products.css'

const Products = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const { addToCart } = useCart()

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') || ''
  })

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const params = {}
        if (filters.category) params.category = filters.category
        if (filters.search) params.search = filters.search
        if (filters.sort) params.sort = filters.sort

        const [productsRes, categoriesRes] = await Promise.all([
          productAPI.getAll(params),
          categoryAPI.getAll()
        ])
        setProducts(productsRes.data)
        setCategories(categoriesRes.data)
      } catch (error) {
        console.error('Failed to fetch products:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [filters])

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    const params = new URLSearchParams()
    if (value) params.set(key, value)
    setSearchParams(params)
  }

  return (
    <div className="products-page">
      <Navbar />
      
      <div className="products-container">
        <aside className="filters">
          <h3>Filters</h3>
          
          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
            >
              <option value="">Default</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </aside>

        <main className="products-main">
          <h1>Our Products</h1>
          
          {loading ? (
            <p className="loading">Loading...</p>
          ) : products.length > 0 ? (
            <div className="products-grid">
              {products.map(product => (
                <div key={product.id} className="product-card">
                  <Link to={`/products/${product.id}`}>
                    <div className="product-image">
                      {product.images && product.images.length > 0 ? (
                        <img src={product.images[0]} alt={product.name} />
                      ) : (
                        <div className="placeholder">🥜</div>
                      )}
                      {product.stock < 10 && product.stock > 0 && (
                        <span className="low-stock">Low Stock</span>
                      )}
                      {product.stock === 0 && (
                        <span className="out-of-stock">Out of Stock</span>
                      )}
                    </div>
                  </Link>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="category">{product.category_name}</p>
                    <p className="price">₹{product.price.toFixed(2)}</p>
                    {product.stock > 0 && (
                      <button
                        className="btn btn-primary add-to-cart"
                        onClick={() => addToCart(product.id)}
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-products">No products found</p>
          )}
        </main>
      </div>

      <Footer />
    </div>
  )
}

export default Products
