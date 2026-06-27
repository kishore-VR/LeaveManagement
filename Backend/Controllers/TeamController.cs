using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Novac.Api.Data;
using Novac.Api.Models;
using System.Security.Claims;

namespace Novac.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TeamController : ControllerBase
{
    private readonly AppDbContext _context;

    public TeamController(AppDbContext context)
    {
        _context = context;
    }

    [Authorize(Roles = "Admin,Manager")]
    [HttpPost]
    public IActionResult CreateTeam(Team team)
    {
        var email = User.FindFirst(ClaimTypes.Name)?.Value;

        if (string.IsNullOrEmpty(team.ManagerEmail))
        {
            team.ManagerEmail = email;
        }

        team.CreatedBy = email;

        var members = team.Members;

        team.Members = new List<TeamMember>();

        _context.Teams.Add(team);
        _context.SaveChanges();

        if (members != null && members.Count > 0)
        {
            foreach (var member in members)
            {
                if (string.IsNullOrEmpty(member.Email))
                    continue;

                member.TeamId = team.Id;

                var exists = _context.TeamMembers
                    .Any(m => m.TeamId == team.Id && m.Email == member.Email);

                if (!exists)
                {
                    _context.TeamMembers.Add(member);
                }
            }

            _context.SaveChanges();
        }

        return Ok(team);
    }

    [Authorize]
    [HttpGet]
    public IActionResult GetTeams()
    {
        var role = User.FindFirst(ClaimTypes.Role)?.Value?.ToLower();
        var email = User.FindFirst(ClaimTypes.Name)?.Value?.ToLower();

        var query = _context.Teams
            .Include(t => t.Members)
            .Include(t => t.Channels)
                .ThenInclude(c => c.Members)
                .ThenInclude(cm => cm.TeamMember)
            .AsQueryable();


        if (role == "admin")
        {
            return Ok(query.ToList());
        }

        if (role == "manager")
        {
            return Ok(query
                .Where(t => t.ManagerEmail.ToLower() == email)
                .ToList());
        }

        return Ok(query
            .Where(t => t.Members.Any(m => m.Email.ToLower() == email))
            .ToList());
    }
    [Authorize(Roles = "Admin,Manager")]
    [HttpPut("{id}")]
    public IActionResult UpdateTeam(int id, Team updated)
    {
        var team = _context.Teams.FirstOrDefault(t => t.Id == id);
        if (team == null) return NotFound();

        var email = User.FindFirst(ClaimTypes.Name)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;

        if (role != "Admin" && team.ManagerEmail != email)
            return Forbid();

        team.TeamName = updated.TeamName;

        _context.SaveChanges();
        return Ok(team);
    }

    [Authorize(Roles = "Admin,Manager")]
    [HttpDelete("{id}")]
    public IActionResult DeleteTeam(int id)
    {
        var team = _context.Teams.FirstOrDefault(t => t.Id == id);
        if (team == null) return NotFound();

        var email = User.FindFirst(ClaimTypes.Name)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;

        if (role != "Admin" && team.ManagerEmail != email)
            return Forbid();

        _context.Teams.Remove(team);
        _context.SaveChanges();

        return Ok();
    }

    [Authorize(Roles = "Admin,Manager")]
    [HttpPost("{teamId}/members")]
    public IActionResult AddMember(int teamId, TeamMember member)
    {
        var team = _context.Teams.FirstOrDefault(t => t.Id == teamId);
        if (team == null) return NotFound();

        var email = User.FindFirst(ClaimTypes.Name)?.Value.ToLower();
        var role = User.FindFirst(ClaimTypes.Role)?.Value;

        if (role != "Admin" && team.ManagerEmail.ToLower() != email)
            return Forbid();

        // ✅ VALIDATE EMAIL
        if (string.IsNullOrEmpty(member.Email))
            return BadRequest("Member email is required");

        var memberEmail = member.Email.ToLower();

        // ✅ PREVENT DUPLICATE (case-insensitive)
        var exists = _context.TeamMembers
            .Any(m => m.TeamId == teamId && m.Email.ToLower() == memberEmail);

        if (exists)
            return BadRequest("Member already exists");

        member.TeamId = teamId;
        member.Email = memberEmail; // ✅ normalize
        member.Name = member.Name ?? "";

        _context.TeamMembers.Add(member);
        _context.SaveChanges();

        return Ok(member);
    }

