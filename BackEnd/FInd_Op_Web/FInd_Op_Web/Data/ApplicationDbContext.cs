using System;
using System.Collections.Generic;
using FInd_Op_Web.Models;
using Microsoft.EntityFrameworkCore;

namespace FInd_Op_Web.Data;

public partial class ApplicationDbContext : DbContext
{
    public ApplicationDbContext()
    {
    }

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Match> Matches { get; set; }

    public virtual DbSet<MatchPoll> MatchPolls { get; set; }

    public virtual DbSet<MediaFile> MediaFiles { get; set; }

    public virtual DbSet<Notification> Notifications { get; set; }

    public virtual DbSet<Pitch> Pitches { get; set; }

    public virtual DbSet<PitchSchedule> PitchSchedules { get; set; }

    public virtual DbSet<RecruitmentAd> RecruitmentAds { get; set; }

    public virtual DbSet<RecurringBooking> RecurringBookings { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<Stadium> Stadiums { get; set; }

    public virtual DbSet<Team> Teams { get; set; }

    public virtual DbSet<TeamMember> TeamMembers { get; set; }

    public virtual DbSet<User> Users { get; set; }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Match>(entity =>
        {
            entity.HasKey(e => e.MatchId).HasName("PK__Matches__4218C8373268C8E4");

            entity.Property(e => e.MatchId).HasColumnName("MatchID");
            entity.Property(e => e.AwayTeamId).HasColumnName("AwayTeamID");
            entity.Property(e => e.HomeTeamId).HasColumnName("HomeTeamID");
            entity.Property(e => e.MatchStatus).HasMaxLength(50);
            entity.Property(e => e.ScheduleId).HasColumnName("ScheduleID");

            entity.HasOne(d => d.AwayTeam).WithMany(p => p.MatchAwayTeams)
                .HasForeignKey(d => d.AwayTeamId)
                .HasConstraintName("FK__Matches__AwayTea__619B8048");

            entity.HasOne(d => d.CancelRequestedByNavigation).WithMany(p => p.MatchCancelRequestedByNavigations)
                .HasForeignKey(d => d.CancelRequestedBy)
                .HasConstraintName("FK__Matches__CancelR__6383C8BA");

            entity.HasOne(d => d.HomeTeam).WithMany(p => p.MatchHomeTeams)
                .HasForeignKey(d => d.HomeTeamId)
                .HasConstraintName("FK__Matches__HomeTea__60A75C0F");

            entity.HasOne(d => d.Schedule).WithMany(p => p.Matches)
                .HasForeignKey(d => d.ScheduleId)
                .HasConstraintName("FK__Matches__Schedul__628FA481");
        });

        modelBuilder.Entity<MatchPoll>(entity =>
        {
            entity.HasKey(e => new { e.MatchId, e.PlayerId }).HasName("PK__MatchPol__D6BC2F7D6D6D5E38");

            entity.Property(e => e.MatchId).HasColumnName("MatchID");
            entity.Property(e => e.PlayerId).HasColumnName("PlayerID");

            entity.HasOne(d => d.Match).WithMany(p => p.MatchPolls)
                .HasForeignKey(d => d.MatchId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__MatchPoll__Match__66603565");

            entity.HasOne(d => d.Player).WithMany(p => p.MatchPolls)
                .HasForeignKey(d => d.PlayerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__MatchPoll__Playe__6754599E");
        });

        modelBuilder.Entity<MediaFile>(entity =>
        {
            entity.HasKey(e => e.MediaId).HasName("PK__MediaFil__B2C2B5AF86BF5F03");

            entity.Property(e => e.MediaId).HasColumnName("MediaID");
            entity.Property(e => e.EntityId).HasColumnName("EntityID");
            entity.Property(e => e.EntityType).HasMaxLength(50);
            entity.Property(e => e.IsPrimary).HasDefaultValue(false);
            entity.Property(e => e.UploadedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.NotificationId).HasName("PK__Notifica__20CF2E32935404C6");

            entity.Property(e => e.NotificationId).HasColumnName("NotificationID");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.IsRead).HasDefaultValue(false);
            entity.Property(e => e.RelatedLink).HasMaxLength(255);
            entity.Property(e => e.Title).HasMaxLength(200);
            entity.Property(e => e.UserId).HasColumnName("UserID");

            entity.HasOne(d => d.User).WithMany(p => p.Notifications)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__Notificat__UserI__6FE99F9F");
        });

        modelBuilder.Entity<Pitch>(entity =>
        {
            entity.HasKey(e => e.PitchId).HasName("PK__Pitches__8B89B686FE4C70EC");

            entity.Property(e => e.PitchId).HasColumnName("PitchID");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.PitchName).HasMaxLength(50);
            entity.Property(e => e.PricePerHour).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.StadiumId).HasColumnName("StadiumID");

            entity.HasOne(d => d.Stadium).WithMany(p => p.Pitches)
                .HasForeignKey(d => d.StadiumId)
                .HasConstraintName("FK__Pitches__Stadium__52593CB8");
        });

