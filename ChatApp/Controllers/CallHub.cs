using System.Diagnostics;
using ChatApp.Data;
using Microsoft.AspNetCore.SignalR;

namespace ChatApp.Controllers;

public class CallHub:Hub
{
    
    public async Task SendSignal(string user, string signal)
    {
        await Clients.User(user).SendAsync("ReceiveSignal", signal);
    }

    // SignalR метод для уведомления о начале звонка
    public async Task CallUser(string targetUserId, string callerId)
    {
        await Clients.User(targetUserId).SendAsync("ReceiveCall", callerId);
    }
    
}