import { Link } from 'react-router-dom'
import './Footer.css'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <div className="footer-logo">
            <img src="/brand-logo.jpeg" alt="Shree Dryfruits" />
            <span>Shree Dryfruits</span>
          </div>
          <p>Premium quality dry fruits delivered to your doorstep. Freshness guaranteed.</p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          <Link to="/hampers">Hampers</Link>
          <Link to="/contact">Contact Us</Link>
        </div>

        <div className="footer-section">
          <h4>Contact</h4>
          <p>Email: shahvidit15@gmails.com</p>
          <p>Phone: +91 8828778440</p>
          <p>Address: Pune, India</p>
        </div>

        <div className="footer-section">
          <h4>Connect With Us</h4>
          <div className="social-links">
            <a href="#" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="#" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="#" target="_blank" rel="noopener noreferrer">WhatsApp</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2024 Shree Dryfruits. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
