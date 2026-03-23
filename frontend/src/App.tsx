import { BrowserRouter, Route, Routes } from 'react-router-dom'
import CartSummaryButton from './components/CartSummaryButton/CartSummaryButton'
import { CartProvider } from './context/CartContext'
import CartPage from './pages/CartPage'
import BooksPage from './pages/BooksPage'

function App() {
  // Keep App.tsx thin: define routes, and let pages/components own UI + state.
  return (
    <CartProvider>
      <BrowserRouter>
        <CartSummaryButton />
        <Routes>
          <Route path="/" element={<BooksPage />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  )
}

export default App