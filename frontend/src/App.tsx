import { useEffect, useState } from 'react'
import type { Book } from './types/Book'
import './App.css'

const PAGE_SIZE_OPTIONS = [5, 10, 20]

function App() {
  // Core bits of state the rubric cares about
  const [books, setBooks] = useState<Book[]>([])
  const [pageNum, setPageNum] = useState(1)
  const [pageHowMany, setPageHowMany] = useState(5)
  const [totalBooks, setTotalBooks] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Options for how the user can sort the list
  const SORT_OPTIONS = [
    { label: 'No sort', value: 'none' },
    { label: 'Title (A–Z)', value: 'asc' },
    { label: 'Title (Z–A)', value: 'desc' },
  ] as const

  type SortMode = (typeof SORT_OPTIONS)[number]['value']
  // Default to whatever order the DB already has, then let the user opt into A–Z / Z–A
  const [sortMode, setSortMode] = useState<SortMode>('none')

  useEffect(() => {
    // Whenever paging/sort changes, go ask the API for the latest slice of data
    const fetchBooks = async () => {
      setLoading(true)
      setError(null)
      try {
        // Only send the sort param when the user has actually chosen a mode
        const sortParam =
          sortMode === 'none'
            ? ''
            : `&sortTitleAsc=${sortMode === 'asc' ? 'true' : 'false'}`
        const response = await fetch(
          `https://localhost:5000/api/Book/AllBooks?pageHowMany=${pageHowMany}&pageNum=${pageNum}${sortParam}`
        )
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }
        const data = await response.json()
        setBooks(data.books ?? data.Books)
        setTotalBooks(data.totalBooks ?? data.TotalBooks)
      } catch (err: any) {
        setError(err.message ?? 'Failed to load books')
      } finally {
        setLoading(false)
      }
    }

    fetchBooks()
  }, [pageNum, pageHowMany, sortMode])

  const totalPages = Math.ceil(totalBooks / pageHowMany) || 1

  return (
    <div className="container my-4">
      <h1 className="mb-4 text-center">Bookstore</h1>
  
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <label className="form-label me-2 mb-0">Books per page:</label>
          <select
            className="form-select d-inline-block w-auto"
            value={pageHowMany}
            onChange={(e) => {
              setPageNum(1)
              setPageHowMany(Number(e.target.value))
            }}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <label className="form-label ms-3 me-2 mb-0">Sort:</label>
          <select
            className="form-select d-inline-block w-auto"
            value={sortMode}
            onChange={(e) => {
              setPageNum(1)
              setSortMode(e.target.value as SortMode)
            }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <span className="text-muted">Total books: {totalBooks}</span>
        </div>
      </div>
  
      {loading && <p>Loading...</p>}
      {error && <p className="text-danger">{error}</p>}
  
      {!loading && !error && (
        <>
          <table className="table table-striped table-bordered">
            <thead className="table-light">
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Publisher</th>
                <th>ISBN</th>
                <th>Category</th>
                <th>Pages</th>
                <th className="text-end">Price</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.bookID}>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.publisher}</td>
                  <td>{book.isbn}</td>
                  <td>{book.category}</td>
                  <td>{book.pageCount}</td>
                  <td className="text-end">${book.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
  
          <nav aria-label="Book pagination">
            <ul className="pagination justify-content-center">
              <li className={`page-item ${pageNum === 1 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => setPageNum((p) => p - 1)}
                  disabled={pageNum === 1}
                >
                  Previous
                </button>
              </li>

              {/* One button per page so I can quickly jump around */}
              {Array.from({ length: totalPages }, (_, idx) => {
                const page = idx + 1
                return (
                  <li
                    key={page}
                    className={`page-item ${pageNum === page ? 'active' : ''}`}
                    style={{ marginInline: 2 }}
                  >
                    <button
                      className="page-link"
                      onClick={() => setPageNum(page)}
                      disabled={pageNum === page}
                    >
                      {page}
                    </button>
                  </li>
                )
              })}

              <li className={`page-item ${pageNum === totalPages ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => setPageNum((p) => p + 1)}
                  disabled={pageNum === totalPages}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </>
      )}
    </div>
  )
}

export default App