        modelBuilder.Entity<PitchSchedule>(entity =>
        {
            entity.HasKey(e => e.ScheduleId).HasName("PK__PitchSch__9C8A5B694BB6F176");

            entity.Property(e => e.ScheduleId).HasColumnName("ScheduleID");
            entity.Property(e => e.BookedById).HasColumnName("BookedByID");
            entity.Property(e => e.EndTime).HasColumnType("datetime");
            entity.Property(e => e.PitchId).HasColumnName("PitchID");
            entity.Property(e => e.RecurringId).HasColumnName("RecurringID");
            entity.Property(e => e.ScheduleStatus)
                .HasMaxLength(50)
                .HasDefaultValue("Confirmed");
            entity.Property(e => e.StartTime).HasColumnType("datetime");

            entity.HasOne(d => d.BookedBy).WithMany(p => p.PitchSchedules)
                .HasForeignKey(d => d.BookedById)
                .HasConstraintName("FK__PitchSche__Booke__5BE2A6F2");

            entity.HasOne(d => d.Pitch).WithMany(p => p.PitchSchedules)
                .HasForeignKey(d => d.PitchId)
                .HasConstraintName("FK__PitchSche__Pitch__5AEE82B9");

            entity.HasOne(d => d.Recurring).WithMany(p => p.PitchSchedules)
                .HasForeignKey(d => d.RecurringId)
                .HasConstraintName("FK__PitchSche__Recur__5CD6CB2B");
        });

