using System.Text.Json;
using ChatApp.Data;
using ChatApp.Model;
using Microsoft.AspNetCore.SignalR;

namespace ChatApp.Controllers;

public class CommunicateHub : Hub
{
    private readonly ApplicationContext _context;

    public CommunicateHub(ApplicationContext context)
    {
        _context = context;
    }
    
    public async Task SendSignal(string user, string signal)
    {
        await Clients.User(user).SendAsync("ReceiveSignal", signal);
    }
    public async Task CallUser(string targetConnectionId)
    {
        await Clients.Client(targetConnectionId).SendAsync("ReceiveCall", Context.ConnectionId);
    }

    public async Task AcceptCall(string callerConnectionId)
    {
        await Clients.Client(callerConnectionId).SendAsync("CallAccepted", Context.ConnectionId);
    }

    public override async Task OnDisconnectedAsync(Exception exception)
    {
        await Clients.Others.SendAsync("UserDisconnected", Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }
    public async Task SendMessage(string chatId, string userId, string message)
    {
        var httpContext = Context.GetHttpContext();
        var currentUser = Convert.ToInt64(httpContext.User.Claims.ToList()[0].Value);
        var newMessage = new Message()
            { ChatId = Convert.ToInt64(chatId), OwnerId = currentUser, Text = message, CreateAt = DateTime.Now };
        _context.Messages.Add(newMessage);
        await _context.SaveChangesAsync();
        await Clients.Users([currentUser.ToString(),userId]).SendAsync("RecieveMessage", newMessage);
    }
}