import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { orderAPI } from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './Checkout.css'

const Checkout = () => {
  const navigate = useNavigate()
  const { cart, clearCart } = useCart()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [orderId, setOrderId] = useState(null)

  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: ''
  })

  const [paymentMethod, setPaymentMethod] = useState('cod')

  useEffect(() => {
    if (!user) {
      navigate('/login')
    } else if (!cart.items || cart.items.length === 0) {
      navigate('/cart')
    }
  }, [user, cart, navigate])

  const handleAddressSubmit = (e) => {
    e.preventDefault()
    if (!address.fullName || !address.phone || !address.addressLine1 || !address.city || !address.state || !address.pincode) {
      setError('Please fill all required fields')
      return
    }
    setError('')
    setStep(2)
  }

  const handlePaymentSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await orderAPI.create({
        address,
        payment_method: paymentMethod
      })
      setOrderId(response.data.orderId)
      await clearCart()
      setStep(3)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  if (!user || !cart.items || cart.items.length === 0) {
    return null
  }

  return (
    <div className="checkout-page">
      <Navbar />
      
      <div className="checkout-container">
        <h1>Checkout</h1>

        <div className="steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <span>1</span> Address
          </div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <span>2</span> Payment
          </div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <span>3</span> Confirmation
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {step === 1 && (
          <form className="checkout-form" onSubmit={handleAddressSubmit}>
            <h2>Shipping Address</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={address.fullName}
                  onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Address Line 1 *</label>
              <input
                type="text"
                value={address.addressLine1}
                onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Address Line 2</label>
              <input
                type="text"
                value={address.addressLine2}
                onChange={(e) => setAddress({ ...address, addressLine2: e.target.value })}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>State *</label>
                <input
                  type="text"
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Pincode *</label>
                <input
                  type="text"
                  value={address.pincode}
                  onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Continue to Payment</button>
          </form>
        )}

        {step === 2 && (
          <div className="checkout-form">
            <h2>Payment Method</h2>
            <div className="payment-options">
              <label className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                />
                <span>Cash on Delivery</span>
              </label>
              <label className={`payment-option ${paymentMethod === 'razorpay' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value="razorpay"
                  checked={paymentMethod === 'razorpay'}
                  onChange={() => setPaymentMethod('razorpay')}
                />
                <span>Razorpay (UPI/Card/Wallet)</span>
              </label>
              <label className={`payment-option ${paymentMethod === 'stripe' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value="stripe"
                  checked={paymentMethod === 'stripe'}
                  onChange={() => setPaymentMethod('stripe')}
                />
                <span>Stripe (Card)</span>
              </label>
            </div>

            <div className="order-summary">
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
            </div>

            <div className="form-actions">
              <button className="btn btn-outline" onClick={() => setStep(1)}>Back</button>
              <button className="btn btn-primary" onClick={handlePaymentSubmit} disabled={loading}>
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="confirmation">
            <div className="success-icon">✓</div>
            <h2>Order Placed Successfully!</h2>
            <p>Your order ID is: <strong>#{orderId}</strong></p>
            <p>Thank you for your purchase. You will receive an order confirmation shortly.</p>
            <div className="confirmation-actions">
              <button className="btn btn-primary" onClick={() => navigate('/orders')}>
                View Orders
              </button>
              <button className="btn btn-outline" onClick={() => navigate('/products')}>
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default Checkout
