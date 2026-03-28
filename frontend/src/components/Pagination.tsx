const DEFAULT_PAGE_SIZES = [5, 10, 20] as const

export interface PaginationProps {
  currentPage: number
  totalPages: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  /** When page size changes, parent should reset current page to 1. */
  pageSizeOptions?: readonly number[]
  ariaLabel?: string
}

function Pagination({
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  ariaLabel = 'Pagination',
}: PaginationProps) {
  return (
    <div>
      <div className="d-flex flex-wrap align-items-center gap-2 justify-content-center mb-3">
        <label className="form-label mb-0">Results per page:</label>
        <select
          className="form-select w-auto"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      <nav aria-label={ariaLabel}>
        <ul className="pagination justify-content-center flex-wrap">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button
              type="button"
              className="page-link"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
          </li>

          {Array.from({ length: totalPages }, (_, idx) => {
            const page = idx + 1
            return (
              <li
                key={page}
                className={`page-item ${currentPage === page ? 'active' : ''}`}
                style={{ marginInline: 2 }}
              >
                <button
                  type="button"
                  className="page-link"
                  onClick={() => onPageChange(page)}
                  disabled={currentPage === page}
                >
                  {page}
                </button>
              </li>
            )
          })}

          <li
            className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}
          >
            <button
              type="button"
              className="page-link"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    </div>
  )
}

export default Pagination
