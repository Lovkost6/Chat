using System.Text.Json;
using ChatApp.Data;
using ChatApp.Model;
using Microsoft.AspNetCore.SignalR;

namespace ChatApp.Controllers;

public class MessageHub : Hub
{
    private readonly ApplicationContext _context;

    public MessageHub(ApplicationContext context)
    {
        _context = context;
    }


    public async Task SendMessage(string chatId, string userId, string message)
    {
        var httpContext = Context.GetHttpContext();
        var currentUser = Convert.ToInt64(httpContext.User.Claims.ToList()[0].Value);
        var newMessage = new Message()
            { ChatId = Convert.ToInt64(chatId), OwnerId = currentUser, Text = message, CreateAt = DateTime.Now };
        _context.Messages.Add(newMessage);
        await _context.SaveChangesAsync();
        Clients.Users([currentUser.ToString(),userId]).SendAsync("RecieveMessage", newMessage);
    }
}