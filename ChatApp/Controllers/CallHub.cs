namespace ChatApp.Controllers;
using Microsoft.AspNetCore.SignalR;

public class CallHub : Hub
{
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
}