        modelBuilder.Entity<RecruitmentAd>(entity =>
        {
            entity.HasKey(e => e.AdId).HasName("PK__Recruitm__7130D58EFD3B9B95");

            entity.Property(e => e.AdId).HasColumnName("AdID");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.MatchId).HasColumnName("MatchID");
            entity.Property(e => e.PositionNeeded).HasMaxLength(100);
            entity.Property(e => e.TeamId).HasColumnName("TeamID");
            entity.Property(e => e.Title).HasMaxLength(255);

            entity.HasOne(d => d.Match).WithMany(p => p.RecruitmentAds)
                .HasForeignKey(d => d.MatchId)
                .HasConstraintName("FK__Recruitme__Match__6B24EA82");

            entity.HasOne(d => d.Team).WithMany(p => p.RecruitmentAds)
                .HasForeignKey(d => d.TeamId)
                .HasConstraintName("FK__Recruitme__TeamI__6A30C649");
        });

        modelBuilder.Entity<RecurringBooking>(entity =>
        {
            entity.HasKey(e => e.RecurringId).HasName("PK__Recurrin__738186825283E687");

            entity.Property(e => e.RecurringId).HasColumnName("RecurringID");
            entity.Property(e => e.IsApproved).HasDefaultValue(false);
            entity.Property(e => e.PitchId).HasColumnName("PitchID");
            entity.Property(e => e.TeamId).HasColumnName("TeamID");

            entity.HasOne(d => d.Pitch).WithMany(p => p.RecurringBookings)
                .HasForeignKey(d => d.PitchId)
                .HasConstraintName("FK__Recurring__Pitch__5629CD9C");

            entity.HasOne(d => d.Team).WithMany(p => p.RecurringBookings)
                .HasForeignKey(d => d.TeamId)
                .HasConstraintName("FK__Recurring__TeamI__571DF1D5");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("PK__Roles__8AFACE3A9A190F1D");

            entity.HasIndex(e => e.RoleName, "UQ__Roles__8A2B61607CAA59C5").IsUnique();

            entity.Property(e => e.RoleId).HasColumnName("RoleID");
            entity.Property(e => e.RoleName).HasMaxLength(50);
        });

        modelBuilder.Entity<Stadium>(entity =>
        {
            entity.HasKey(e => e.StadiumId).HasName("PK__Stadiums__ED833038C8DC0ECE");

            entity.Property(e => e.StadiumId).HasColumnName("StadiumID");
            entity.Property(e => e.Address).HasMaxLength(255);
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.OwnerId).HasColumnName("OwnerID");
            entity.Property(e => e.StadiumName).HasMaxLength(100);

            entity.HasOne(d => d.Owner).WithMany(p => p.Stadia)
                .HasForeignKey(d => d.OwnerId)
                .HasConstraintName("FK__Stadiums__OwnerI__4E88ABD4");
        });

        modelBuilder.Entity<Team>(entity =>
        {
            entity.HasKey(e => e.TeamId).HasName("PK__Teams__123AE7B9AC85A465");

            entity.Property(e => e.TeamId).HasColumnName("TeamID");
            entity.Property(e => e.CaptainId).HasColumnName("CaptainID");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.IsDisbanded).HasDefaultValue(false);
            entity.Property(e => e.QualityLevel).HasMaxLength(50);
            entity.Property(e => e.TeamName).HasMaxLength(100);

            entity.HasOne(d => d.Captain).WithMany(p => p.Teams)
                .HasForeignKey(d => d.CaptainId)
                .HasConstraintName("FK__Teams__CaptainID__4316F928");
        });

        modelBuilder.Entity<TeamMember>(entity =>
        {
            entity.HasKey(e => new { e.TeamId, e.PlayerId }).HasName("PK__TeamMemb__869E00F323A341A2");

            entity.Property(e => e.TeamId).HasColumnName("TeamID");
            entity.Property(e => e.PlayerId).HasColumnName("PlayerID");
            entity.Property(e => e.JoinedDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.RoleInTeam)
                .HasMaxLength(50)
                .HasDefaultValue("Member");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("Active");

            entity.HasOne(d => d.Player).WithMany(p => p.TeamMembers)
                .HasForeignKey(d => d.PlayerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__TeamMembe__Playe__48CFD27E");

            entity.HasOne(d => d.Team).WithMany(p => p.TeamMembers)
                .HasForeignKey(d => d.TeamId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__TeamMembe__TeamI__47DBAE45");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Users__1788CCAC4609C301");

            entity.HasIndex(e => e.Username, "UQ__Users__536C85E42A2264E0").IsUnique();

            entity.Property(e => e.UserId).HasColumnName("UserID");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.FullName).HasMaxLength(100);
            entity.Property(e => e.IsFreeAgent).HasDefaultValue(false);
            entity.Property(e => e.PasswordHash).HasMaxLength(255);
            entity.Property(e => e.Phone).HasMaxLength(20);
            entity.Property(e => e.Username).HasMaxLength(100);

            entity.HasMany(d => d.Roles).WithMany(p => p.Users)
                .UsingEntity<Dictionary<string, object>>(
                    "UserRole",
                    r => r.HasOne<Role>().WithMany()
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__UserRoles__RoleI__403A8C7D"),
                    l => l.HasOne<User>().WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__UserRoles__UserI__3F466844"),
                    j =>
                    {
                        j.HasKey("UserId", "RoleId").HasName("PK__UserRole__AF27604FE3C98EF0");
                        j.ToTable("UserRoles");
                        j.IndexerProperty<int>("UserId").HasColumnName("UserID");
                        j.IndexerProperty<int>("RoleId").HasColumnName("RoleID");
                    });
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
