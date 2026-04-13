import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productAPI } from '../services/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './ProductDetail.css'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productAPI.getById(id)
        setProduct(response.data)
      } catch (error) {
        console.error('Failed to fetch product:', error)
        navigate('/products')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id, navigate])

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    const result = await addToCart(product.id, quantity)
    if (result.success) {
      setMessage('Added to cart!')
      setTimeout(() => setMessage(''), 3000)
    } else {
      setMessage(result.error)
    }
  }

  if (loading) {
    return (
      <div className="product-detail-page">
        <Navbar />
        <div className="loading">Loading...</div>
        <Footer />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="product-detail-page">
        <Navbar />
        <div className="loading">Product not found</div>
        <Footer />
      </div>
    )
  }

  const images = product.images && product.images.length > 0 
    ? product.images 
    : ['/placeholder.jpg']

  return (
    <div className="product-detail-page">
      <Navbar />
      
      <div className="product-detail-container">
        <div className="product-images">
          <div className="main-image">
            {images[selectedImage] ? (
              <img src={images[selectedImage]} alt={product.name} />
            ) : (
              <div className="placeholder">🥜</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="thumbnail-images">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${product.name} ${index + 1}`}
                  className={index === selectedImage ? 'active' : ''}
                  onClick={() => setSelectedImage(index)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="product-info">
          <h1>{product.name}</h1>
          <p className="category">{product.category_name}</p>
          <p className="price">₹{product.price.toFixed(2)}</p>
          
          <p className="description">{product.description}</p>

          {product.weight_options && product.weight_options.length > 0 && (
            <div className="weight-options">
              <label>Weight Options:</label>
              <div className="weights">
                {product.weight_options.map((w, i) => (
                  <span key={i} className="weight-tag">{w}</span>
                ))}
              </div>
            </div>
          )}

          <div className="stock-info">
            {product.stock > 0 ? (
              <span className="in-stock">In Stock ({product.stock} available)</span>
            ) : (
              <span className="out-of-stock">Out of Stock</span>
            )}
          </div>

          {product.stock > 0 && (
            <div className="quantity-selector">
              <label>Quantity:</label>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>+</button>
            </div>
          )}

          {message && <p className="message">{message}</p>}

          {product.stock > 0 && (
            <button className="btn btn-primary add-to-cart-btn" onClick={handleAddToCart}>
              Add to Cart
            </button>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default ProductDetail
