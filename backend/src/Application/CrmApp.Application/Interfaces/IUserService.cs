using System.Threading.Tasks;
using CrmApp.Application.DTOs;
using CrmApp.Domain.Entities;

namespace CrmApp.Application.Interfaces
{
    public interface IUserService
    {
        Task<User?> GetByUsernameAsync(string username);
        Task<User> RegisterAsync(UserRegisterDto dto);
    }
}
