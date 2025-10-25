using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CrmApp.Application.Interfaces;
using CrmApp.Application.DTOs;
using CrmApp.Application.Services; // para UserServiceHelpers (se público)
using CrmApp.Domain.Entities;
using CrmApp.Infrastructure.Services;

namespace CrmApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IConfiguration _config;

    public AuthController(IUserService userService, IConfiguration config)
    {
        _userService = userService;
        _config = config;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _userService.GetByUsernameAsync(request.Username);
        if (user == null) return Unauthorized();

        // Verifica a senha
        if (!UserServiceHelpers.VerifyPassword(request.Password, user.PasswordHash))
            return Unauthorized("Invalid credentials");

        var token = GenerateJwtToken(user.Username);
        return Ok(new { token });
    }

    /*
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] UserRegisterDto dto)
    {
        // Opcional: proteger por header X-Admin-Key ou permitir só em dev
        var created = await _userService.RegisterAsync(dto);
        return Ok(new { created.Id, created.Username, created.Email });
    }
    */

    private string GenerateJwtToken(string username)
    {
        var secret = _config["Jwt:Secret"] ?? "MinhaChaveUltraSecretaUltraLonga1234!";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, username),
            new Claim("role", "User")
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"] ?? null,
            audience: _config["Jwt:Audience"] ?? null,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(2),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
