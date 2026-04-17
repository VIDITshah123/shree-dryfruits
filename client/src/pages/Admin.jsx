import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { orderAPI, productAPI, categoryAPI, userAPI, queryAPI } from '../services/api'
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

  const [showProductForm, setShowProductForm] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [editingCategory, setEditingCategory] = useState(null)

  const [productForm, setProductForm] = useState({
    name: '', category_id: '', price: '', description: '', stock: '', images: '', weight_options: ''
  })

  const parseWeightOptions = (str) => {
    if (!str || !str.trim()) return []
    return str.split(',').map(s => s.trim()).filter(Boolean).map(w => {
      const parts = w.split(':')
      if (parts.length === 2) {
        return { weight: parts[0].trim(), price: parseFloat(parts[1].trim()) }
      }
      return { weight: w.trim(), price: parseFloat(productForm.price) || 0 }
    })
  }

  const [categoryForm, setCategoryForm] = useState({
    name: '', description: '', image: ''
  })

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

  const openProductForm = (product = null) => {
    if (product) {
      setEditingProduct(product)
      const weightStr = (product.weight_options || []).map(w => 
        typeof w === 'object' ? `${w.weight}:${w.price}` : w
      ).join(', ')
      setProductForm({
        name: product.name || '',
        category_id: product.category_id || '',
        price: product.price || '',
        description: product.description || '',
        stock: product.stock || '',
        images: (product.images || []).join(', '),
        weight_options: weightStr
      })
    } else {
      setEditingProduct(null)
      setProductForm({ name: '', category_id: '', price: '', description: '', stock: '', images: '', weight_options: '' })
    }
    setShowProductForm(true)
  }

  const closeProductForm = () => {
    setShowProductForm(false)
    setEditingProduct(null)
  }

  const handleProductSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const weightOpts = parseWeightOptions(productForm.weight_options)
      const data = {
        name: productForm.name,
        category_id: productForm.category_id || null,
        price: parseFloat(productForm.price),
        description: productForm.description,
        stock: parseInt(productForm.stock) || 0,
        images: productForm.images.split(',').map(s => s.trim()).filter(Boolean),
        weight_options: weightOpts
      }

      if (editingProduct) {
        await productAPI.update(editingProduct.id, data)
        alert('Product updated successfully!')
      } else {
        await productAPI.create(data)
        alert('Product added successfully!')
      }
      closeProductForm()
      fetchData()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  const handleProductDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    setLoading(true)
    try {
      await productAPI.delete(id)
      alert('Product deleted successfully!')
      fetchData()
    } catch (error) {
      alert('Failed to delete product')
    } finally {
      setLoading(false)
    }
  }

  const openCategoryForm = (category = null) => {
    if (category) {
      setEditingCategory(category)
      setCategoryForm({
        name: category.name || '',
        description: category.description || '',
        image: category.image || ''
      })
    } else {
      setEditingCategory(null)
      setCategoryForm({ name: '', description: '', image: '' })
    }
    setShowCategoryForm(true)
  }

  const closeCategoryForm = () => {
    setShowCategoryForm(false)
    setEditingCategory(null)
  }

  const handleCategorySubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = {
        name: categoryForm.name,
        description: categoryForm.description,
        image: categoryForm.image
      }

      if (editingCategory) {
        await categoryAPI.update(editingCategory.id, data)
        alert('Category updated successfully!')
      } else {
        await categoryAPI.create(data)
        alert('Category added successfully!')
      }
      closeCategoryForm()
      fetchData()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save category')
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    setLoading(true)
    try {
      await categoryAPI.delete(id)
      alert('Category deleted successfully!')
      fetchData()
    } catch (error) {
      alert('Failed to delete category')
    } finally {
      setLoading(false)
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
              <input type="email" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
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
          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
          <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>Orders</button>
          <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>Products</button>
          <button className={activeTab === 'categories' ? 'active' : ''} onClick={() => setActiveTab('categories')}>Categories</button>
          <button className={activeTab === 'customers' ? 'active' : ''} onClick={() => setActiveTab('customers')}>Customers</button>
          <button className={activeTab === 'queries' ? 'active' : ''} onClick={() => setActiveTab('queries')}>Queries</button>
          <button onClick={() => navigate('/')}>Back to Site</button>
        </nav>
      </div>

      <div className="admin-content">
        {loading && <div className="loading-overlay">Loading...</div>}
        
        {activeTab === 'dashboard' && stats && (
          <div className="dashboard">
            <h1>Dashboard</h1>
            <div className="stats-grid">
              <div className="stat-card"><h3>Total Orders</h3><p>{stats.totalOrders}</p></div>
              <div className="stat-card"><h3>Pending Orders</h3><p>{stats.pendingOrders}</p></div>
              <div className="stat-card"><h3>Today's Orders</h3><p>{stats.todayOrders}</p></div>
              <div className="stat-card"><h3>Total Revenue</h3><p>₹{stats.totalRevenue.toFixed(2)}</p></div>
              <div className="stat-card"><h3>Low Stock</h3><p>{stats.lowStock}</p></div>
            </div>
            <h3>Recent Orders</h3>
            <table className="admin-table">
              <thead><tr><th>Order ID</th><th>Status</th><th>Total</th><th>Date</th></tr></thead>
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
              <thead><tr><th>ID</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
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
            <div className="section-header">
              <h1>Products</h1>
              <button className="btn btn-primary" onClick={() => openProductForm()}>+ Add Product</button>
            </div>
            <table className="admin-table">
              <thead><tr><th>ID</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td>#{product.id}</td>
                    <td>{product.name}</td>
                    <td>{product.category_name || 'Uncategorized'}</td>
                    <td>₹{product.price.toFixed(2)}</td>
                    <td className={product.stock < 10 ? 'low-stock' : ''}>{product.stock}</td>
                    <td>
                      <button className="edit-btn" onClick={() => openProductForm(product)}>Edit</button>
                      <button className="delete-btn" onClick={() => handleProductDelete(product.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="categories-section">
            <div className="section-header">
              <h1>Categories</h1>
              <button className="btn btn-primary" onClick={() => openCategoryForm()}>+ Add Category</button>
            </div>
            <table className="admin-table">
              <thead><tr><th>ID</th><th>Name</th><th>Description</th><th>Actions</th></tr></thead>
              <tbody>
                {categories.map(category => (
                  <tr key={category.id}>
                    <td>#{category.id}</td>
                    <td>{category.name}</td>
                    <td>{category.description || '-'}</td>
                    <td>
                      <button className="edit-btn" onClick={() => openCategoryForm(category)}>Edit</button>
                      <button className="delete-btn" onClick={() => handleCategoryDelete(category.id)}>Delete</button>
                    </td>
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
              <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Orders</th><th>Joined</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>#{u.id}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.phone || 'N/A'}</td>
                    <td>{u.orderCount}</td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
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
              <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Message</th><th>Status</th><th>Date</th></tr></thead>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showProductForm && (
        <div className="modal-overlay" onClick={closeProductForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button className="close-btn" onClick={closeProductForm}>×</button>
            </div>
            <form onSubmit={handleProductSubmit}>
              <div className="form-group">
                <label>Product Name *</label>
                <input type="text" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select value={productForm.category_id} onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}>
                    <option value="">Select Category</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input type="number" step="0.01" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} rows="3" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Stock Quantity *</label>
                  <input type="number" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Weight Options (Format: weight:price, e.g., 500g:450, 1kg:850)</label>
                  <input type="text" placeholder="500g:450, 1kg:850" value={productForm.weight_options} onChange={(e) => setProductForm({ ...productForm, weight_options: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Image URLs (comma-separated)</label>
                <input type="text" placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg" value={productForm.images} onChange={(e) => setProductForm({ ...productForm, images: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={closeProductForm}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCategoryForm && (
        <div className="modal-overlay" onClick={closeCategoryForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
              <button className="close-btn" onClick={closeCategoryForm}>×</button>
            </div>
            <form onSubmit={handleCategorySubmit}>
              <div className="form-group">
                <label>Category Name *</label>
                <input type="text" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} rows="3" />
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input type="text" placeholder="https://example.com/category.jpg" value={categoryForm.image} onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={closeCategoryForm}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin
