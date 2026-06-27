using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Novac.Api.Data;
using Novac.Api.Models;
using Novac.Api.Services;
using System.Security.Claims;

namespace Novac.Api.Controllers;

[ApiController]
[Route("api/user")]
public class UserController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly EmailService _emailService;

    public UserController(
        AppDbContext context,
        UserManager<ApplicationUser> userManager,
        EmailService emailService)
    {
        _context = context;
        _userManager = userManager;
        _emailService = emailService;
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var email = User.FindFirst(ClaimTypes.Name)?.Value;

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email);

        if (user == null) return NotFound();

        return Ok(new
        {
            email = user.Email,
            fullName = user.FullName,
            role = user.RoleName,
            domain = user.Domain,
            approvalStatus = user.ApprovalStatus,
            isApproved = user.IsApproved
        });
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("pending")]
    public async Task<IActionResult> GetPendingUsers()
    {
        var users = await _context.Users
            .Where(u => u.ApprovalStatus == "Pending")
            .Select(u => new { u.Email, u.FullName, u.Domain })
            .ToListAsync();

        return Ok(users);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("approve")]
    public async Task<IActionResult> ApproveUser(string email)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null) return NotFound();

        user.IsApproved = true;
        user.ApprovalStatus = "Approved";

        await _userManager.UpdateAsync(user);

        await _emailService.SendEmailAsync(
            user.Email,
            "Account Approved",
            _emailService.GetTemplate(
                "Account Approved",
                "Your account has been approved. You can now log in."
            )
        );

        return Ok();
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("reject")]
    public async Task<IActionResult> RejectUser(string email)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null) return NotFound();

        user.IsApproved = false;
        user.ApprovalStatus = "Rejected";

        await _userManager.UpdateAsync(user);

        await _emailService.SendEmailAsync(
            user.Email,
            "Account Rejected",
            _emailService.GetTemplate(
                "Account Rejected",
                "Your account request has been rejected."
            )
        );

        return Ok();
    }

    [Authorize]
    [HttpPost("request-role")]
    public async Task<IActionResult> RequestRole(string role)
    {
        var email = User.FindFirst(ClaimTypes.Name)?.Value;

        var existing = await _context.RoleRequests
            .FirstOrDefaultAsync(r => r.UserEmail == email && r.Status == "Pending");

        if (existing != null)
            return BadRequest("Already requested");

        var request = new RoleRequest
        {
            UserEmail = email,
            RequestedRole = role
        };

        _context.RoleRequests.Add(request);
        await _context.SaveChangesAsync();

        return Ok();
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("role-requests")]
    public async Task<IActionResult> GetRoleRequests()
    {
        var requests = await _context.RoleRequests
            .Where(r => r.Status == "Pending")
            .ToListAsync();

        return Ok(requests);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("approve-role")]
    public async Task<IActionResult> ApproveRole(int id)
    {
        var request = await _context.RoleRequests.FindAsync(id);
        if (request == null) return NotFound();

        var user = await _userManager.FindByEmailAsync(request.UserEmail);
        if (user == null) return NotFound();

        user.RoleName = request.RequestedRole;
        request.Status = "Approved";

        await _userManager.UpdateAsync(user);
        await _context.SaveChangesAsync();

        await _emailService.SendEmailAsync(
            user.Email,
            "Role Approved",
            _emailService.GetTemplate(
                "Role Updated",
                $"Your role is now {user.RoleName}"
            )
        );

        return Ok();
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("reject-role")]
    public async Task<IActionResult> RejectRole(int id)
    {
        var request = await _context.RoleRequests.FindAsync(id);
        if (request == null) return NotFound();

        request.Status = "Rejected";
        await _context.SaveChangesAsync();

        await _emailService.SendEmailAsync(
            request.UserEmail,
            "Role Request Rejected",
            _emailService.GetTemplate(
                "Rejected",
                "Your role request was rejected."
            )
        );

        return Ok();
    }

    [Authorize]
    [HttpGet("my-requests")]
    public async Task<IActionResult> GetMyRequests()
    {
        var email = User.FindFirst(ClaimTypes.Name)?.Value;

        var requests = await _context.RoleRequests
            .Where(r => r.UserEmail == email)
            .ToListAsync();

        return Ok(requests);
    }

    [Authorize(Roles = "Admin,Manager")]
    [HttpGet("all")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _context.Users
            .Where(u => u.IsApproved)
            .Select(u => new
            {
                fullName = u.FullName,
                email = u.Email,
                role = u.RoleName,
                domain = u.Domain
            })
            .ToListAsync();

        return Ok(users);
    }
}
