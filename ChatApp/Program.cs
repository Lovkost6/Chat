using ChatApp.Controllers;
using ChatApp.Data;
using ChatApp.Utils;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSignalR();
builder.Services.AddSingleton<IUserIdProvider, CustomUserIdProvider>();

builder.Services.AddDbContext<ApplicationContext>(options => options.UseSqlServer(builder.Configuration.GetConnectionString("WebApiDatabaseHost")));


builder.Services.AddAuthorization();
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.HttpOnly = true;
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
        options.ExpireTimeSpan = TimeSpan.FromHours(20);
        options.SlidingExpiration = true;
        options.Cookie.SameSite = SameSiteMode.None;
        options.LoginPath = "/Notauthorize";
        options.AccessDeniedPath = "/Forbidden";
        options.Cookie.Name = "userdata";
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin", 
        builderCors =>
        {
            builderCors
                //.SetIsOriginAllowed(p => true)
                .WithOrigins(builder.Configuration["WithOriginsHost"])
                .AllowCredentials()
                .AllowAnyHeader()
                .AllowAnyMethod();

        });
});

var app = builder.Build();

app.UseCors("AllowSpecificOrigin");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseStaticFiles();
app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapHub<MessageHub>("/chatHub");
app.MapHub<CallHub>("/callHub");
app.MapControllers();

app.Run();