using System.ComponentModel.DataAnnotations;

namespace backend.Data
{
    public class Book
    {
        // Primary key for the book record in the DB
        [Key]
        public int BookID { get; set; }
        // Required fields, all mapped to non-nullable columns in the SQLite DB
        public string Title { get; set; }
        public string Author { get; set; }
        public string Publisher { get; set; }
        public string ISBN { get; set; }
        public string Category { get; set; }
        public int PageCount { get; set; }

        // Using double here since the SQLite column is REAL
        public double Price { get; set; }
    }
}
