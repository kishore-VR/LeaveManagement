using System.Text.Json.Serialization;

namespace Novac.Api.Models
{
    public class TeamMember
    {
        public int Id { get; set; }

        public string Email { get; set; } = "";

        public string Name { get; set; } = "";

        public string Expertise { get; set; } = "";

        public int TeamId { get; set; }

        [JsonIgnore]
        public Team? Team { get; set; }

        public ICollection<ChannelMember> ChannelMembers { get; set; } = new List<ChannelMember>();
    }
}
