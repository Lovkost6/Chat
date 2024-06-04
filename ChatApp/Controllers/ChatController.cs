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
            .Select(x=> new {x.Id, UserId = x.SecondUserId ,UserName = x.SecondUser.Name})
            .ToListAsync();
        
        var chatsSecond = await _context.Chats.Where(x => x.SecondUserId == currentUserId)
            .Include(x=> x.FirstUser)
            .Select(x=> new {x.Id, UserId = x.FirstUserId ,UserName = x.FirstUser.Name})
            .ToListAsync();
        
        chatsFirst.AddRange(chatsSecond);
        return Ok(chatsFirst);
    }
}