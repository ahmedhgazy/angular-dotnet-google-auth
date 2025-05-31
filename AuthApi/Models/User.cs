using System;

namespace AuthApi.Models
{
    public class User
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string PictureUrl { get; set; } = string.Empty;
        public string Provider { get; set; } = "Google"; 
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
