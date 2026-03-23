import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Book } from '../types/Book'
import type { CartItem } from '../types/CartItem'

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (book: Book) => void
  updateQuantity: (bookID: number, quantity: number) => void
  removeFromCart: (bookID: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const raw = sessionStorage.getItem('cartItems')
    if (!raw) return []

    try {
      return JSON.parse(raw) as CartItem[]
    } catch {
      return []
    }
  })

  // Keep cart state for this browser session, even across route changes/reloads.
  useEffect(() => {
    sessionStorage.setItem('cartItems', JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = (book: Book) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.bookID === book.bookID)
      if (existing) {
        return prev.map((item) =>
          item.bookID === book.bookID
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [
        ...prev,
        {
          bookID: book.bookID,
          title: book.title,
          price: book.price,
          quantity: 1,
        },
      ]
    })
  }

  const updateQuantity = (bookID: number, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item.bookID !== bookID))
      return
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.bookID === bookID ? { ...item, quantity } : item
      )
    )
  }

  const removeFromCart = (bookID: number) => {
    setCartItems((prev) => prev.filter((item) => item.bookID !== bookID))
  }

  const clearCart = () => setCartItems([])

  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  )

  const totalPrice = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  )

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export { CartProvider, useCart }

