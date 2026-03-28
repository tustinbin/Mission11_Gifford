import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  createBook,
  deleteBook,
  fetchAllBooks,
  updateBook,
  type BookPayload,
} from '../api/BooksAPI'
import Pagination from '../components/Pagination'
import AdminBookForm from '../components/admin/AdminBookForm'
import { useCart } from '../context/CartContext'
import type { Book } from '../types/Book'

function AdminBooksPage() {
  const { syncCartBook, removeFromCart } = useCart()
  const [books, setBooks] = useState<Book[]>([])
  const [totalBooks, setTotalBooks] = useState(0)
  const [pageNum, setPageNum] = useState(1)
  const [pageHowMany, setPageHowMany] = useState(10)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [formSubmitting, setFormSubmitting] = useState(false)

  const totalPages = Math.ceil(totalBooks / pageHowMany) || 1

  const loadBooks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let page = pageNum
      let result = await fetchAllBooks({
        pageHowMany,
        pageNum: page,
        sortMode: 'none',
        categories: [],
        classifications: [],
      })

      if (result.books.length === 0 && result.totalBooks > 0 && page > 1) {
        page = page - 1
        setPageNum(page)
        result = await fetchAllBooks({
          pageHowMany,
          pageNum: page,
          sortMode: 'none',
          categories: [],
          classifications: [],
        })
      }

      setBooks(result.books)
      setTotalBooks(result.totalBooks)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load books.')
    } finally {
      setLoading(false)
    }
  }, [pageHowMany, pageNum])

  useEffect(() => {
    void loadBooks()
  }, [loadBooks])

  function openCreate() {
    setFormMode('create')
    setEditingBook(null)
    setShowForm(true)
  }

  function openEdit(book: Book) {
    setFormMode('edit')
    setEditingBook(book)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingBook(null)
  }

  async function handleFormSubmit(data: BookPayload | Book) {
    setFormSubmitting(true)
    setError(null)
    try {
      if ('bookID' in data && data.bookID > 0) {
        const updated = await updateBook(data as Book)
        syncCartBook(updated)
      } else {
        await createBook(data as BookPayload)
      }
      closeForm()
      await loadBooks()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed.')
    } finally {
      setFormSubmitting(false)
    }
  }

  async function handleDelete(book: Book) {
    if (
      !window.confirm(
        `Delete "${book.title}"? This cannot be undone.`,
      )
    ) {
      return
    }
    setError(null)
    try {
      await deleteBook(book.bookID)
      removeFromCart(book.bookID)
      await loadBooks()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed.')
    }
  }

  return (
    <div className="container-fluid px-3 px-md-4 my-4 min-w-0">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <h1 className="mb-0">Admin — Books</h1>
        <div className="d-flex gap-2">
          {!showForm && (
            <button type="button" className="btn btn-primary" onClick={openCreate}>
              Add book
            </button>
          )}
          <Link to="/" className="btn btn-outline-secondary">
            Back to bookstore
          </Link>
        </div>
      </div>

      <p className="text-muted small mb-4">
        Create, edit, or remove books in the database. The public catalog on the home page
        stays read-only for shoppers.
      </p>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {showForm && (
        <AdminBookForm
          mode={formMode}
          initialBook={editingBook}
          submitting={formSubmitting}
          onSubmit={handleFormSubmit}
          onCancel={closeForm}
        />
      )}

      {loading ? (
        <p className="text-muted">Loading books…</p>
      ) : (
        <>
          <div className="table-responsive min-w-0">
            <table className="table table-bordered table-striped table-hover align-middle mb-0 booklist-table">
              <thead className="table-dark">
                <tr>
                  <th scope="col">Title</th>
                  <th scope="col">Author</th>
                  <th scope="col">Category</th>
                  <th scope="col">Classification</th>
                  <th scope="col" className="text-end">
                    Price
                  </th>
                  <th scope="col" className="text-end">
                    Pages
                  </th>
                  <th scope="col">ISBN</th>
                  <th scope="col">Publisher</th>
                  <th scope="col" className="text-end">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {books.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center text-muted py-4">
                      No books on this page.
                    </td>
                  </tr>
                ) : (
                  books.map((book) => (
                    <tr key={book.bookID}>
                      <td className="text-break">{book.title}</td>
                      <td>{book.author}</td>
                      <td>{book.category}</td>
                      <td>{book.classification}</td>
                      <td className="text-end">${book.price.toFixed(2)}</td>
                      <td className="text-end">{book.pageCount}</td>
                      <td className="small text-break">{book.isbn}</td>
                      <td className="small text-break">{book.publisher}</td>
                      <td className="text-end text-nowrap">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => openEdit(book)}
                          disabled={showForm}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => void handleDelete(book)}
                          disabled={showForm}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={pageNum}
            totalPages={totalPages}
            pageSize={pageHowMany}
            onPageChange={setPageNum}
            onPageSizeChange={(size) => {
              setPageHowMany(size)
              setPageNum(1)
            }}
            ariaLabel="Admin books pagination"
          />
        </>
      )}
    </div>
  )
}

export default AdminBooksPage
