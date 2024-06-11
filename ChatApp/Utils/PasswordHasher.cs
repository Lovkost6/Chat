using System.Drawing.Imaging;
using System.Security.Cryptography;
using System.Text;

namespace ChatApp.Utils;

public static class PasswordHasher
{
    public static string GenSalt()
    {
        return Guid.NewGuid().ToString();
    }
    public static string HashPw(string password, string salt)
    {
        var inputBytes = Encoding.UTF8.GetBytes(password+salt);
        var inputHash = SHA256.HashData(inputBytes);
        return Convert.ToHexString(inputHash);
    }

    public static bool CheckPw(string enteredPassword, string salt, string hashedPassword)
    {
        var enteredHashedPw = HashPw(enteredPassword, salt);
        return enteredHashedPw == hashedPassword;
    }
}