import { createContext, useContext, useState, useEffect } from 'react'
import { cartAPI } from '../services/api'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(false)

  const fetchCart = async () => {
    try {
      const response = await cartAPI.get()
      setCart(response.data)
    } catch (error) {
      console.error('Failed to fetch cart:', error)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetchCart()
    }
  }, [])

  const addToCart = async (product_id, quantity = 1, weight = null, price = null) => {
    setLoading(true)
    try {
      await cartAPI.add(product_id, quantity, weight, price)
      await fetchCart()
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to add to cart' }
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (cartId, quantity, weight = null) => {
    setLoading(true)
    try {
      await cartAPI.update(cartId, quantity, weight)
      await fetchCart()
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Failed to update cart' }
    } finally {
      setLoading(false)
    }
  }

  const removeFromCart = async (cartId) => {
    setLoading(true)
    try {
      await cartAPI.remove(cartId)
      await fetchCart()
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Failed to remove from cart' }
    } finally {
      setLoading(false)
    }
  }

  const clearCart = async () => {
    try {
      await cartAPI.clear()
      setCart({ items: [], total: 0 })
    } catch (error) {
      console.error('Failed to clear cart:', error)
    }
  }

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateQuantity, removeFromCart, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
