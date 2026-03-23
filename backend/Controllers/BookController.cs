using backend.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookController : ControllerBase
    {
        // Hold onto the EF Core context so I can query the DB
        private BookstoreDbContext _context;
        public BookController(BookstoreDbContext temp) {
            _context = temp;
        }

        [HttpGet("AllBooks")]
        // Main endpoint the React app calls to get paged (and optionally sorted/filtered) books
        public IActionResult GetBooks(
            int pageHowMany = 10,
            int pageNum = 1,
            bool? sortTitleAsc = null,
            [FromQuery] List<string>? categories = null)
        {

            // Start with the full books query from EF
            var query = _context.Books.AsQueryable();

            // If the user selected one or more categories, filter down first.
            // Otherwise, return all books (default behavior).
            if (categories != null && categories.Any())
            {
                query = query.Where(b => categories.Contains(b.Category));
            }

            // If the user asked for sorting, apply it here
            if (sortTitleAsc is true)
            {
                query = query.OrderBy(b => b.Title);
            }
            else if (sortTitleAsc is false) {
                query = query.OrderByDescending(b => b.Title);

            }

            // Total count for pagination UI on the frontend
            var totalBooks = query.Count();

            // Apply pagination: skip to the right page and take only what I need
            var data = query.Skip((pageNum - 1) * pageHowMany).Take(pageHowMany).ToList();

            return Ok(new
            {
                // Shape this to match what the React app expects
                Books = data,
                TotalBooks = totalBooks
            });
        }

        [HttpGet("GetBookCategories")]
        // Simple endpoint for the React checkbox list (distinct categories from the DB)
        public IActionResult GetBookCategories()
        {
            var categories = _context.Books
                .Select(b => b.Category)
                .Distinct()
                .OrderBy(c => c)
                .ToList();

            return Ok(categories);
        }
    }
}
