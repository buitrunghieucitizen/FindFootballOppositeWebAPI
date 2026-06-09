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
    public virtual DbSet<Feedback> Feedbacks { get; set; }

    public virtual DbSet<PaymentTransaction> PaymentTransactions { get; set; }

    public virtual DbSet<Tournament> Tournaments { get; set; }

    public virtual DbSet<TournamentTeam> TournamentTeams { get; set; }

    public virtual DbSet<TournamentTeamPlayer> TournamentTeamPlayers { get; set; }

    public virtual DbSet<WithdrawalRequest> WithdrawalRequests { get; set; }

    public virtual DbSet<SystemInvoice> SystemInvoices { get; set; }

    public virtual DbSet<MatchRequest> MatchRequests { get; set; }

    public virtual DbSet<Sport> Sports { get; set; }

    public virtual DbSet<Post> Posts { get; set; }

    public virtual DbSet<TokenTransaction> TokenTransactions { get; set; }

    public virtual DbSet<TeamFundTransaction> TeamFundTransactions { get; set; }

    public virtual DbSet<JoinRequest> JoinRequests { get; set; }

    public virtual DbSet<PlayerRating> PlayerRatings { get; set; }

    public virtual DbSet<BookingCommission> BookingCommissions { get; set; }

    public virtual DbSet<TeamSubscription> TeamSubscriptions { get; set; }

    public virtual DbSet<AdBoost> AdBoosts { get; set; }

    public virtual DbSet<TournamentFee> TournamentFees { get; set; }

    public virtual DbSet<TeamRating> TeamRatings { get; set; }

    public virtual DbSet<PlayerSportProfile> PlayerSportProfiles { get; set; }
    public virtual DbSet<MatchChat> MatchChats { get; set; }
    
    public virtual DbSet<DirectMessage> DirectMessages { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Match>(entity =>
        {
            entity.HasKey(e => e.MatchId).HasName("PK__Matches__4218C8373268C8E4");

            entity.Property(e => e.MatchId).HasColumnName("MatchID");
            entity.Property(e => e.AwayTeamId).HasColumnName("AwayTeamID");
            entity.Property(e => e.CancelRequestedBy).HasColumnName("CancelRequestedBy");
            entity.Property(e => e.ExpiresAt).HasColumnType("datetime");
            entity.Property(e => e.HomeTeamId).HasColumnName("HomeTeamID");
            entity.Property(e => e.MatchStatus).HasMaxLength(50);
            entity.Property(e => e.MatchType)
                .HasMaxLength(50)
                .HasDefaultValue("Friendly");
            entity.Property(e => e.ResultVisibility)
                .HasMaxLength(50)
                .HasDefaultValue("Public");
            entity.Property(e => e.ScheduleId).HasColumnName("ScheduleID");
            entity.Property(e => e.SportId).HasColumnName("SportId");

            entity.HasOne(d => d.AwayTeam).WithMany(p => p.MatchAwayTeams)
                .HasForeignKey(d => d.AwayTeamId)
                .HasConstraintName("FK__Matches__AwayTea__6383C8BA");

            entity.HasOne(d => d.CancelRequestedByNavigation).WithMany(p => p.MatchCancelRequestedByNavigations)
                .HasForeignKey(d => d.CancelRequestedBy)
                .HasConstraintName("FK__Matches__CancelR__656C112C");

            entity.HasOne(d => d.HomeTeam).WithMany(p => p.MatchHomeTeams)
                .HasForeignKey(d => d.HomeTeamId)
                .HasConstraintName("FK__Matches__HomeTea__628FA481");

            entity.HasOne(d => d.Schedule).WithMany(p => p.Matches)
                .HasForeignKey(d => d.ScheduleId)
                .HasConstraintName("FK__Matches__Schedul__6477ECF3");
                
            entity.HasOne(d => d.Sport).WithMany()
                .HasForeignKey(d => d.SportId);

            entity.HasOne(d => d.Tournament).WithMany(p => p.Matches)
                .HasForeignKey(d => d.TournamentId)
                .OnDelete(DeleteBehavior.SetNull);
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
            entity.HasKey(e => e.PitchId).HasName("PK__Pitches__B68228186D58E2AE");

            entity.Property(e => e.PitchId).HasColumnName("PitchID");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.PitchName).HasMaxLength(50);
            entity.Property(e => e.PricePerHour).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.StadiumId).HasColumnName("StadiumID");
            entity.Property(e => e.SportId).HasColumnName("SportId");
            entity.Property(e => e.GrassType).HasMaxLength(50);

            entity.HasOne(d => d.Stadium).WithMany(p => p.Pitches)
                .HasForeignKey(d => d.StadiumId)
                .HasConstraintName("FK__Pitches__Stadium__5165187F");
                
            entity.HasOne(d => d.Sport).WithMany()
                .HasForeignKey(d => d.SportId);
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
            entity.HasKey(e => e.AdId).HasName("PK__Recruitm__7130D58EB18579EB");

            entity.Property(e => e.AdId).HasColumnName("AdID");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.MatchId).HasColumnName("MatchID");
            entity.Property(e => e.PositionNeeded).HasMaxLength(100);
            entity.Property(e => e.TeamId).HasColumnName("TeamID");
            entity.Property(e => e.SportId).HasColumnName("SportId");
            entity.Property(e => e.Title).HasMaxLength(255);

            entity.Property(e => e.IsBoosted).HasDefaultValue(false);
            entity.Property(e => e.BoostUntil).HasColumnType("datetime");

            entity.HasOne(d => d.Match).WithMany(p => p.RecruitmentAds)
                .HasForeignKey(d => d.MatchId)
                .HasConstraintName("FK__Recruitme__Match__6EF57B66");

            entity.HasOne(d => d.Team).WithMany(p => p.RecruitmentAds)
                .HasForeignKey(d => d.TeamId)
                .HasConstraintName("FK__Recruitme__TeamI__6E01572D");
                
            entity.HasOne(d => d.Sport).WithMany()
                .HasForeignKey(d => d.SportId);
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
            entity.HasKey(e => e.TeamId).HasName("PK__Teams__123AE7B988944AE2");

            entity.Property(e => e.TeamId).HasColumnName("TeamID");
            entity.Property(e => e.CaptainId).HasColumnName("CaptainID");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.FoundedDate).HasColumnType("datetime");
            entity.Property(e => e.HomeArea).HasMaxLength(255);
            entity.Property(e => e.IsDisbanded).HasDefaultValue(false);
            entity.Property(e => e.LookingForOpponent).HasDefaultValue(false);
            entity.Property(e => e.QualityLevel).HasMaxLength(50);
            entity.Property(e => e.TeamName).HasMaxLength(100);
            entity.Property(e => e.SportId).HasColumnName("SportId");

            entity.Property(e => e.IsSubscriptionActive).HasDefaultValue(false);
            entity.Property(e => e.SubscriptionEndDate).HasColumnType("datetime");
            entity.Property(e => e.RankingScore).HasDefaultValue(1000);

            entity.Property(e => e.FundBalance).HasColumnType("decimal(18, 2)").HasDefaultValue(0m);
            entity.Property(e => e.IsFundUnlocked).HasDefaultValue(false);

            entity.HasOne(d => d.Captain).WithMany(p => p.Teams)
                .HasForeignKey(d => d.CaptainId)
                .HasConstraintName("FK__Teams__CaptainID__44FF419A");
                
            entity.HasOne(d => d.Sport).WithMany()
                .HasForeignKey(d => d.SportId);
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

        modelBuilder.Entity<MatchChat>(entity =>
        {
            entity.HasKey(e => e.ChatId);

            entity.HasOne(d => d.Match)
                .WithMany()
                .HasForeignKey(d => d.MatchId)
                .OnDelete(DeleteBehavior.ClientSetNull);

            entity.HasOne(d => d.SenderTeam)
                .WithMany()
                .HasForeignKey(d => d.SenderTeamId)
                .OnDelete(DeleteBehavior.ClientSetNull);
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

        modelBuilder.Entity<Tournament>(entity =>
        {
            entity.HasKey(e => e.TournamentId);

            entity.Property(e => e.TournamentName).HasMaxLength(200);
            entity.Property(e => e.Format).HasMaxLength(50);
            entity.Property(e => e.Status).HasMaxLength(50).HasDefaultValue("Upcoming");
            entity.Property(e => e.EndDate).HasColumnType("datetime");

            entity.HasOne(d => d.Stadium).WithMany()
                .HasForeignKey(d => d.StadiumId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(d => d.Organizer).WithMany()
                .HasForeignKey(d => d.OrganizerId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<TournamentTeam>(entity =>
        {
            entity.HasKey(e => new { e.TournamentId, e.TeamId });
            entity.Property(e => e.Status).HasMaxLength(50).HasDefaultValue("Pending");
            entity.Property(e => e.RegistrationDate).HasDefaultValueSql("(getdate())").HasColumnType("datetime");

            entity.HasOne(d => d.Tournament).WithMany(p => p.TournamentTeams)
                .HasForeignKey(d => d.TournamentId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(d => d.Team).WithMany(p => p.TournamentTeams)
                .HasForeignKey(d => d.TeamId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Post>(entity =>
        {
            entity.HasKey(e => e.PostId);
            entity.HasOne(d => d.Author).WithMany().HasForeignKey(d => d.AuthorId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(d => d.Team).WithMany().HasForeignKey(d => d.TeamId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(d => d.Match).WithMany().HasForeignKey(d => d.MatchId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<JoinRequest>(entity =>
        {
            entity.HasKey(e => e.RequestId);
            entity.HasOne(d => d.Player).WithMany().HasForeignKey(d => d.PlayerId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(d => d.Team).WithMany().HasForeignKey(d => d.TeamId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<PlayerRating>(entity =>
        {
            entity.HasKey(e => e.RatingId);
            entity.HasOne(d => d.Player).WithMany().HasForeignKey(d => d.PlayerId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(d => d.RatedBy).WithMany().HasForeignKey(d => d.RatedById).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(d => d.Team).WithMany().HasForeignKey(d => d.TeamId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<PlayerSportProfile>(entity =>
        {
            entity.HasKey(e => e.ProfileId).HasName("PK__PlayerSportProfile");

            entity.Property(e => e.SkillLevel).HasMaxLength(50);
            entity.Property(e => e.PreferredPosition).HasMaxLength(100);
            entity.Property(e => e.TotalMatches).HasDefaultValue(0);
            entity.Property(e => e.RatingScore).HasColumnType("decimal(5, 2)").HasDefaultValue(0m);

            entity.HasOne(d => d.Player)
                .WithMany()
                .HasForeignKey(d => d.PlayerId)
                .HasConstraintName("FK_PlayerSportProfile_Users");

            entity.HasOne(d => d.Sport)
                .WithMany()
                .HasForeignKey(d => d.SportId)
                .HasConstraintName("FK_PlayerSportProfile_Sports");
        });

        modelBuilder.Entity<TeamRating>(entity =>
        {
            entity.HasKey(e => e.RatingId);
            entity.HasOne(d => d.RatedTeam).WithMany(p => p.RatedTeamRatings).HasForeignKey(d => d.RatedTeamId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(d => d.ReviewerTeam).WithMany(p => p.ReviewerTeamRatings).HasForeignKey(d => d.ReviewerTeamId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(d => d.Match).WithMany().HasForeignKey(d => d.MatchId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<PaymentTransaction>(entity =>
        {
            entity.HasKey(e => e.TransactionId);
            entity.Property(e => e.TransactionType).HasMaxLength(50).HasDefaultValue("Premium");
            entity.Property(e => e.Description).HasMaxLength(200);
            entity.HasOne(d => d.User).WithMany().HasForeignKey(d => d.UserId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<TeamFundTransaction>(entity =>
        {
            entity.HasKey(e => e.TransactionId);
        });

        modelBuilder.Entity<TokenTransaction>(entity =>
        {
            entity.HasKey(e => e.TransactionId);
        });

        modelBuilder.Entity<BookingCommission>(entity =>
        {
            entity.HasKey(e => e.CommissionId);
            entity.Property(e => e.BookingAmount).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.CommissionRate).HasColumnType("decimal(5, 4)");
            entity.Property(e => e.CommissionAmount).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Status).HasMaxLength(50).HasDefaultValue("Pending");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())").HasColumnType("datetime");
            entity.HasOne(d => d.Schedule).WithMany().HasForeignKey(d => d.ScheduleId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(d => d.StadiumOwner).WithMany().HasForeignKey(d => d.StadiumOwnerId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<TeamSubscription>(entity =>
        {
            entity.HasKey(e => e.SubscriptionId);
            entity.Property(e => e.Amount).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.PlanType).HasMaxLength(50).HasDefaultValue("Basic");
            entity.Property(e => e.Status).HasMaxLength(50).HasDefaultValue("Pending");
            entity.Property(e => e.StartDate).HasColumnType("datetime");
            entity.Property(e => e.EndDate).HasColumnType("datetime");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())").HasColumnType("datetime");
            entity.HasOne(d => d.Team).WithMany().HasForeignKey(d => d.TeamId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(d => d.PaidByUser).WithMany().HasForeignKey(d => d.PaidByUserId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<AdBoost>(entity =>
        {
            entity.HasKey(e => e.BoostId);
            entity.Property(e => e.Amount).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Status).HasMaxLength(50).HasDefaultValue("Pending");
            entity.Property(e => e.BoostStartDate).HasColumnType("datetime");
            entity.Property(e => e.BoostEndDate).HasColumnType("datetime");
            entity.Property(e => e.IsPriority).HasDefaultValue(false);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())").HasColumnType("datetime");
            entity.HasOne(d => d.RecruitmentAd).WithMany().HasForeignKey(d => d.RecruitmentAdId).OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(d => d.Post).WithMany().HasForeignKey(d => d.PostId).OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(d => d.BoostedByUser).WithMany().HasForeignKey(d => d.BoostedByUserId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<TournamentFee>(entity =>
        {
            entity.HasKey(e => e.FeeId);
            entity.Property(e => e.Amount).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Status).HasMaxLength(50).HasDefaultValue("Pending");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())").HasColumnType("datetime");
            entity.HasOne(d => d.Tournament).WithMany().HasForeignKey(d => d.TournamentId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(d => d.PaidByUser).WithMany().HasForeignKey(d => d.PaidByUserId).OnDelete(DeleteBehavior.Restrict);
        });

        // Tournament - add EntryFee column type
        modelBuilder.Entity<Tournament>(entity =>
        {
            entity.Property(e => e.EntryFee).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.IsFeePaid).HasDefaultValue(false);
        });

        // Team - add subscription fields
        modelBuilder.Entity<Team>(entity =>
        {
            entity.Property(e => e.IsSubscriptionActive).HasDefaultValue(false);
            entity.Property(e => e.SubscriptionEndDate).HasColumnType("datetime");
        });

        // RecruitmentAd - add boost fields
        modelBuilder.Entity<RecruitmentAd>(entity =>
        {
            entity.Property(e => e.IsBoosted).HasDefaultValue(false);
            entity.Property(e => e.BoostUntil).HasColumnType("datetime");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
