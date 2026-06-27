using log4net;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Novac.Api.Data;
using Novac.Api.Models;
using Novac.Api.Services;
using System.Security.Claims;
using System.Web;

namespace Novac.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly JwtService _jwtService;
    private readonly AppDbContext _context;
    private readonly EmailService _emailService;

    private static readonly ILog _logger =
        LogManager.GetLogger(typeof(AuthController));

    public AuthController(
        UserManager<ApplicationUser> userManager,
        JwtService jwtService,
        AppDbContext context,
        EmailService emailService)
    {
        _userManager = userManager;
        _jwtService = jwtService;
        _context = context;
        _emailService = emailService;
    }

    // ✅ ✅ REGISTER WITH EMAIL
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        try
        {
            if (string.IsNullOrEmpty(dto.Email) || !dto.Email.EndsWith("@psiog.com"))
                return BadRequest("Only psiog.com emails allowed");

            var existing = await _userManager.FindByEmailAsync(dto.Email);
            if (existing != null)
                return BadRequest("User already exists");

            var user = new ApplicationUser
            {
                UserName = dto.Email,
                Email = dto.Email,
                FullName = dto.FullName,
                Domain = dto.Domain,
                RoleName = "User",
                IsApproved = false,
                ApprovalStatus = "Pending"
            };

            var result = await _userManager.CreateAsync(user, dto.Password);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            // ✅ SEND EMAIL
            await _emailService.SendEmailAsync(
                user.Email,
                "Account Created",
                _emailService.GetTemplate(
                    "Welcome to Novac",
                    "Your account has been created and is waiting for admin approval."
                )
            );

            return Ok("✅ Account created. Waiting for approval");
        }
        catch (Exception ex)
        {
            _logger.Error("Register error", ex);
            return StatusCode(500, "Internal server error");
        }
    }

    // ✅ LOGIN
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        try
        {
            if (string.IsNullOrEmpty(dto.Email) || string.IsNullOrEmpty(dto.Password))
                return BadRequest("Invalid request");

            var user = await _userManager.FindByEmailAsync(dto.Email);

            if (user == null || !user.Email.EndsWith("@psiog.com"))
                return Unauthorized();

            var valid = await _userManager.CheckPasswordAsync(user, dto.Password);

            if (!valid)
                return Unauthorized();

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.Email),
                new Claim(ClaimTypes.Role, user.RoleName),
                new Claim("domain", user.Domain)
            };

            var permissions = _context.RolePermissions
                .Where(r => r.RoleName == user.RoleName)
                .Select(p => p.PermissionName)
                .ToList();

            foreach (var p in permissions)
            {
                claims.Add(new Claim("permission", p));
            }

            var token = _jwtService.GenerateToken(claims);

            return Ok(new
            {
                token,
                role = user.RoleName,
                email = user.Email,
                domain = user.Domain,
                approvalStatus = user.ApprovalStatus,
                isApproved = user.IsApproved
            });
        }
        catch (Exception ex)
        {
            _logger.Error("Login error", ex);
            return StatusCode(500, "Internal server error");
        }
    }



    [HttpGet("create-admin")]
    public async Task<IActionResult> CreateAdmin()
    {
        var existing = await _userManager.FindByEmailAsync("admin@psiog.com");

        if (existing != null)
            return Ok("Admin already exists");

        var user = new ApplicationUser
        {
            UserName = "admin@psiog.com",
            Email = "admin@psiog.com",
            FullName = "Admin User",
            Domain = "Admin",
            RoleName = "Admin",
            IsApproved = true,
            ApprovalStatus = "Approved"
        };

        var result = await _userManager.CreateAsync(user, "Admin@123");

        if (!result.Succeeded)
            return BadRequest(result.Errors);

        return Ok("✅ Admin created");
    }


    // ✅ ✅ FORGOT PASSWORD (FULLY FIXED ✅)
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(string email)
    {
        try
        {
            var user = await _userManager.FindByEmailAsync(email);

            if (user == null)
                return Ok("If account exists, email sent");

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var encodedToken = HttpUtility.UrlEncode(token);

            var link = $"http://localhost:3000/reset-password?email={email}&token={encodedToken}";

            // ✅ SEND EMAIL
            await _emailService.SendEmailAsync(
                email,
                "Reset Password",
                _emailService.GetTemplate(
                    "Reset Your Password",
                    $"Click the link below to reset your password:<br/><br/><a href='{link}'>Reset Password</a>"
                )
            );

            return Ok("✅ Reset email sent");
        }
        catch (Exception ex)
        {
            _logger.Error("Forgot password error", ex);
            return StatusCode(500, "Email failed");
        }
    }

    // ✅ RESET PASSWORD
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(string email, string token, string newPassword)
    {
        try
        {
            if (string.IsNullOrEmpty(email) ||
                string.IsNullOrEmpty(token) ||
                string.IsNullOrEmpty(newPassword))
            {
                return BadRequest("Invalid request");
            }

            var user = await _userManager.FindByEmailAsync(email);

            if (user == null)
                return NotFound();

            var result = await _userManager.ResetPasswordAsync(user, token, newPassword);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok("✅ Password reset successful");
        }
        catch (Exception ex)
        {
            _logger.Error("Reset password error", ex);
            return StatusCode(500, "Internal server error");
        }
    }
}