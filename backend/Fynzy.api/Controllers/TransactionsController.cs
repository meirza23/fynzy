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

            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.UserId == userId);
            if (account == null)
                return BadRequest("Hesap bulunamadı");

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

        // Yardımcı metot: Kullanıcı ID'sini JWT'den çek
        private int? GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
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
