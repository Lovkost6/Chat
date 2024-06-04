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
        var messages = await _context.Messages.Where(x => x.ChatId == chatId).ToListAsync();
        return Ok(messages);
    }
}