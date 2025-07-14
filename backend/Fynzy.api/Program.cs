var builder = WebApplication.CreateBuilder(args);

// Servisleri ekle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS politikası ekle
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:5173")  // React portun
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Authorization servisini ekle (isteğe bağlı, JWT kullanacaksan lazım)
builder.Services.AddAuthorization();

// Controller servisleri
builder.Services.AddControllers();

var app = builder.Build();

// CORS middleware'ini kullan
app.UseCors("ReactPolicy");

// Swagger sadece developmentda açık olsun
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Https'yi dilersen açabilirsin
// app.UseHttpsRedirection();

// Authorization middleware (JWT falan kullanacaksan lazım)
app.UseAuthorization();

// Controller'ları eşleştir
app.MapControllers();

app.Run();
