using System.ComponentModel.DataAnnotations;

namespace backend.Data
{
    /// <summary>
    /// JSON body for POST and PUT book endpoints (no BookID — id comes from route on PUT).
    /// </summary>
    public class BookWriteDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Author { get; set; } = string.Empty;

        [Required]
        public string Publisher { get; set; } = string.Empty;

        [Required]
        public string ISBN { get; set; } = string.Empty;

        [Required]
        public string Classification { get; set; } = string.Empty;

        [Required]
        public string Category { get; set; } = string.Empty;

        [Range(0, int.MaxValue)]
        public int PageCount { get; set; }

        [Range(0, double.MaxValue)]
        public double Price { get; set; }
    }
}
