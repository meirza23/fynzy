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
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized();
            }
            
            var account = await _context.Accounts
                .FirstOrDefaultAsync(a => a.UserId == userId);
                
            if (account == null)
            {
                return BadRequest("Hesap bulunamadı");
            }
            
            var transactions = await _context.Transactions
                .Where(t => t.UserId == userId)
                .ToListAsync();
                
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