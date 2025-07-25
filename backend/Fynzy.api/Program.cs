using Microsoft.EntityFrameworkCore;
using Fynzy.api.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt; // Added for JwtSecurityTokenHandler

var builder = WebApplication.CreateBuilder(args);

// DbContext
builder.Services.AddDbContext<FynzyDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("PostgreSQL")));

// Controllers
builder.Services.AddControllers();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials()
              .SetIsOriginAllowed(_ => true);
    });
});

var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrEmpty(jwtKey))
{
    throw new InvalidOperationException("JWT key is missing in configuration.");
}

// FIX: Clear default claim mappings
JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
        options.TokenValidationParameters = new TokenValidationParameters {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            // FIX: Use custom claim type for identification
            NameClaimType = "userId"
        };

        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine($"JWT AUTH HATASI: {context.Exception.Message}");
                Console.WriteLine($"TOKEN: {context.Request.Headers["Authorization"]}");
                return Task.CompletedTask;
            },
            OnTokenValidated = context =>
            {
                Console.WriteLine("JWT TOKEN BAŞARIYLA DOĞRULANDI");
                // FIX: Log custom userId claim instead of NameIdentifier
                Console.WriteLine($"KULLANICI ID: {context.Principal?.FindFirst("userId")?.Value}");
                return Task.CompletedTask;
            }
        };
    });

var app = builder.Build();

// Hata loglama middleware'i
app.Use(async (context, next) =>
{
    try
    {
        await next();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"HATA DETAYI: {ex}");
        Console.WriteLine($"İSTEK YOLU: {context.Request.Path}");
        Console.WriteLine($"AUTH HEADER: {context.Request.Headers["Authorization"]}");
        throw;
    }
});

// Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRouting();

app.UseCors("ReactPolicy");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// DB Migration otomatik
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<FynzyDbContext>();
    dbContext.Database.Migrate();
}

app.Run();