using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Novac.Api.Config;

namespace Novac.Api.Controllers;

[ApiController]
[Route("api/secure")]
public class SecureController : ControllerBase
{
    [Authorize]
    [HttpGet("user")]
    public IActionResult User()
    {
        return Ok("Authenticated user");
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpGet("admin")]
    public IActionResult Admin()
    {
        return Ok("Admin full access");
    }

    [Authorize(Roles = "Admin,Manager,TeamLead")]
    [HttpGet("management")]
    public IActionResult Management()
    {
        return Ok("Management data");
    }
}