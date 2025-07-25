using System.Security.Claims;
using Fynzy.api.Data;
using Fynzy.api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

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

        // GET: api/transactions
        [HttpGet]
        public async Task<IActionResult> GetTransactions()
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized();

            var transactions = await _context.Transactions
                .Where(t => t.UserId == userId)
                .OrderByDescending(t => t.Date)
                .ToListAsync();

            return Ok(transactions);
        }

        // POST: api/transactions
        [HttpPost]
        public async Task<IActionResult> AddTransaction([FromBody] TransactionRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetUserId();
            if (userId == null)
                return Unauthorized();

            // HESAP OLUŞTURMA KONTROLÜ EKLENDİ
            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.UserId == userId);
            if (account == null)
            {
                // Hesap yoksa oluştur
                account = new Account
                {
                    Balance = 0,
                    LastUpdated = DateTime.UtcNow,
                    UserId = userId.Value
                };
                _context.Accounts.Add(account);
                await _context.SaveChangesAsync();
            }

            var transaction = new Transaction
            {
                Type = request.Type,
                Category = request.Category,
                Amount = request.Amount,
                Date = DateTime.SpecifyKind(request.Date, DateTimeKind.Utc),
                Description = request.Description ?? "",
                UserId = userId.Value
            };

            if (request.Type == "income")
                account.Balance += request.Amount;
            else
                account.Balance -= request.Amount;

            account.LastUpdated = DateTime.UtcNow;

            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "İşlem başarıyla eklendi",
                transactionId = transaction.Id,
                newBalance = account.Balance
            });
        }

        // DELETE: api/transactions/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTransaction(int id)
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized();

            var transaction = await _context.Transactions.FindAsync(id);
            if (transaction == null || transaction.UserId != userId)
                return NotFound();

            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.UserId == userId);
            if (account == null)
                return NotFound("Account not found");

            // İşlemin tersini uygula
            if (transaction.Type == "income")
                account.Balance -= transaction.Amount;
            else
                account.Balance += transaction.Amount;

            account.LastUpdated = DateTime.UtcNow;

            _context.Transactions.Remove(transaction);
            await _context.SaveChangesAsync();

            return Ok(new 
            {
                message = "İşlem başarıyla silindi",
                newBalance = account.Balance
            });
        }

        // FIX: Use custom claim type "userId"
        private int? GetUserId()
        {
            var userIdClaim = User.FindFirst("userId");
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                return null;
            return userId;
        }
    }

    // POST işlemi için DTO + doğrulamalar
    public class TransactionRequest
    {
        [Required]
        public string Type { get; set; } = string.Empty;

        [Required]
        public string Category { get; set; } = string.Empty;

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Tutar 0'dan büyük olmalı.")]
        public decimal Amount { get; set; }

        [Required]
        public DateTime Date { get; set; }

        public string? Description { get; set; }
    }
}