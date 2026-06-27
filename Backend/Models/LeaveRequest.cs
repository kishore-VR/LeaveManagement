namespace Novac.Api.Models
{
    public class LeaveRequest
    {
        public int Id { get; set; }

        // ✅ Backend sets this
        public string? UserEmail { get; set; }

        // ✅ Backend sets this
        public string? Role { get; set; }

        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }

        public string Reason { get; set; }

        // ✅ Backend sets this
        public string? Status { get; set; }

        // ✅ Backend sets this
        public string? ManagerEmail { get; set; }

        // ✅ Only needed for manager requests
        public string? AdminEmail { get; set; }
    }
}