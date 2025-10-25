using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _config;

    public AuthController(IConfiguration config)
    {
        _config = config;
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        // TODO: aqui você valida contra o banco. Para teste:
        if (request.Username != "admin" || request.Password != "123")
            return Unauthorized();

        var token = GenerateJwtToken(request.Username);
        return Ok(new { token });
    }

private string GenerateJwtToken(string username)
{
    var secret = _config["Jwt:Secret"] ?? "MinhaChaveUltraSecretaUltraLonga1234!"; // >=32 chars
    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)); // usar 'secret', não 'jwtSecret'
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    var claims = new[]
    {
        new Claim(JwtRegisteredClaimNames.Sub, username),
        new Claim("role", "Admin")
    };

    var token = new JwtSecurityToken(
        issuer: _config["Jwt:Issuer"] ?? "crmapp",
        audience: _config["Jwt:Audience"] ?? "crmapp",
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


