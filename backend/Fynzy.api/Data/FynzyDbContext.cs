using Microsoft.EntityFrameworkCore;

namespace Fynzy.api.Data
{
    public class FynzyDbContext : DbContext
    {
        public FynzyDbContext(DbContextOptions<FynzyDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        
    }
}