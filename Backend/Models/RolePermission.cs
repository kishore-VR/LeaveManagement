namespace Novac.Api.Models
{
    public class RolePermission
    {
        public int Id { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public string PermissionName { get; set; } = string.Empty;
    }
}
