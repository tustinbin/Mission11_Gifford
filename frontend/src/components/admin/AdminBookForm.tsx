import { useEffect, useState, type FormEvent } from 'react'
import type { Book } from '../../types/Book'
import type { BookPayload } from '../../api/BooksAPI'

export interface AdminBookFormProps {
  mode: 'create' | 'edit'
  /** Required when mode is edit */
  initialBook: Book | null
  submitting: boolean
  onSubmit: (data: BookPayload | Book) => Promise<void>
  onCancel: () => void
}

const emptyPayload: BookPayload = {
  title: '',
  author: '',
  publisher: '',
  isbn: '',
  classification: '',
  category: '',
  pageCount: 0,
  price: 0,
}

function AdminBookForm({
  mode,
  initialBook,
  submitting,
  onSubmit,
  onCancel,
}: AdminBookFormProps) {
  const [fields, setFields] = useState<BookPayload>(() =>
    mode === 'edit' && initialBook
      ? {
          title: initialBook.title,
          author: initialBook.author,
          publisher: initialBook.publisher,
          isbn: initialBook.isbn,
          classification: initialBook.classification,
          category: initialBook.category,
          pageCount: initialBook.pageCount,
          price: initialBook.price,
        }
      : { ...emptyPayload },
  )

  useEffect(() => {
    if (mode === 'edit' && initialBook) {
      setFields({
        title: initialBook.title,
        author: initialBook.author,
        publisher: initialBook.publisher,
        isbn: initialBook.isbn,
        classification: initialBook.classification,
        category: initialBook.category,
        pageCount: initialBook.pageCount,
        price: initialBook.price,
      })
    } else {
      setFields({ ...emptyPayload })
    }
  }, [mode, initialBook])

  function handleChange<K extends keyof BookPayload>(
    key: K,
    value: BookPayload[K],
  ) {
    setFields((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (mode === 'edit' && initialBook) {
      const updated: Book = { ...fields, bookID: initialBook.bookID }
      await onSubmit(updated)
    } else {
      await onSubmit(fields)
    }
  }

  return (
    <div className="card border-secondary mb-4">
      <div className="card-header bg-dark text-white">
        {mode === 'create' ? 'Add book' : 'Edit book'}
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label" htmlFor="admin-title">
                Title
              </label>
              <input
                id="admin-title"
                className="form-control"
                value={fields.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
                disabled={submitting}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="admin-author">
                Author
              </label>
              <input
                id="admin-author"
                className="form-control"
                value={fields.author}
                onChange={(e) => handleChange('author', e.target.value)}
                required
                disabled={submitting}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="admin-publisher">
                Publisher
              </label>
              <input
                id="admin-publisher"
                className="form-control"
                value={fields.publisher}
                onChange={(e) => handleChange('publisher', e.target.value)}
                required
                disabled={submitting}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="admin-isbn">
                ISBN
              </label>
              <input
                id="admin-isbn"
                className="form-control"
                value={fields.isbn}
                onChange={(e) => handleChange('isbn', e.target.value)}
                required
                disabled={submitting}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="admin-classification">
                Classification
              </label>
              <input
                id="admin-classification"
                className="form-control"
                value={fields.classification}
                onChange={(e) =>
                  handleChange('classification', e.target.value)
                }
                required
                disabled={submitting}
                placeholder="e.g. Fiction, Non-Fiction"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="admin-category">
                Category
              </label>
              <input
                id="admin-category"
                className="form-control"
                value={fields.category}
                onChange={(e) => handleChange('category', e.target.value)}
                required
                disabled={submitting}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label" htmlFor="admin-pages">
                Page count
              </label>
              <input
                id="admin-pages"
                type="number"
                min={0}
                className="form-control"
                value={fields.pageCount}
                onChange={(e) =>
                  handleChange('pageCount', Number(e.target.value))
                }
                required
                disabled={submitting}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label" htmlFor="admin-price">
                Price
              </label>
              <input
                id="admin-price"
                type="number"
                min={0}
                step="0.01"
                className="form-control"
                value={fields.price}
                onChange={(e) => handleChange('price', Number(e.target.value))}
                required
                disabled={submitting}
              />
            </div>
          </div>
          <div className="d-flex gap-2 mt-4">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Saving…' : mode === 'create' ? 'Create' : 'Save'}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminBookForm
