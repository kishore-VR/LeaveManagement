using System.Text.Json.Serialization;

namespace Novac.Api.Models
{
    public class ChannelMember
    {
        public int Id { get; set; }

        public int ChannelId { get; set; }

        [JsonIgnore]
        public Channel Channel { get; set; }

        public int TeamMemberId { get; set; }

        public TeamMember TeamMember { get; set; }
    }
}
