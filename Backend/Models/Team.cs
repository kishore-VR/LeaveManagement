using System.Collections.Generic;

namespace Novac.Api.Models
{
    public class Team
    {
        public int Id { get; set; }

        public string TeamName { get; set; } = string.Empty;

        public string CreatedBy { get; set; } = string.Empty;

        public string ManagerEmail { get; set; } = string.Empty;

        public ICollection<TeamMember> Members { get; set; } = new List<TeamMember>();

        public ICollection<Channel> Channels { get; set; } = new List<Channel>();
    }
}