using FInd_Op_Web.Data;
using FInd_Op_Web.Services;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;
using Microsoft.EntityFrameworkCore;
using PayOS;
using CloudinaryDotNet;

var builder = WebApplication.CreateBuilder(args);

// Add CORS Policy to allow React frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173", "http://127.0.0.1:5173") // Default Vite port
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

// Add DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.ASCII.GetBytes(jwtSettings["Key"]!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) &&
                (path.StartsWithSegments("/notificationHub") || path.StartsWithSegments("/chatHub")))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

// Add Authorization
builder.Services.AddAuthorization();

// Add Services
builder.Services.AddScoped<IAuthenticationService, AuthenticationService>();
builder.Services.AddScoped<PortalDataService>();
builder.Services.AddScoped<FInd_Op_Web.Services.IEmailService, FInd_Op_Web.Services.EmailService>();
builder.Services.AddHostedService<FInd_Op_Web.Services.MonthlyInvoiceService>();

// Add API Controllers
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});

// Configure PayOS (optional - app still works without it)
var payosClientId = builder.Configuration["PayOS:ClientId"];
var payosApiKey = builder.Configuration["PayOS:ApiKey"];
var payosChecksumKey = builder.Configuration["PayOS:ChecksumKey"];

if (!string.IsNullOrEmpty(payosClientId) && payosClientId != "YOUR_CLIENT_ID"
    && !string.IsNullOrEmpty(payosApiKey) && payosApiKey != "YOUR_API_KEY"
    && !string.IsNullOrEmpty(payosChecksumKey) && payosChecksumKey != "YOUR_CHECKSUM_KEY")
{
    try
    {
        PayOSClient payOS = new PayOSClient(payosClientId, payosApiKey, payosChecksumKey);
        builder.Services.AddSingleton(payOS);
        Console.WriteLine("✅ PayOS initialized successfully.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"⚠️ PayOS initialization failed: {ex.Message}. Payment features will be unavailable.");
    }
}
else
{
    Console.WriteLine("⚠️ PayOS credentials not configured. Payment features will be unavailable.");
}

// Configure Cloudinary
var cloudinarySettings = builder.Configuration.GetSection("Cloudinary");
if (cloudinarySettings.Exists() && !string.IsNullOrEmpty(cloudinarySettings["CloudName"]) && cloudinarySettings["CloudName"] != "YOUR_CLOUD_NAME")
{
    try
    {
        var account = new Account(
            cloudinarySettings["CloudName"],
            cloudinarySettings["ApiKey"],
            cloudinarySettings["ApiSecret"]);
        var cloudinary = new Cloudinary(account);
        builder.Services.AddSingleton(cloudinary);
        Console.WriteLine("✅ Cloudinary initialized successfully.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"⚠️ Cloudinary initialization failed: {ex.Message}. Image upload will be unavailable.");
    }
}
else
{
    Console.WriteLine("⚠️ Cloudinary credentials not configured. Image upload will be unavailable.");
}

// Add Swagger for testing APIs
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.CustomSchemaIds(type => type.FullName);
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "FindFootball API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

// Add SignalR
builder.Services.AddSignalR();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    try
    {
        context.Database.ExecuteSqlRaw("IF COL_LENGTH('Users', 'AvatarUrl') IS NULL ALTER TABLE Users ADD AvatarUrl nvarchar(max) NULL;");
        context.Database.ExecuteSqlRaw("IF COL_LENGTH('Teams', 'LogoUrl') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [__EFMigrationsHistory] WHERE MigrationId = '20260525092917_AddTeamLogoUrl') INSERT INTO [__EFMigrationsHistory] (MigrationId, ProductVersion) VALUES ('20260525092917_AddTeamLogoUrl', '8.0.0');");
        context.Database.ExecuteSqlRaw("IF NOT EXISTS (SELECT 1 FROM [__EFMigrationsHistory] WHERE MigrationId = '20260605044403_AddAvatarUrlToUser') INSERT INTO [__EFMigrationsHistory] (MigrationId, ProductVersion) VALUES ('20260605044403_AddAvatarUrlToUser', '8.0.0');");
    }
    catch (Exception ex)
    {
        Console.WriteLine("Warning: Could not run schema fix SQL: " + ex.Message);
    }
    
    try 
    {
        Console.WriteLine("Applying EF Core Migrations...");
        context.Database.Migrate();
        DbSeeder.Seed(context);
    }
    catch (Exception ex)
    {
        Console.WriteLine("Warning: Could not run EF Migrations or Seed: " + ex.Message);
        try { System.IO.File.WriteAllText("wwwroot/error.txt", ex.ToString()); } catch { }
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseExceptionHandler(c => c.Run(async context =>
{
    var exception = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>()?.Error;
    context.Response.StatusCode = 500;
    context.Response.ContentType = "application/json";
    
    // Write exception to wwwroot/error.txt for debugging
    try
    {
        var env = context.RequestServices.GetRequiredService<IWebHostEnvironment>();
        var errorFile = Path.Combine(env.WebRootPath, "error.txt");
        var logMessage = $"[{DateTime.UtcNow}] Error: {exception?.Message}\nStackTrace: {exception?.StackTrace}\nInner: {exception?.InnerException?.Message}\n\n";
        System.IO.File.AppendAllText(errorFile, logMessage);
    }
    catch { }

    await context.Response.WriteAsJsonAsync(new { message = exception?.Message, stack = exception?.StackTrace, type = exception?.GetType().Name });
}));

// Enable CORS FIRST — before anything else that might send a response
app.UseCors("AllowReactApp");

// Only redirect to HTTPS in production; in dev the frontend calls HTTP directly
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<FInd_Op_Web.Hubs.NotificationHub>("/notificationHub");
app.MapHub<FInd_Op_Web.Hubs.ChatHub>("/chatHub");
app.MapFallbackToFile("index.html");


try
{
    app.Run();
}
catch (IOException ex) when (ex.InnerException?.Message.Contains("address already in use") == true)
{
    Console.WriteLine("❌ Port is already in use. Possible solutions:");
    Console.WriteLine("1. Wait 60 seconds and try again (TIME_WAIT state)");
    Console.WriteLine("2. Run: netstat -ano | findstr :5229");
    Console.WriteLine("3. Kill the process: taskkill /PID <pid> /F");
    Console.WriteLine("4. Change port in Properties/launchSettings.json");
    throw;
}
