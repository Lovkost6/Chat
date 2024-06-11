using ChatApp.Data;
using ChatApp.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QRCoder;

namespace ChatApp.Controllers;

[Authorize]
[ApiController]
public class ChatController : ControllerBase
{
    private readonly ApplicationContext _context;

    public ChatController(ApplicationContext context)
    {
        _context = context;
    }

    [HttpGet("/chats")]
    public async Task<ActionResult> GetChats()
    {
        var currentUserId = Convert.ToInt64(User.Claims.ToList()[0].Value);
        var chatsFirst = await _context.Chats.Where(x => x.FirstUserId == currentUserId)
            .Include(x=> x.SecondUser)
            .Include(x => x.Messages)
            .Select(x=> new {x.Id, UserId = x.SecondUserId ,UserName = x.SecondUser.Name,NotReadCount = x.Messages.Count(x => x.isReaded == false && x.OwnerId != currentUserId)})
            .ToListAsync();
        
        var chatsSecond = await _context.Chats.Where(x => x.SecondUserId == currentUserId)
            .Include(x=> x.FirstUser)
            .Include(x => x.Messages)
            .Select(x=> new {x.Id, UserId = x.FirstUserId ,UserName = x.FirstUser.Name, NotReadCount = x.Messages.Count(x => x.isReaded == false && x.OwnerId != currentUserId)})
            .ToListAsync();
        
        chatsFirst.AddRange(chatsSecond);
        return Ok(chatsFirst);
    }

    [HttpPost("/create-chat")]
    public async Task<ActionResult> CreateChat([FromBody] CreateChat chat)
    {
        var currentUser = Convert.ToInt64(User.Claims.ToList()[0].Value);
        var newChat = new Chat() {FirstUserId = currentUser,SecondUserId = chat.FriendId};
        if (await CheckDublicateChat(newChat))
        {
            return BadRequest("Чат уже существует");
        }
        _context.Chats.Add(newChat);
        await _context.SaveChangesAsync();
        return Ok(newChat);
    }
    

    [HttpGet("/generateQR")]
    public async Task<ActionResult> GenerateQr(IConfiguration configuration)
    {
        
        var currentUserId = Convert.ToInt64(User.Claims.ToList()[0].Value);
        
        
        QRCodeGenerator qrCodeGenerator = new QRCodeGenerator();
        QRCodeData qrCodeData = qrCodeGenerator.CreateQrCode($"{configuration["WithOriginsHost"]}/{currentUserId}",QRCodeGenerator.ECCLevel.Q);
        Base64QRCode qrCode = new Base64QRCode(qrCodeData);
        var file = "data:image/png;base64, " + qrCode.GetGraphic(20);
        return Ok(file);
    }
    
    private async Task<bool> CheckDublicateChat(Chat newChat)
    {
        var chatsFirst = await _context.Chats
            .Where(x => (x.FirstUserId == newChat.FirstUserId && x.SecondUserId == newChat.SecondUserId) ||
                        (x.SecondUserId == newChat.SecondUserId && x.FirstUserId == newChat.FirstUserId)).ToListAsync();
        if (chatsFirst.Count != 0)
        {
            return true;
        }

        return false;
    }
}