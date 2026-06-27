using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Novac.Api.Models;

namespace Novac.Api.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<RoleConfig> RoleConfigs { get; set; }
    public DbSet<RolePermission> RolePermissions { get; set; }
    public DbSet<LeaveRequest> LeaveRequests { get; set; }

    public DbSet<Channel> Channels { get; set; }
    public DbSet<ChannelMember> ChannelMembers { get; set; }
    public DbSet<Team> Teams { get; set; }
    public DbSet<TeamMember> TeamMembers { get; set; }
    public DbSet<RoleRequest> RoleRequests { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // ✅ TEAM → MEMBERS (keep cascade)
        builder.Entity<Team>()
            .HasMany(t => t.Members)
            .WithOne(m => m.Team)
            .HasForeignKey(m => m.TeamId)
            .OnDelete(DeleteBehavior.Cascade);

        // ✅ CHANNEL → TEAM (keep cascade)
        builder.Entity<Channel>()
            .HasOne(c => c.Team)
            .WithMany(t => t.Channels)
            .HasForeignKey(c => c.TeamId)
            .OnDelete(DeleteBehavior.Cascade);

        // ✅ CHANNEL MEMBER → CHANNEL (keep cascade)
        builder.Entity<ChannelMember>()
            .HasOne(cm => cm.Channel)
            .WithMany(c => c.Members)
            .HasForeignKey(cm => cm.ChannelId)
            .OnDelete(DeleteBehavior.Cascade);

        // ✅ ✅ FIX: PREVENT MULTIPLE CASCADE PATHS
        builder.Entity<ChannelMember>()
            .HasOne(cm => cm.TeamMember)
            .WithMany(tm => tm.ChannelMembers)
            .HasForeignKey(cm => cm.TeamMemberId)
            .OnDelete(DeleteBehavior.Restrict); // ✅ IMPORTANT FIX
    }
}