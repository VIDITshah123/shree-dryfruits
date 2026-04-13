import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './Profile.css'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    setFormData({
      name: user.name || '',
      phone: user.phone || ''
    })
  }, [user, navigate])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      const response = await authAPI.updateProfile(formData)
      updateUser(response.data.user)
      setMessage('Profile updated successfully!')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="profile-page">
      <Navbar />
      
      <div className="profile-container">
        <h1>My Profile</h1>
        
        <div className="profile-content">
          <div className="profile-card">
            <div className="profile-header">
              <div className="avatar">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <h2>{user.name}</h2>
                <p>{user.email}</p>
                <span className="role-badge">{user.role}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {message && <div className="success-message">{message}</div>}
              {error && <div className="error-message">{error}</div>}
              
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                />
                <small>Email cannot be changed</small>
              </div>
              
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>

          <div className="quick-links">
            <h3>Quick Links</h3>
            <button className="link-btn" onClick={() => navigate('/orders')}>
              My Orders
            </button>
            <button className="link-btn" onClick={() => navigate('/cart')}>
              Shopping Cart
            </button>
            <button className="link-btn" onClick={() => navigate('/contact')}>
              Contact Support
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Profile
