using ChatApp.Data;
using ChatApp.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ChatApp.Controllers;

public class MessageController : ControllerBase
{
    private readonly ApplicationContext _context;

    public MessageController(ApplicationContext context)
    {
        _context = context;
    }

    [Authorize]
    [HttpGet("/messages/{chatId}")]
    public async Task<ActionResult> GetMessages(long chatId)
    {
        var currentUserId =  Convert.ToInt64(User.Claims.ToList()[0].Value);
        var messages = await _context.Messages.Where(x => x.ChatId == chatId).OrderByDescending(x=>x.CreateAt).Take(50).ToListAsync();
        messages.Where(x => x.OwnerId != currentUserId && x.isReaded == false).ToList()
            .ForEach(x => x.isReaded = true);
        await _context.SaveChangesAsync();
        return Ok(messages);
    }
}