using ChatApp.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ChatApp.Controllers;

[ApiController]
public class UserController:ControllerBase
{
    private readonly ApplicationContext _context;

    public UserController(ApplicationContext context)
    {
        _context = context;
    }

    [Authorize]
    [HttpGet("/users")]
    public async Task<ActionResult> GetUsers()
    {
        var currentUserId = User.Claims.ToList()[0];
        var users = await _context.Users.Where(user => user.Id != Convert.ToInt64(currentUserId.Value))
            .Select(x =>
            new {
                 x.Id,
                 x.Name
            })
            .AsNoTracking().ToListAsync();
        return Ok(users);
    }
}