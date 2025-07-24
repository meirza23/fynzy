using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Fynzy.api.Data;
using Fynzy.api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Fynzy.api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly FynzyDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(
            FynzyDbContext context,
            IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                // Email kontrolü
                if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                {
                    return BadRequest("Bu e-posta zaten kullanılıyor");
                }

                // Yeni kullanıcı nesnesi oluştur
                var user = new User
                {
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    Email = request.Email,
                    Phone = request.Phone,
                    CreatedAt = DateTime.UtcNow
                };

                // Şifreyi hashle
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

                // Kullanıcıyı kaydet
                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                return Ok(new { 
                    message = "Kullanıcı başarıyla oluşturuldu",
                    userId = user.Id
                });
            }
            catch (DbUpdateException ex)
            {
                // Database hatasını logla
                Console.WriteLine($"Database error: {ex.InnerException?.Message}");
                return StatusCode(500, "Database kayıt hatası");
            }
            catch (Exception ex)
            {
                // Genel hata
                Console.WriteLine($"Error: {ex.Message}");
                return StatusCode(500, "Beklenmeyen bir hata oluştu");
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == request.Email);

                if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                {
                    return Unauthorized("E-posta veya şifre hatalı");
                }

                // JWT token oluştur
                var token = GenerateJwtToken(user);

                return Ok(new { 
                    token,
                    user = new {
                        id = user.Id,
                        firstName = user.FirstName,
                        lastName = user.LastName,
                        email = user.Email
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Login error: {ex.Message}");
                return StatusCode(500, "Giriş işlemi sırasında hata oluştu");
            }
        }

        private string GenerateJwtToken(User user)
        {
            var jwtKey = _configuration["Jwt:Key"];
            if (string.IsNullOrEmpty(jwtKey))
            {
                throw new InvalidOperationException("JWT key is not configured.");
            }
            var securityKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey));
                
            var credentials = new SigningCredentials(
                securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim("fullName", $"{user.FirstName} {user.LastName}")
            };

            var expireHours = _configuration.GetValue<int>("Jwt:ExpireHours");
    
            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(expireHours), // Düzeltildi
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public class RegisterRequest
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string Password { get; set; } = string.Empty;
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}