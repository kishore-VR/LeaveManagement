namespace Novac.Api.Models;

public class RoleRequest
{
    public int Id { get; set; }

    public string UserEmail { get; set; } = "";

    public string RequestedRole { get; set; } = "";

    public string Status { get; set; } = "Pending";

    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
}
