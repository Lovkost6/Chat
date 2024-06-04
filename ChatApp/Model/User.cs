using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Runtime.CompilerServices;

namespace ChatApp.Model;

[Table("User")]
public class User
{
    
    
    public long Id { get; set; }
    
    [MinLength(3)]
    public string Name { get; set; }
    
    [MinLength(3)]
    public string UserName { get; set; }
    
    [MinLength(3)]
    public string Password { get; set; }
}

public class SignInUser
{
    public string UserName { get; set; }
    public string Password { get; set; }
}

