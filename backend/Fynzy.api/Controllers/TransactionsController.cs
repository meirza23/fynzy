using System;
using System.Collections.Generic;
using System.Linq;
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
    public class TransactionsController : ControllerBase
    {
        private readonly FynzyDbContext _context;

        public TransactionsController(FynzyDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetTransactions()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized();
            }
            
            var transactions = await _context.Transactions
                .Where(t => t.UserId == userId)
                .OrderByDescending(t => t.Date)
                .ToListAsync();
                
            // Null durumunda boş dizi dön
            return Ok(transactions ?? new List<Transaction>());
        }

        [HttpPost]
        public async Task<IActionResult> AddTransaction([FromBody] TransactionRequest request)
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
            
            var transaction = new Transaction
            {
                Type = request.Type,
                Category = request.Category,
                Amount = request.Amount,
                Date = request.Date,
                Description = request.Description ?? "",
                UserId = userId
            };
            
            if (request.Type == "income")
            {
                account.Balance += request.Amount;
            }
            else
            {
                account.Balance -= request.Amount;
            }
            account.LastUpdated = DateTime.UtcNow;
            
            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();
            
            return Ok(new {
                message = "İşlem başarıyla eklendi",
                transactionId = transaction.Id,
                newBalance = account.Balance
            });
        }
    }

    public class TransactionRequest
    {
        public string Type { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public string? Description { get; set; }
    }
}