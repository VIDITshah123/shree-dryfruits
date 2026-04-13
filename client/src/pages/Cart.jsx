import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './Cart.css'

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, loading } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  if (!user) {
    return null
  }

  return (
    <div className="cart-page">
      <Navbar />
      
      <div className="cart-container">
        <h1>Shopping Cart</h1>
        
        {cart.items && cart.items.length > 0 ? (
          <div className="cart-content">
            <div className="cart-items">
              {cart.items.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="item-image">
                    {item.images && item.images.length > 0 ? (
                      <img src={item.images[0]} alt={item.name} />
                    ) : (
                      <div className="placeholder">🥜</div>
                    )}
                  </div>
                  <div className="item-info">
                    <h3>{item.name}</h3>
                    <p className="price">₹{item.price.toFixed(2)}</p>
                    <p className="subtotal">Subtotal: ₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <div className="item-actions">
                    <div className="quantity-selector">
                      <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} disabled={loading}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} disabled={loading}>+</button>
                    </div>
                    <button className="remove-btn" onClick={() => removeFromCart(item.product_id)} disabled={loading}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h3>Order Summary</h3>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{cart.total.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>₹{cart.total.toFixed(2)}</span>
              </div>
              <button className="btn btn-primary checkout-btn" onClick={() => navigate('/checkout')}>
                Proceed to Checkout
              </button>
            </div>
          </div>
        ) : (
          <div className="empty-cart">
            <p>Your cart is empty</p>
            <Link to="/products" className="btn btn-primary">Continue Shopping</Link>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default Cart
