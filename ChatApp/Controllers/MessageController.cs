using ChatApp.Data;
using ChatApp.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ChatApp.Controllers;
[Authorize]
public class MessageController : ControllerBase
{
    private readonly ApplicationContext _context;

    public MessageController(ApplicationContext context)
    {
        _context = context;
    }

    
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
    
    [HttpPost("upload")]
    public async Task<IActionResult> Upload(IFormFile audio)
    {
        if (audio == null || audio.Length == 0)
            return BadRequest("Upload a valid audio file.");

        var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        if (!Directory.Exists(path))
        {
            Directory.CreateDirectory(path);
        }

        var filePath = Path.Combine(path, $"{Guid.NewGuid()}_{audio.FileName}");

        using (var stream = new FileStream( filePath, FileMode.Create))
        {
            await audio.CopyToAsync(stream);
        }

        var fileUrl = $"{Request.Scheme}://{Request.Host}/ChatApp/{Path.GetFileName(filePath)}";
        return Ok(new { success = true, audioUrl = fileUrl });
    }
}