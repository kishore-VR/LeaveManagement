using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Novac.Api.Data;
using Novac.Api.Models;

namespace Novac.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("role")]
    public IActionResult CreateRole(RoleConfig role)
    {
        if (string.IsNullOrWhiteSpace(role.RoleName))
            return BadRequest("Role cannot be empty");

        var exists = _context.RoleConfigs.Any(r => r.RoleName == role.RoleName);
        if (exists)
            return BadRequest("Role already exists");

        _context.RoleConfigs.Add(role);
        _context.SaveChanges();

        return Ok(role);
    }

    [HttpGet("roles")]
    public IActionResult GetRoles()
    {
        return Ok(_context.RoleConfigs.ToList());
    }

    [HttpPost("permission")]
    public IActionResult AddPermission(RolePermission permission)
    {
        if (string.IsNullOrWhiteSpace(permission.PermissionName))
            return BadRequest("Permission cannot be empty");

        var roleExists = _context.RoleConfigs.Any(r => r.RoleName == permission.RoleName);
        if (!roleExists)
            return BadRequest("Role does not exist");

        var exists = _context.RolePermissions.Any(p =>
            p.RoleName == permission.RoleName &&
            p.PermissionName == permission.PermissionName);

        if (exists)
            return BadRequest("Permission already assigned");

        _context.RolePermissions.Add(permission);
        _context.SaveChanges();

        return Ok(permission);
    }

    [HttpGet("permissions/all")]
    public IActionResult GetAllPermissions()
    {
        return Ok(_context.RolePermissions.ToList());
    }
}