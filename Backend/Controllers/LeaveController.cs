using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Novac.Api.Data;
using Novac.Api.Models;
using System.Security.Claims;

namespace Novac.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LeaveController : ControllerBase
{
    private readonly AppDbContext _context;

    public LeaveController(AppDbContext context)
    {
        _context = context;
    }

    // ✅ CREATE LEAVE (FINAL WORKING)
    [Authorize]
    [HttpPost("request")]
    public IActionResult CreateLeave([FromBody] LeaveRequest request)
    {
        var email = User.FindFirst(ClaimTypes.Name)?.Value?.ToLower();
        var role = User.FindFirst(ClaimTypes.Role)?.Value?.ToLower();

        if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(role))
            return BadRequest("Invalid user");

        request.UserEmail = email;
        request.Role = role;

        // ❌ Admin cannot request leave
        if (role == "admin")
            return BadRequest("Admin cannot request leave");

        // ✅ Manager → goes to Admin
        if (role == "manager")
        {
            request.Status = "PendingAdmin";
            request.ManagerEmail = email;
        }
        else
        {
            // ✅ User → goes to Manager
            var teamMember = _context.TeamMembers
                .Include(t => t.Team)
                .FirstOrDefault(t => t.Email.ToLower() == email);

            if (teamMember == null)
                return BadRequest("User not assigned to any team");

            if (teamMember.Team == null || string.IsNullOrEmpty(teamMember.Team.ManagerEmail))
                return BadRequest("Manager not assigned");

            request.ManagerEmail = teamMember.Team.ManagerEmail.ToLower();
            request.Status = "PendingManager";
        }

        _context.LeaveRequests.Add(request);
        _context.SaveChanges();

        return Ok(request);
    }

    // ✅ MANAGER VIEW
    [Authorize(Roles = "Manager")]
    [HttpGet("manager")]
    public IActionResult GetManagerLeaves()
    {
        var email = User.FindFirst(ClaimTypes.Name)?.Value?.ToLower();

        var leaves = _context.LeaveRequests
            .Where(leave =>
                leave.ManagerEmail.ToLower() == email &&
                leave.Status == "PendingManager")
            .ToList();

        return Ok(leaves);
    }

    // ✅ MANAGER ACTION
    [Authorize(Roles = "Manager")]
    [HttpPost("manager-action")]
    public IActionResult ManagerAction(int id, string action)
    {
        var leave = _context.LeaveRequests.Find(id);

        if (leave == null)
            return NotFound();

        leave.Status = action == "approve" ? "Approved" : "Rejected";

        _context.SaveChanges();
        return Ok();
    }

    // ✅ ADMIN VIEW
    [Authorize(Roles = "Admin")]
    [HttpGet("admin")]
    public IActionResult GetAdminLeaves()
    {
        var leaves = _context.LeaveRequests
            .Where(leave => leave.Status == "PendingAdmin")
            .ToList();

        return Ok(leaves);
    }

    // ✅ ADMIN ACTION
    [Authorize(Roles = "Admin")]
    [HttpPost("admin-action")]
    public IActionResult AdminAction(int id, string action)
    {
        var leave = _context.LeaveRequests.Find(id);

        if (leave == null)
            return NotFound();

        leave.Status = action == "approve" ? "Approved" : "Rejected";

        _context.SaveChanges();
        return Ok();
    }

    // ✅ MY LEAVES
    [Authorize]
    [HttpGet("my")]
    public IActionResult GetMyLeaves()
    {
        var email = User.FindFirst(ClaimTypes.Name)?.Value?.ToLower();

        var leaves = _context.LeaveRequests
            .Where(leave => leave.UserEmail.ToLower() == email)
            .ToList();

        return Ok(leaves);
    }
}
