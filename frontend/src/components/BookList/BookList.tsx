import { useEffect, useState } from 'react'
import { Tooltip } from 'bootstrap'
import {
  fetchAllBooks,
  fetchBookCategories,
  fetchBookClassifications,
} from '../../api/BooksAPI'
import Pagination from '../Pagination'
import { useCart } from '../../context/CartContext'
import type { Book } from '../../types/Book'

const BOOK_LIST_STATE_KEY = 'bookListViewState'

const SORT_OPTIONS = [
  { label: 'No sort', value: 'none' },
  { label: 'Title (A–Z)', value: 'asc' },
  { label: 'Title (Z–A)', value: 'desc' },
] as const

type SortMode = (typeof SORT_OPTIONS)[number]['value']

interface BookListViewState {
  pageNum: number
  pageHowMany: number
  sortMode: SortMode
  selectedCategories: string[]
  selectedClassifications: string[]
}

function loadSavedViewState(): BookListViewState {
  const fallback: BookListViewState = {
    pageNum: 1,
    pageHowMany: 5,
    sortMode: 'none',
    selectedCategories: [],
    selectedClassifications: [],
  }

  const raw = sessionStorage.getItem(BOOK_LIST_STATE_KEY)
  if (!raw) return fallback

  try {
    const parsed = JSON.parse(raw) as Partial<BookListViewState>
    return {
      pageNum:
        typeof parsed.pageNum === 'number' && parsed.pageNum > 0
          ? parsed.pageNum
          : fallback.pageNum,
      pageHowMany:
        typeof parsed.pageHowMany === 'number' &&
        [5, 10, 20].includes(parsed.pageHowMany)
          ? parsed.pageHowMany
          : fallback.pageHowMany,
      sortMode:
        parsed.sortMode === 'asc' ||
        parsed.sortMode === 'desc' ||
        parsed.sortMode === 'none'
          ? parsed.sortMode
          : fallback.sortMode,
      selectedCategories: Array.isArray(parsed.selectedCategories)
        ? parsed.selectedCategories.filter((c): c is string => typeof c === 'string')
        : fallback.selectedCategories,
      selectedClassifications: Array.isArray(parsed.selectedClassifications)
        ? parsed.selectedClassifications.filter(
            (c): c is string => typeof c === 'string',
          )
        : fallback.selectedClassifications,
    }
  } catch {
    return fallback
  }
}

function sameStringArrayOrder(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i])
}

