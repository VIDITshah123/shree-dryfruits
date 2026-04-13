import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { orderAPI } from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './Orders.css'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchOrders()
  }, [user, navigate])

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getAll()
      setOrders(response.data)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#3498db'
      case 'processing': return '#f39c12'
      case 'shipped': return '#9b59b6'
      case 'delivered': return '#27ae60'
      case 'cancelled': return '#e74c3c'
      default: return '#95a5a6'
    }
  }

  const getPaymentStatusColor = (status) => {
    return status === 'paid' ? '#27ae60' : '#f39c12'
  }

  if (!user) return null

  return (
    <div className="orders-page">
      <Navbar />
      
      <div className="orders-container">
        <h1>My Orders</h1>
        
        {loading ? (
          <p className="loading">Loading...</p>
        ) : orders.length > 0 ? (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>Order #{order.id}</h3>
                    <p className="order-date">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="order-status">
                    <span className="status-badge" style={{ backgroundColor: getStatusColor(order.status) }}>
                      {order.status}
                    </span>
                    <span className="payment-badge" style={{ backgroundColor: getPaymentStatusColor(order.payment_status) }}>
                      {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                </div>

                <div className="order-items">
                  {order.items && order.items.slice(0, 3).map(item => (
                    <div key={item.id} className="order-item">
                      <div className="item-image">
                        {item.images && item.images.length > 0 ? (
                          <img src={item.images[0]} alt={item.name} />
                        ) : (
                          <div className="placeholder">🥜</div>
                        )}
                      </div>
                      <div className="item-details">
                        <p className="item-name">{item.name}</p>
                        <p className="item-qty">Qty: {item.quantity}</p>
                        <p className="item-price">₹{item.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                  {order.items && order.items.length > 3 && (
                    <p className="more-items">+{order.items.length - 3} more items</p>
                  )}
                </div>

                <div className="order-footer">
                  <div className="shipping-address">
                    <h4>Shipping Address</h4>
                    <p>{order.address?.fullName}</p>
                    <p>{order.address?.addressLine1}</p>
                    <p>{order.address?.city}, {order.address?.state} - {order.address?.pincode}</p>
                  </div>
                  <div className="order-total">
                    <span>Total</span>
                    <span className="total-amount">₹{order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-orders">
            <p>You haven't placed any orders yet</p>
            <Link to="/products" className="btn btn-primary">Start Shopping</Link>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default Orders
