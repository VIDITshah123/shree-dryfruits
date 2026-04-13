import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { orderAPI, productAPI, categoryAPI, userAPI, queryAPI } from '../services/api'
import Navbar from '../components/Navbar'
import './Admin.css'

const Admin = () => {
  const { user, adminLogin } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState(null)
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [users, setUsers] = useState([])
  const [queries, setQueries] = useState([])
  const [loading, setLoading] = useState(false)

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsRes, ordersRes, productsRes, categoriesRes, usersRes, queriesRes] = await Promise.all([
        orderAPI.getStats(),
        orderAPI.getAllAdmin(),
        productAPI.getAll(),
        categoryAPI.getAll(),
        userAPI.getAll(),
        queryAPI.getAll()
      ])
      setStats(statsRes.data)
      setOrders(ordersRes.data)
      setProducts(productsRes.data)
      setCategories(categoriesRes.data)
      setUsers(usersRes.data)
      setQueries(queriesRes.data)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await adminLogin(loginForm.email, loginForm.password)
    } catch (error) {
      alert(error.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await orderAPI.updateStatus(orderId, status)
      fetchData()
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handleQueryStatusUpdate = async (queryId, status) => {
    try {
      await queryAPI.updateStatus(queryId, status)
      fetchData()
    } catch (error) {
      console.error('Failed to update query:', error)
    }
  }

  if (!user) {
    return (
      <div className="admin-login">
        <div className="login-card">
          <h1>Admin Login</h1>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">Login</button>
          </form>
          <button className="btn btn-outline" onClick={() => navigate('/')}>Back to Site</button>
        </div>
      </div>
    )
  }

  if (user.role !== 'admin') {
    navigate('/')
    return null
  }

  return (
    <div className="admin-page">
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
          <p>{user.name}</p>
        </div>
        <nav className="sidebar-nav">
          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
            Dashboard
          </button>
          <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
            Orders
          </button>
          <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>
            Products
          </button>
          <button className={activeTab === 'categories' ? 'active' : ''} onClick={() => setActiveTab('categories')}>
            Categories
          </button>
          <button className={activeTab === 'customers' ? 'active' : ''} onClick={() => setActiveTab('customers')}>
            Customers
          </button>
          <button className={activeTab === 'queries' ? 'active' : ''} onClick={() => setActiveTab('queries')}>
            Queries
          </button>
          <button onClick={() => navigate('/')}>Back to Site</button>
        </nav>
      </div>

      <div className="admin-content">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            {activeTab === 'dashboard' && stats && (
              <div className="dashboard">
                <h1>Dashboard</h1>
                <div className="stats-grid">
                  <div className="stat-card">
                    <h3>Total Orders</h3>
                    <p>{stats.totalOrders}</p>
                  </div>
                  <div className="stat-card">
                    <h3>Pending Orders</h3>
                    <p>{stats.pendingOrders}</p>
                  </div>
                  <div className="stat-card">
                    <h3>Today's Orders</h3>
                    <p>{stats.todayOrders}</p>
                  </div>
                  <div className="stat-card">
                    <h3>Total Revenue</h3>
                    <p>₹{stats.totalRevenue.toFixed(2)}</p>
                  </div>
                  <div className="stat-card">
                    <h3>Low Stock</h3>
                    <p>{stats.lowStock}</p>
                  </div>
                </div>
                <h3>Recent Orders</h3>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Status</th>
                      <th>Total</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map(order => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td><span className={`status-${order.status}`}>{order.status}</span></td>
                        <td>₹{order.total.toFixed(2)}</td>
                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="orders-section">
                <h1>Orders</h1>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{order.customer?.name || 'N/A'}</td>
                        <td>₹{order.total.toFixed(2)}</td>
                        <td>{order.payment_method} ({order.payment_status})</td>
                        <td>
                          <select value={order.status} onChange={(e) => handleStatusUpdate(order.id, e.target.value)}>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                        <td><button>View</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="products-section">
                <h1>Products</h1>
                <button className="btn btn-primary" onClick={() => alert('Add product form coming soon')}>
                  Add Product
                </button>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id}>
                        <td>#{product.id}</td>
                        <td>{product.name}</td>
                        <td>{product.category_name}</td>
                        <td>₹{product.price.toFixed(2)}</td>
                        <td className={product.stock < 10 ? 'low-stock' : ''}>{product.stock}</td>
                        <td><button>Edit</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'categories' && (
              <div className="categories-section">
                <h1>Categories</h1>
                <button className="btn btn-primary" onClick={() => alert('Add category form coming soon')}>
                  Add Category
                </button>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(category => (
                      <tr key={category.id}>
                        <td>#{category.id}</td>
                        <td>{category.name}</td>
                        <td>{category.description}</td>
                        <td><button>Edit</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'customers' && (
              <div className="customers-section">
                <h1>Customers</h1>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Orders</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>#{user.id}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.phone || 'N/A'}</td>
                        <td>{user.orderCount}</td>
                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'queries' && (
              <div className="queries-section">
                <h1>Customer Queries</h1>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Message</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queries.map(query => (
                      <tr key={query.id}>
                        <td>#{query.id}</td>
                        <td>{query.name}</td>
                        <td>{query.email}</td>
                        <td className="message-cell">{query.message}</td>
                        <td>
                          <select value={query.status} onChange={(e) => handleQueryStatusUpdate(query.id, e.target.value)}>
                            <option value="pending">Pending</option>
                            <option value="resolved">Resolved</option>
                          </select>
                        </td>
                        <td>{new Date(query.created_at).toLocaleDateString()}</td>
                        <td><button>Reply</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Admin
