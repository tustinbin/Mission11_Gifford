using Microsoft.EntityFrameworkCore;
using backend.Data;

// Spin up the web app and DI container
var builder = WebApplication.CreateBuilder(args);

// Turn on attribute-routed controllers instead of minimal APIs
builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Wire up EF Core to use my local SQLite Bookstore database
builder.Services.AddDbContext<BookstoreDbContext>(options =>
{
    options.UseSqlite(builder.Configuration.GetConnectionString("BookstoreConnection"));
});

// Allow calls from the Vite dev server
builder.Services.AddCors(options =>
    options.AddPolicy("AllowReactAppBlah", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://blue-water-0f7b48e1e.2.azurestaticapps.net")
              .AllowAnyMethod()
              .AllowAnyHeader();
    }));

var app = builder.Build();

// Configure the HTTP request pipeline.
// Only expose the OpenAPI UI while I'm in Development
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Lock CORS down to my React dev origin (methods + headers required for POST/PUT/DELETE preflight)
app.UseCors("AllowReactAppBlah");

app.UseHttpsRedirection();

app.UseAuthorization();

// Map all [ApiController] controllers
app.MapControllers();

app.Run();
