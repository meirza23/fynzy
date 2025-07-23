using System.ComponentModel.DataAnnotations;

namespace Fynzy.api.Models
{
    public class Transaction
    {
        public int Id { get; set; }
        
        [Required]
        public string Type { get; set; } = string.Empty;
        
        [Required]
        public string Category { get; set; } = string.Empty;
        
        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Amount { get; set; }
        
        [Required]
        public DateTime Date { get; set; }
        
        public string? Description { get; set; }
        
        [Required]
        public int UserId { get; set; }
        public User? User { get; set; }
    }
}