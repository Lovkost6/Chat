using System.ComponentModel.DataAnnotations.Schema;

namespace ChatApp.Model;

[Table("Message")]
public class Message
{
    public long Id { get; set; }
    public long ChatId { get; set; }
    public Chat Chat { get; set; }
    public long OwnerId { get; set; }
    public string Text { get; set; }
    public DateTime CreateAt { get; set; }

    public bool isReaded { get; set; }
}