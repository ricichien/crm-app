using AutoMapper;
using CrmApp.Domain.Entities;
using CrmApp.Application.DTOs;

namespace CrmApp.Application.Mapping;

public class LeadProfile : Profile
{
    public LeadProfile()
    {
        // Create / Update
        CreateMap<LeadCreateDto, Lead>()
            .ForMember(d => d.Tasks, opt => opt.Ignore());

        // Entity → DTO
        CreateMap<Lead, LeadDto>()
            .ForMember(d => d.LastModifiedAt, opt => opt.MapFrom(s => s.UpdatedAt));
            // Id e CreatedAt já têm o mesmo nome e tipo, não precisa mapear manualmente
    }
}

// // FILE: backend/src/Application/CrmApp.Application/Mapping/LeadProfile.cs
// using AutoMapper;
// using CrmApp.Domain.Entities;
// using CrmApp.Application.DTOs;

// namespace CrmApp.Application.Mapping;

// public class LeadProfile : Profile
// {
//     public LeadProfile()
//     {
//         CreateMap<LeadCreateDto, Lead>()
//             .ForMember(d => d.Tasks, opt => opt.Ignore());

//         CreateMap<Lead, LeadDto>()
//             .ForMember(d => d.Id, opt => opt.MapFrom(s => s.Id))
//             .ForMember(d => d.CreatedAt, opt => opt.MapFrom(s => s.CreatedAt))
//             .ForMember(d => d.LastModifiedAt, opt => opt.MapFrom(s => s.UpdatedAt));
//     }
// }
