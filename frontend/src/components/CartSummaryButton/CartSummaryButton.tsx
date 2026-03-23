import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'

function CartSummaryButton() {
  const navigate = useNavigate()
  const { totalItems, totalPrice } = useCart()

  return (
    <button
      type="button"
      className="btn btn-dark position-fixed top-0 end-0 m-3 shadow"
      onClick={() => navigate('/cart')}
      style={{ zIndex: 1100 }}
    >
      🛒 {totalItems} | ${totalPrice.toFixed(2)}
    </button>
  )
}

export default CartSummaryButton

