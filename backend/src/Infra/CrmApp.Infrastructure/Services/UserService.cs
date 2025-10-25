using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CrmApp.Application.DTOs;
using CrmApp.Application.Interfaces;
using CrmApp.Domain.Entities;
using CrmApp.Infrastructure.Persistence;

namespace CrmApp.Infrastructure.Services
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _db;

        public UserService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<User?> GetByUsernameAsync(string username)
        {
            return await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Username == username);
        }

        public async Task<User> RegisterAsync(UserRegisterDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email)) throw new ArgumentException("Email required");
            if (string.IsNullOrWhiteSpace(dto.Username)) throw new ArgumentException("Username required");
            if (string.IsNullOrWhiteSpace(dto.Password)) throw new ArgumentException("Password required");

            if (await _db.Users.AnyAsync(u => u.Username == dto.Username))
                throw new InvalidOperationException("User already exists");

            var user = new User
            {
                Username = dto.Username,
                Email = dto.Email,
                PasswordHash = UserServiceHelpers.HashPassword(dto.Password),
                Role = string.IsNullOrWhiteSpace(dto.Role) ? "User" : dto.Role,
                CreatedAt = DateTime.UtcNow
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();
            return user;
        }
    }
}
