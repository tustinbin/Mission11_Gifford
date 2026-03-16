// Keep the TS shape in sync with what the API returns for a single book
export interface Book {
    bookID: number
    title: string
    author: string
    publisher: string
    isbn: string
    category: string
    pageCount: number
    price: number
  }