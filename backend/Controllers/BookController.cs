using backend.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookController : ControllerBase
    {
        private BookstoreDbContext _context;
        public BookController(BookstoreDbContext temp) {
            _context = temp;
        }


    }
}
