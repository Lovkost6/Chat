using System.Security.Claims;
using ChatApp.Data;
using ChatApp.Model;
using ChatApp.Utils;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace ChatApp.Controllers;

[ApiController]
public class AuthController:ControllerBase
{
    private readonly ApplicationContext _context;

    public AuthController(ApplicationContext context)
    {
        _context = context;
    }

    [AllowAnonymous]
    [HttpPost("/sign-in")]
    public async Task<ActionResult<User>> SignIn([FromBody] SignInUser signInUser)
    {
        var currentUser = await _context.Users
            .Where(user => user.UserName == signInUser.UserName)
            .AsNoTracking()
            .FirstOrDefaultAsync();
        
        if (currentUser == null)
        {
            return NotFound();
        }

        var isPwCorrect = PasswordHasher.CheckPw(signInUser.Password,currentUser.SaltPw,currentUser.Password);
        if (isPwCorrect == false)
        {
            return BadRequest("Неправильный пароль");
        }
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Sid, currentUser.Id.ToString()),
            new Claim(ClaimTypes.Name, currentUser.UserName)
        };
        var claimsIdentity = new ClaimsIdentity(
            claims, CookieAuthenticationDefaults.AuthenticationScheme);

        var authProperties = new AuthenticationProperties
        {
            AllowRefresh = true,
            IsPersistent = true,
            IssuedUtc = DateTimeOffset.Now,
        };
        
        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme, 
            new ClaimsPrincipal(claimsIdentity), 
            authProperties);
        
        
        return Ok(currentUser);
    }
    [AllowAnonymous]
    [HttpPost("/sign-up")]
    public async Task<ActionResult> SignUp([FromBody] User signUpUser)
    {
        try
        {
            var salt = PasswordHasher.GenSalt();
            signUpUser.SaltPw = salt;
            signUpUser.Password = PasswordHasher.HashPw(signUpUser.Password,salt);
            _context.Users.Add(signUpUser);
            await _context.SaveChangesAsync();
        }
        catch (Exception e)
        {
            return BadRequest(e.ToString());
        }

        return Ok(signUpUser);
    }
    [Authorize]
    [HttpGet("/sign-out")]
    public async Task<ActionResult> SignOut()
    {
        await HttpContext.SignOutAsync(
            CookieAuthenticationDefaults.AuthenticationScheme);
        return Ok();
    }
    
    [HttpGet("/Notauthorize")]
    public async Task<ActionResult> ErrorNotAuth()
    {
        return Unauthorized();
    }
    
    [HttpGet("/Forbidden")]
    public async Task<ActionResult> ErrorForbidden ()
    {
        return StatusCode(403);
    }
}