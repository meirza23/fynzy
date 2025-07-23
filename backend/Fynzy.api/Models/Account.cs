using System.ComponentModel.DataAnnotations;

namespace Fynzy.api.Models
{
    public class Account
    {
        public int Id { get; set; }
        
        [Required]
        public decimal Balance { get; set; }
        
        [Required]
        public DateTime LastUpdated { get; set; }
        
        [Required]
        public int UserId { get; set; }
        public User? User { get; set; }
    }
}