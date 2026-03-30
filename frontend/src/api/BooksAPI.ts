import type { Book } from '../types/Book'

/** Base URL for the ASP.NET API (HTTPS port from launchSettings). */
const API_URL = 'https://mission11-gifford-backend10-hwg4cef2hafzftaf.francecentral-01.azurewebsites.net'

export type BooksSortMode = 'none' | 'asc' | 'desc'

export interface AllBooksResult {
  books: Book[]
  totalBooks: number
}

/**
 * Distinct category values for filter checkboxes.
 */
export async function fetchBookCategories(): Promise<string[]> {
  const response = await fetch(`${API_URL}/api/Book/GetBookCategories`)
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }
  return response.json()
}

/**
 * Distinct classification values (Fiction, Non-Fiction, etc.) for filter checkboxes.
 */
export async function fetchBookClassifications(): Promise<string[]> {
  const response = await fetch(`${API_URL}/api/Book/GetBookClassifications`)
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }
  return response.json()
}

/**
 * Paged book list with optional title sort and multi-category filter.
 */
export async function fetchAllBooks(params: {
  pageHowMany: number
  pageNum: number
  sortMode: BooksSortMode
  categories: string[]
  classifications?: string[]
}): Promise<AllBooksResult> {
  const { pageHowMany, pageNum, sortMode, categories, classifications = [] } =
    params

  const sortParam =
    sortMode === 'none'
      ? ''
      : `&sortTitleAsc=${sortMode === 'asc' ? 'true' : 'false'}`

  const categoriesParam = categories
    .map((c) => `&categories=${encodeURIComponent(c)}`)
    .join('')

  const classificationsParam = classifications
    .map((c) => `&classifications=${encodeURIComponent(c)}`)
    .join('')

  const url = `${API_URL}/api/Book/AllBooks?pageHowMany=${pageHowMany}&pageNum=${pageNum}${sortParam}${categoriesParam}${classificationsParam}`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  const data = await response.json()
  return {
    books: data.books ?? data.Books,
    totalBooks: data.totalBooks ?? data.TotalBooks,
  }
}

function normalizeBook(raw: Record<string, unknown>): Book {
  return {
    bookID: Number(raw.bookID ?? raw.BookID ?? 0),
    title: String(raw.title ?? raw.Title ?? ''),
    author: String(raw.author ?? raw.Author ?? ''),
    publisher: String(raw.publisher ?? raw.Publisher ?? ''),
    isbn: String(raw.isbn ?? raw.ISBN ?? ''),
    classification: String(
      raw.classification ?? raw.Classification ?? '',
    ),
    category: String(raw.category ?? raw.Category ?? ''),
    pageCount: Number(raw.pageCount ?? raw.PageCount ?? 0),
    price: Number(raw.price ?? raw.Price ?? 0),
  }
}

export type BookPayload = Omit<Book, 'bookID'>

/**
 * Create a book (server assigns BookID).
 */
export async function createBook(payload: BookPayload): Promise<Book> {
  const response = await fetch(`${API_URL}/api/Book`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(`Create failed with status ${response.status}`)
  }
  const data = (await response.json()) as Record<string, unknown>
  return normalizeBook(data)
}

/**
 * Update an existing book by id.
 */
export async function updateBook(book: Book): Promise<Book> {
  const { bookID, ...rest } = book
  const response = await fetch(`${API_URL}/api/Book/${bookID}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rest),
  })
  if (!response.ok) {
    throw new Error(`Update failed with status ${response.status}`)
  }
  const data = (await response.json()) as Record<string, unknown>
  return normalizeBook(data)
}

/**
 * Delete a book by id.
 */
export async function deleteBook(bookID: number): Promise<void> {
  const response = await fetch(`${API_URL}/api/Book/${bookID}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error(`Delete failed with status ${response.status}`)
  }
}
