import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { productAPI, hamperAPI, categoryAPI } from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './Home.css'

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [hampers, setHampers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes, hampersRes] = await Promise.all([
          productAPI.getFeatured(),
          categoryAPI.getAll(),
          hamperAPI.getAll()
        ])
        setFeaturedProducts(productsRes.data)
        setCategories(categoriesRes.data)
        setHampers(hampersRes.data)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="home-page">
      <Navbar />
      
      <section className="hero">
        <div className="hero-content">
          <img src="/brand-logo.jpeg" alt="Shree Dryfruits" className="hero-logo" />
          <h1>Premium Dry Fruits</h1>
          <p>Farm-fresh quality delivered to your doorstep</p>
          <Link to="/products" className="btn btn-primary">Shop Now</Link>
        </div>
      </section>

      <section className="categories">
        <div className="container">
          <h2>Our Categories</h2>
          {loading ? (
            <p>Loading...</p>
          ) : categories.length > 0 ? (
            <div className="category-grid">
              {categories.map(category => (
                <Link key={category.id} to={`/products?category=${category.id}`} className="category-card">
                  <div className="category-image">
                    {category.image ? (
                      <img src={category.image} alt={category.name} />
                    ) : (
                      <div className="placeholder">🍎</div>
                    )}
                  </div>
                  <h3>{category.name}</h3>
                </Link>
              ))}
            </div>
          ) : (
            <p>No categories available</p>
          )}
        </div>
      </section>

      <section className="featured-products">
        <div className="container">
          <h2>Featured Products</h2>
          {loading ? (
            <p>Loading...</p>
          ) : featuredProducts.length > 0 ? (
            <div className="product-grid">
              {featuredProducts.map(product => (
                <Link key={product.id} to={`/products/${product.id}`} className="product-card">
                  <div className="product-image">
                    {product.images && product.images.length > 0 ? (
                      <img src={product.images[0]} alt={product.name} />
                    ) : (
                      <div className="placeholder">🥜</div>
                    )}
                    {product.stock < 10 && <span className="low-stock">Low Stock</span>}
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="price">₹{product.price.toFixed(2)}</p>
                    <p className="category">{product.category_name}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p>No products available</p>
          )}
        </div>
      </section>

      <section className="hampers">
        <div className="container">
          <h2>Special Hampers</h2>
          {loading ? (
            <p>Loading...</p>
          ) : hampers.length > 0 ? (
            <div className="hamper-grid">
              {hampers.map(hamper => (
                <Link key={hamper.id} to={`/hampers`} className="hamper-card">
                  <div className="hamper-image">
                    {hamper.image ? (
                      <img src={hamper.image} alt={hamper.name} />
                    ) : (
                      <div className="placeholder">🎁</div>
                    )}
                  </div>
                  <div className="hamper-info">
                    <h3>{hamper.name}</h3>
                    <p className="description">{hamper.description}</p>
                    <p className="price">₹{hamper.price.toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p>No hampers available</p>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Home
