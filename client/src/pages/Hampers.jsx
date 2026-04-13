import { useState, useEffect } from 'react'
import { hamperAPI } from '../services/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './Hampers.css'

const Hampers = () => {
  const [hampers, setHampers] = useState([])
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchHampers()
  }, [])

  const fetchHampers = async () => {
    try {
      const response = await hamperAPI.getAll()
      setHampers(response.data)
    } catch (error) {
      console.error('Failed to fetch hampers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (hamperId) => {
    if (!user) {
      navigate('/login')
      return
    }
    await addToCart(hamperId)
  }

  return (
    <div className="hampers-page">
      <Navbar />
      
      <div className="hampers-container">
        <div className="page-header">
          <h1>Gift Hampers</h1>
          <p>Perfect for gifting! Our curated collections of premium dry fruits.</p>
        </div>

        {loading ? (
          <p className="loading">Loading...</p>
        ) : hampers.length > 0 ? (
          <div className="hampers-grid">
            {hampers.map(hamper => (
              <div key={hamper.id} className="hamper-card">
                <div className="hamper-image">
                  {hamper.image ? (
                    <img src={hamper.image} alt={hamper.name} />
                  ) : (
                    <div className="placeholder">🎁</div>
                  )}
                </div>
                <div className="hamper-content">
                  <h3>{hamper.name}</h3>
                  <p className="description">{hamper.description}</p>
                  
                  {hamper.items && hamper.items.length > 0 && (
                    <div className="hamper-items">
                      <h4>Includes:</h4>
                      <ul>
                        {hamper.items.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="hamper-footer">
                    <p className="price">₹{hamper.price.toFixed(2)}</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleAddToCart(hamper.id)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-hampers">
            <p>No hampers available at the moment. Check back soon!</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default Hampers
