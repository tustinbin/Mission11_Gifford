import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

function CartPage() {
  const navigate = useNavigate()
  const {
    cartItems,
    totalItems,
    totalPrice,
    updateQuantity,
    removeFromCart,
    clearCart,
  } =
    useCart()

  return (
    <div className="container-fluid px-3 px-md-4 my-4 min-w-0">
      <h1 className="mb-4">Your Cart</h1>

      {cartItems.length === 0 ? (
        <div className="alert alert-info">Your cart is empty.</div>
      ) : (
        <>
          <div className="table-responsive min-w-0">
            <table className="table table-bordered align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Title</th>
                  <th className="text-end">Price</th>
                  <th className="text-center">Quantity</th>
                  <th className="text-end">Subtotal</th>
                  <th className="text-center">Remove</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.bookID}>
                    <td className="text-break">{item.title}</td>
                    <td className="text-end">${item.price.toFixed(2)}</td>
                    <td className="text-center" style={{ maxWidth: 110 }}>
                      <input
                        className="form-control text-center"
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.bookID, Number(e.target.value))
                        }
                      />
                    </td>
                    <td className="text-end">
                      ${(item.price * item.quantity).toFixed(2)}
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => removeFromCart(item.bookID)}
                      >
                        X
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-end">
            <div className="card p-3" style={{ minWidth: 260 }}>
              <div className="d-flex justify-content-between">
                <span>Items</span>
                <span>{totalItems}</span>
              </div>
              <div className="d-flex justify-content-between fw-bold mt-2">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </>
      )}

      <button className="btn btn-secondary mt-4" onClick={() => navigate('/')}>
        Continue Shopping
      </button>
      <button
        className="btn btn-danger mt-4 ms-2"
        onClick={clearCart}
        disabled={cartItems.length === 0}
      >
        Remove all
      </button>
    </div>
  )
}

export default CartPage

