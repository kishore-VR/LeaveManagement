using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Novac.Api.Models
{
    public class Channel
    {
        public int Id { get; set; }

        public string Name { get; set; } = "";

        public int TeamId { get; set; }

        [JsonIgnore]
        public Team Team { get; set; }

        public ICollection<ChannelMember> Members { get; set; } = new List<ChannelMember>();
    }
}