function BookList() {
  const savedViewState = loadSavedViewState()

  // Core bits of state the rubric cares about
  const [books, setBooks] = useState<Book[]>([])
  const [pageNum, setPageNum] = useState(savedViewState.pageNum)
  const [pageHowMany, setPageHowMany] = useState(savedViewState.pageHowMany)
  const [totalBooks, setTotalBooks] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [classifications, setClassifications] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    savedViewState.selectedCategories
  )
  const [selectedClassifications, setSelectedClassifications] = useState<
    string[]
  >(savedViewState.selectedClassifications)
  const [isCategoryPanelOpen, setIsCategoryPanelOpen] = useState(true)
  const [isClassificationPanelOpen, setIsClassificationPanelOpen] =
    useState(true)
  const { addToCart, totalItems, totalPrice } = useCart()

  const categoryToId = (category: string) =>
    `cat-${category.replace(/[^a-zA-Z0-9_-]/g, '-')}`

  const classificationToId = (classification: string) =>
    `cls-${classification.replace(/[^a-zA-Z0-9_-]/g, '-')}`

  // Default to whatever order the DB already has, then let the user opt into A–Z / Z–A
  const [sortMode, setSortMode] = useState<SortMode>(savedViewState.sortMode)

  useEffect(() => {
    // Save exactly where I am in the list so "Continue Shopping" can restore this view.
    const stateToSave: BookListViewState = {
      pageNum,
      pageHowMany,
      sortMode,
      selectedCategories,
      selectedClassifications,
    }
    sessionStorage.setItem(BOOK_LIST_STATE_KEY, JSON.stringify(stateToSave))
  }, [
    pageNum,
    pageHowMany,
    sortMode,
    selectedCategories,
    selectedClassifications,
  ])

  useEffect(() => {
    const loadBooks = async () => {
      setLoading(true)
      setError(null)

      try {
        const [data, fetchedCategories, fetchedClassifications] =
          await Promise.all([
            fetchAllBooks({
              pageHowMany,
              pageNum,
              sortMode,
              categories: selectedCategories,
              classifications: selectedClassifications,
            }),
            fetchBookCategories(),
            fetchBookClassifications(),
          ])

        setBooks(data.books)
        setTotalBooks(data.totalBooks)
        setCategories(fetchedCategories)
        setClassifications(fetchedClassifications)
        // Only update if values changed; .filter() always returns a new array and would
        // retrigger this effect (deps include selected*) → infinite requests.
        setSelectedCategories((prev) => {
          const next = prev.filter((category) =>
            fetchedCategories.includes(category),
          )
          return sameStringArrayOrder(prev, next) ? prev : next
        })
        setSelectedClassifications((prev) => {
          const next = prev.filter((c) =>
            fetchedClassifications.includes(c),
          )
          return sameStringArrayOrder(prev, next) ? prev : next
        })
      } catch (err: unknown) {
        console.error(err)
        setError(
          err instanceof Error ? err.message : 'Failed to load book catalog',
        )
      } finally {
        setLoading(false)
      }
    }

    loadBooks()
  }, [
    pageNum,
    pageHowMany,
    sortMode,
    selectedCategories,
    selectedClassifications,
  ])

  useEffect(() => {
    // Bootstrap feature #2: enable tooltip behavior for Add-to-cart buttons.
    const tooltipTriggerList = Array.from(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    )
    const tooltipList = tooltipTriggerList.map(
      (el) => new Tooltip(el as HTMLElement)
    )

    return () => {
      tooltipList.forEach((tooltip) => tooltip.dispose())
    }
  }, [books])

  const totalPages = Math.ceil(totalBooks / pageHowMany) || 1

  return (
    <div className="container-fluid px-3 px-md-4 my-4 min-w-0">
      <h1 className="mb-4 text-center">Bookstore</h1>

      {/* Bootstrap Grid layout: sidebar + main content */}
      <div className="row g-4">
        {/* Category checkbox list on the left */}
        <aside className="col-12 col-md-4 col-lg-3">
          {/* Bootstrap accordion: two independent panels (no data-bs-parent so both can stay open) */}
          <div className="accordion" id="filtersAccordion">
            <div className="accordion-item">
              <h2 className="accordion-header">
                <button
                  className={`accordion-button ${isCategoryPanelOpen ? '' : 'collapsed'}`}
                  type="button"
                  aria-expanded={isCategoryPanelOpen}
                  aria-controls="categoryFilterPanel"
                  onClick={() => setIsCategoryPanelOpen((prev) => !prev)}
                >
                  Filter by category
                </button>
              </h2>
              <div
                id="categoryFilterPanel"
                className={`accordion-collapse collapse ${isCategoryPanelOpen ? 'show' : ''}`}
              >
                <div className="accordion-body">
                  {loading && categories.length === 0 ? (
                    <div className="text-muted">Loading categories…</div>
                  ) : categories.length === 0 ? (
                    <div className="text-muted">No categories in the catalog yet.</div>
                  ) : (
                    <>
                      {selectedCategories.length === 0 && (
                        <div className="text-muted mb-2">Showing all categories</div>
                      )}

                      {categories.map((c) => {
                        const checked = selectedCategories.includes(c)
                        const id = categoryToId(c)
                        return (
                          <div className="form-check" key={c}>
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={id}
                              checked={checked}
                              onChange={() => {
                                setPageNum(1)
                                setSelectedCategories((prev) => {
                                  if (prev.includes(c)) {
                                    return prev.filter((x) => x !== c)
                                  }
                                  return [...prev, c]
                                })
                              }}
                            />
                            <label className="form-check-label" htmlFor={id}>
                              {c}
                            </label>
                          </div>
                        )
                      })}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="accordion-item">
              <h2 className="accordion-header">
                <button
                  className={`accordion-button ${isClassificationPanelOpen ? '' : 'collapsed'}`}
                  type="button"
                  aria-expanded={isClassificationPanelOpen}
                  aria-controls="classificationFilterPanel"
                  onClick={() => setIsClassificationPanelOpen((prev) => !prev)}
                >
                  Filter by classification
                </button>
              </h2>
              <div
                id="classificationFilterPanel"
                className={`accordion-collapse collapse ${isClassificationPanelOpen ? 'show' : ''}`}
              >
                <div className="accordion-body">
                  {loading && classifications.length === 0 ? (
                    <div className="text-muted">Loading classifications…</div>
                  ) : classifications.length === 0 ? (
                    <div className="text-muted">
                      No classifications in the catalog yet.
                    </div>
                  ) : (
                    <>
                      {selectedClassifications.length === 0 && (
                        <div className="text-muted mb-2">
                          Showing all classifications
                        </div>
                      )}

                      {classifications.map((c) => {
                        const checked = selectedClassifications.includes(c)
                        const id = classificationToId(c)
                        return (
                          <div className="form-check" key={c}>
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={id}
                              checked={checked}
                              onChange={() => {
                                setPageNum(1)
                                setSelectedClassifications((prev) => {
                                  if (prev.includes(c)) {
                                    return prev.filter((x) => x !== c)
                                  }
                                  return [...prev, c]
                                })
                              }}
                            />
                            <label className="form-check-label" htmlFor={id}>
                              {c}
                            </label>
                          </div>
                        )
                      })}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-outline-secondary btn-sm mt-3 w-100"
            onClick={() => {
              setPageNum(1)
              setSelectedCategories([])
              setSelectedClassifications([])
            }}
            disabled={
              selectedCategories.length === 0 &&
              selectedClassifications.length === 0
            }
          >
            Reset all filters
          </button>
        </aside>

        {/* Right side: paging controls + table */}
        <div className="col-12 col-md-8 col-lg-9 min-w-0">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <label className="form-label me-2 mb-0">Sort:</label>
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
              <div className="table-responsive">
                <table className="table table-striped table-bordered booklist-table">
                  <thead className="table-light">
                    <tr>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Publisher</th>
                      <th>ISBN</th>
                      <th>Category</th>
                      <th>Classification</th>
                      <th>Pages</th>
                      <th className="text-end">Price</th>
                      <th className="text-center">Cart</th>
                    </tr>
                  </thead>

                  <tbody>
                    {books.map((book) => (
                      <tr key={book.bookID}>
                        <td className="text-break">{book.title}</td>
                        <td>{book.author}</td>
                        <td className="text-break">{book.publisher}</td>
                        <td>{book.isbn}</td>
                        <td>{book.category}</td>
                        <td>{book.classification}</td>
                        <td>{book.pageCount}</td>
                        <td className="text-end">${book.price.toFixed(2)}</td>
                        <td className="text-center text-nowrap">
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                            title="Add this book to cart"
                            onClick={() => addToCart(book)}
                          >
                            Add
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="d-flex justify-content-end mb-3">
                <div className="card p-2 px-3">
                  <div className="small text-muted">Cart summary</div>
                  <div className="fw-semibold">
                    {totalItems} items | ${totalPrice.toFixed(2)}
                  </div>
                </div>
              </div>

              <Pagination
                currentPage={pageNum}
                totalPages={totalPages}
                pageSize={pageHowMany}
                onPageChange={setPageNum}
                onPageSizeChange={(size) => {
                  setPageNum(1)
                  setPageHowMany(size)
                }}
                ariaLabel="Book pagination"
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default BookList

