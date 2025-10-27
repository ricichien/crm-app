using AutoMapper;
using CrmApp.Application.DTOs;
using CrmApp.Application.Interfaces;
using CrmApp.Domain.Entities;
using CrmApp.Infrastructure.Persistence;
using CrmApp.Infrastructure.Repositories;

namespace CrmApp.Infrastructure.Services
{
    public class TaskItemService : ITaskItemService
    {
        private readonly ITaskItemRepository _repository;
        private readonly IMapper _mapper;

        public TaskItemService(ITaskItemRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<TaskItemDto>> GetAllAsync()
        {
            var tasks = await _repository.GetAllAsync();
            return _mapper.Map<IEnumerable<TaskItemDto>>(tasks);
        }

        public async Task<TaskItemDto?> GetByIdAsync(int id)
        {
            var task = await _repository.GetByIdAsync(id);
            return task == null ? null : _mapper.Map<TaskItemDto>(task);
        }

        public async Task<TaskItemDto> CreateAsync(TaskItemCreateDto dto)
        {
            var task = _mapper.Map<TaskItem>(dto);
            await _repository.CreateAsync(task);
            return _mapper.Map<TaskItemDto>(task);
        }

        public async Task<TaskItemDto?> UpdateAsync(int id, TaskItemCreateDto dto)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return null;

            _mapper.Map(dto, existing);
            await _repository.UpdateAsync(existing);
            return _mapper.Map<TaskItemDto>(existing);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return false;

            await _repository.DeleteAsync(id);
            return true;
        }
    }
}
