using ChatApp.Model;
using Microsoft.EntityFrameworkCore;

namespace ChatApp.Data;


public class ApplicationContext(DbContextOptions<ApplicationContext> options) : DbContext(options)
{
    
    public DbSet<User> Users { get; set; }
    public DbSet<Message> Messages { get; set; }
    public DbSet<Chat> Chats { get; set; }
}