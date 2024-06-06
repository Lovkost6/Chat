using System.ComponentModel.DataAnnotations.Schema;

namespace ChatApp.Model;

[Table("Chat")]
public class Chat
{
    public long Id { get; set; }
    public long FirstUserId { get; set; }
    public User FirstUser { get; set; }
    public long SecondUserId { get; set; }
    public User SecondUser { get; set; }
    public List<Message> Messages { get; set; }
}

public class CreateChat
{
    public long FriendId { get; set; }
}