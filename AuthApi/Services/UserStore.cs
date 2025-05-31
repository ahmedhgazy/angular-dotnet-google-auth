using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using AuthApi.Models;

namespace AuthApi.Services
{
    
    public class UserStore
    {
        private readonly ConcurrentDictionary<string, User> _users = new ConcurrentDictionary<string, User>();

        public User StoreUser(User user)
        {
            var existingUser = GetUserByEmail(user.Email);
            if (existingUser != null)
            {
                existingUser.Name = user.Name;
                existingUser.PictureUrl = user.PictureUrl;
                existingUser.Provider = user.Provider;
                return existingUser;
            }

            _users[user.Id] = user;
            return user;
        }

        public User? GetUserById(string id)
        {
            if (_users.TryGetValue(id, out var user))
            {
                return user;
            }
            return null;
        }

        public User? GetUserByEmail(string email)
        {
            return _users.Values.FirstOrDefault(u => u.Email.Equals(email, StringComparison.OrdinalIgnoreCase));
        }

        public IEnumerable<User> GetAllUsers()
        {
            return _users.Values;
        }
    }
}
