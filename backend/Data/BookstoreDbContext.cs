using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public class BookstoreDbContext : DbContext
    {
        // EF Core DbContext for the Bookstore.sqlite database
        public BookstoreDbContext(DbContextOptions<BookstoreDbContext> options) : base(options) { 
        
        }

        // This is the table of books in the SQLite database
        public DbSet<Book> Books { get; set; }
    }
}
