using ChatApp.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ChatApp.Controllers;

[ApiController]
public class ChatController : ControllerBase
{
    private readonly ApplicationContext _context;

    public ChatController(ApplicationContext context)
    {
        _context = context;
    }

    [Authorize]
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
}