    [Authorize(Roles = "Admin,Manager")]
    [HttpPut("members/{id}")]
    public IActionResult UpdateMember(int id, TeamMember updated)
    {
        var member = _context.TeamMembers
            .Include(m => m.Team)
            .FirstOrDefault(m => m.Id == id);

        if (member == null) return NotFound();

        var email = User.FindFirst(ClaimTypes.Name)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;

        if (role != "Admin" && member.Team.ManagerEmail != email)
            return Forbid();

        member.Name = updated.Name;
        member.Expertise = updated.Expertise;

        _context.SaveChanges();
        return Ok(member);
    }

    [Authorize(Roles = "Admin,Manager")]
    [HttpDelete("members/{id}")]
    public IActionResult DeleteMember(int id)
    {
        var member = _context.TeamMembers
            .Include(m => m.Team)
            .FirstOrDefault(m => m.Id == id);

        if (member == null) return NotFound();

        var email = User.FindFirst(ClaimTypes.Name)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;

        if (role != "Admin" && member.Team.ManagerEmail != email)
            return Forbid();

        _context.TeamMembers.Remove(member);
        _context.SaveChanges();

        return Ok();
    }

    [Authorize(Roles = "Admin,Manager")]
    [HttpPost("{teamId}/channels")]
    public IActionResult CreateChannel(int teamId, Channel channel)
    {
        var team = _context.Teams.FirstOrDefault(t => t.Id == teamId);
        if (team == null) return NotFound();

        var email = User.FindFirst(ClaimTypes.Name)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;

        if (role != "Admin" && team.ManagerEmail != email)
            return Forbid();

        channel.TeamId = teamId;

        _context.Channels.Add(channel);
        _context.SaveChanges();

        return Ok(channel);
    }

    [Authorize(Roles = "Admin,Manager")]
    [HttpPost("channels/{channelId}/members")]
    public IActionResult AddToChannel(int channelId, int memberId)
    {
        var channel = _context.Channels.Include(c => c.Team).FirstOrDefault(c => c.Id == channelId);
        if (channel == null) return NotFound();

        var email = User.FindFirst(ClaimTypes.Name)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;

        if (role != "Admin" && channel.Team.ManagerEmail != email)
            return Forbid();

        var exists = _context.ChannelMembers
            .Any(c => c.ChannelId == channelId && c.TeamMemberId == memberId);

        if (exists) return BadRequest();

        _context.ChannelMembers.Add(new ChannelMember
        {
            ChannelId = channelId,
            TeamMemberId = memberId
        });

        _context.SaveChanges();
        return Ok();
    }

    [Authorize(Roles = "Admin,Manager")]
    [HttpDelete("channels/{channelId}/members/{memberId}")]
    public IActionResult RemoveFromChannel(int channelId, int memberId)
    {
        var channel = _context.Channels.Include(c => c.Team).FirstOrDefault(c => c.Id == channelId);
        if (channel == null) return NotFound();

        var email = User.FindFirst(ClaimTypes.Name)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;

        if (role != "Admin" && channel.Team.ManagerEmail != email)
            return Forbid();

        var cm = _context.ChannelMembers
            .FirstOrDefault(x => x.ChannelId == channelId && x.TeamMemberId == memberId);

        if (cm == null) return NotFound();

        _context.ChannelMembers.Remove(cm);
        _context.SaveChanges();

        return Ok();
    }
}
