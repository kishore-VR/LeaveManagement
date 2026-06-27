using Microsoft.AspNetCore.Identity;

namespace Novac.Api.Models;

public class ApplicationUser : IdentityUser
{
    public string FullName { get; set; } = "";

    public string RoleName { get; set; } = "";

    public string Domain { get; set; } = "";

    public bool IsApproved { get; set; } = false;

    public string ApprovalStatus { get; set; } = "Pending";
}
