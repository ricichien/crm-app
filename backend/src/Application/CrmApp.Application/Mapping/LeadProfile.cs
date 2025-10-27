using AutoMapper;
using CrmApp.Domain.Entities;
using CrmApp.Application.DTOs;

namespace CrmApp.Application.Mapping;

public class LeadProfile : Profile
{
    public LeadProfile()
    {
        CreateMap<LeadCreateDto, Lead>()
            .ForMember(d => d.Tasks, opt => opt.Ignore());

        CreateMap<Lead, LeadDto>()
            .ForMember(d => d.LastModifiedAt, opt => opt.MapFrom(s => s.LastModifiedAt));
    }
}