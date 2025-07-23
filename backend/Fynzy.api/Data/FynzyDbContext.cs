using Fynzy.api.Models;
using Microsoft.EntityFrameworkCore;

namespace Fynzy.api.Data
{
    public class FynzyDbContext : DbContext
    {
        public FynzyDbContext(DbContextOptions<FynzyDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<Account> Accounts { get; set; }
    }
}