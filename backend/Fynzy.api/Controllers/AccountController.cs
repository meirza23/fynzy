using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Fynzy.api.Data;
using Fynzy.api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Fynzy.api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly FynzyDbContext _context;

        public AccountController(FynzyDbContext context)
        {
            _context = context;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetAccountSummary()
        {
            // FIX: Use custom claim type "userId"
            var userIdClaim = User.FindFirst("userId");
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized();
            }
            
            // HESAP OLUŞTURMA KONTROLÜ EKLENDİ
            var account = await _context.Accounts
                .FirstOrDefaultAsync(a => a.UserId == userId);
                
            if (account == null)
            {
                // Hesap yoksa oluştur
                account = new Account
                {
                    Balance = 0,
                    LastUpdated = DateTime.UtcNow,
                    UserId = userId
                };
                _context.Accounts.Add(account);
                await _context.SaveChangesAsync();
            }
            
            // Transactions null kontrolü eklendi
            var transactions = await _context.Transactions
                .Where(t => t.UserId == userId)
                .ToListAsync() ?? new List<Transaction>();
                
            var income = transactions
                .Where(t => t.Type == "income")
                .Sum(t => t.Amount);
                
            var expense = transactions
                .Where(t => t.Type == "expense")
                .Sum(t => t.Amount);
            
            return Ok(new {
                balance = account.Balance,
                income,
                expense,
                lastUpdated = account.LastUpdated
            });
        }
    }
}