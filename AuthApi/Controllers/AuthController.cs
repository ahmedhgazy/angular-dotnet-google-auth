using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Security.Claims;
using System.Threading.Tasks;
using AuthApi.Models;
using AuthApi.Services;
using System;
using System.Collections.Generic;

namespace AuthApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly TokenService _tokenService;
        private readonly UserStore _userStore;
        
        public AuthController(IConfiguration configuration, TokenService tokenService, UserStore userStore)
        {
            _configuration = configuration;
            _tokenService = tokenService;
            _userStore = userStore;
        }
        
     
        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok(new { message = "API is running properly!", timestamp = DateTime.UtcNow });
        }

     
        [HttpGet("login")]
        public IActionResult Login(string redirectUrl = "/")
        {
            try
            {
                var clientId = _configuration["Authentication:Google:ClientId"];
                var callbackUrl = "http://localhost:5002/api/auth/callback";
                var state = Guid.NewGuid().ToString();
                
                Response.Cookies.Append("GoogleAuthState", state);
                Response.Cookies.Append("ReturnUrl", redirectUrl);
                
                var googleAuthInfo = new Dictionary<string, string>
                {
                    { "message", "Use this URL to simulate Google auth" },
                    { "google_auth_url", $"http://localhost:5002/api/auth/callback?code=test_code&state={state}" },
                    { "actual_google_url", $"https://accounts.google.com/o/oauth2/v2/auth?client_id={clientId}&response_type=code&scope=openid%20email%20profile&redirect_uri={Uri.EscapeDataString(callbackUrl)}&state={state}" }
                };
                
                return Ok(googleAuthInfo);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in Login: {ex.Message}");
                return BadRequest($"Error: {ex.Message}");
            }
        }

        [HttpGet("callback")]
        public async Task<IActionResult> GoogleCallback(string code, string state, string? error = null)
        {
            try
            {
                if (!string.IsNullOrEmpty(error))
                {
                    Console.WriteLine($"Error from Google: {error}");
                    return Redirect($"{_configuration["ClientSettings:Url"]}?error={error}");
                }
                
                if (string.IsNullOrEmpty(code))
                {
                    Console.WriteLine("No authorization code received from Google");
                    return BadRequest("No authorization code received");
                }
                
               
                var user = new User
                {
                    Id = Guid.NewGuid().ToString(),
                    Email = $"user_{code.Substring(0, 5)}@example.com", 
                    Name = $"Test User {code.Substring(0, 5)}",
                    PictureUrl = "https://ui-avatars.com/api/?name=Test+User&background=random"
                };

                _userStore.StoreUser(user);
                
                Console.WriteLine($"Authenticated user: {user.Email}");
                string jwtToken = _tokenService.GenerateJwtToken(user);
                
                var returnUrl = Request.Cookies["ReturnUrl"] ?? "/";
                var clientUrl = _configuration["ClientSettings:Url"] ?? "http://localhost:4200";
                var tokenParam = $"token={jwtToken}";
                Response.Cookies.Delete("GoogleAuthState");
                Response.Cookies.Delete("ReturnUrl");
                
                var redirectUrl = $"{clientUrl}{returnUrl}?{tokenParam}";
                Console.WriteLine($"Redirecting to: {redirectUrl}");
                return Redirect(redirectUrl);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in callback: {ex.Message}");
                return BadRequest($"Error: {ex.Message}");
            }
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync();
            return Ok(new { message = "Logged out successfully" });
        }

        [HttpGet("user")]
        [Authorize]
        public IActionResult GetUser()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }
            
            var user = _userStore.GetUserById(userId);
            
            if (user == null)
            {
                user = new User
                {
                    Id = userId,
                    Email = User.FindFirst(ClaimTypes.Email)?.Value ?? "",
                    Name = User.FindFirst(ClaimTypes.Name)?.Value ?? "",
                    PictureUrl = User.FindFirst("picture")?.Value ?? ""
                };
                
                _userStore.StoreUser(user);
            }

            return Ok(user);
        }
    }
}
