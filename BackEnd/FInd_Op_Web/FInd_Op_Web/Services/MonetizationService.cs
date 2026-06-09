using FInd_Op_Web.Data;
using FInd_Op_Web.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace FInd_Op_Web.Services;

/// <summary>
/// Service xử lý tất cả logic kinh doanh cho các chức năng kiếm tiền
/// </summary>
public class MonetizationService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;

    public MonetizationService(ApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    // ============================================================
    // CONFIGURATION - Lấy mức giá từ appsettings.json
    // ============================================================

    public decimal GetBookingCommissionRate()
        => _configuration.GetValue<decimal>("Monetization:BookingCommissionRate", 0.10m);

    public int GetTeamMonthlyFee()
        => _configuration.GetValue<int>("Monetization:TeamMonthlyFee", 100000);

    public int GetAdBoostFee()
        => _configuration.GetValue<int>("Monetization:AdBoostFee", 20000);

    public int GetAdBoostDurationDays()
        => _configuration.GetValue<int>("Monetization:AdBoostDurationDays", 7);

    public int GetTournamentCreationFee()
        => _configuration.GetValue<int>("Monetization:TournamentCreationFee", 200000);

    // ============================================================
    // 1. HOA HỒNG ĐẶT SÂN (Booking Commission)
    // ============================================================

    /// <summary>
    /// Tính và tạo record hoa hồng khi đặt sân thành công
    /// </summary>
    public async Task<BookingCommission> CreateBookingCommission(int scheduleId)
    {
        var schedule = await _context.PitchSchedules
            .Include(s => s.Pitch)
                .ThenInclude(p => p!.Stadium)
            .FirstOrDefaultAsync(s => s.ScheduleId == scheduleId);

        if (schedule?.Pitch?.Stadium == null)
            throw new InvalidOperationException("Schedule, Pitch or Stadium not found.");

        var hours = (decimal)(schedule.EndTime - schedule.StartTime).TotalHours;
        var bookingAmount = schedule.Pitch.PricePerHour * hours;
        var commissionRate = GetBookingCommissionRate();
        var commissionAmount = bookingAmount * commissionRate;

        var commission = new BookingCommission
        {
            ScheduleId = scheduleId,
            StadiumOwnerId = schedule.Pitch.Stadium.OwnerId ?? 0,
            BookingAmount = bookingAmount,
            CommissionRate = commissionRate,
            CommissionAmount = commissionAmount,
            Status = "Pending",
            CreatedAt = DateTime.Now
        };

        _context.BookingCommissions.Add(commission);
        await _context.SaveChangesAsync();

        return commission;
    }

    /// <summary>
    /// Tạo PaymentTransaction cho hoa hồng đặt sân
    /// </summary>
    public async Task<PaymentTransaction> CreateCommissionPayment(int commissionId, int userId)
    {
        var commission = await _context.BookingCommissions.FindAsync(commissionId);
        if (commission == null)
            throw new InvalidOperationException("Commission not found.");

        long orderCode = long.Parse(DateTimeOffset.Now.ToString("yyMMddHHmmssfff"));

        var transaction = new PaymentTransaction
        {
            UserId = userId,
            Amount = (int)commission.CommissionAmount,
            OrderCode = orderCode,
            TransactionType = "BookingCommission",
            ReferenceId = commissionId,
            Description = $"Hoa hồng đặt sân - Schedule #{commission.ScheduleId}",
            Status = "Pending",
            CreatedAt = DateTime.Now
        };

        _context.PaymentTransactions.Add(transaction);
        await _context.SaveChangesAsync();

        return transaction;
    }

    // ============================================================
    // 2. PHÍ HOẠT ĐỘNG ĐỘI HÀNG THÁNG (Team Subscription)
    // ============================================================

    /// <summary>
    /// Tạo subscription và payment cho đội
    /// </summary>
    public async Task<(TeamSubscription subscription, PaymentTransaction transaction)> CreateTeamSubscriptionPayment(int teamId, int userId)
    {
        var team = await _context.Teams.FindAsync(teamId);
        if (team == null)
            throw new InvalidOperationException("Team not found.");

        var amount = GetTeamMonthlyFee();
        var startDate = DateTime.Now;
        var endDate = startDate.AddMonths(1);

        // Nếu đội đang có subscription active, gia hạn từ ngày hết hạn
        if (team.IsSubscriptionActive && team.SubscriptionEndDate.HasValue && team.SubscriptionEndDate > DateTime.Now)
        {
            startDate = team.SubscriptionEndDate.Value;
            endDate = startDate.AddMonths(1);
        }

        var subscription = new TeamSubscription
        {
            TeamId = teamId,
            PaidByUserId = userId,
            Amount = amount,
            PlanType = "Basic",
            StartDate = startDate,
            EndDate = endDate,
            Status = "Pending",
            CreatedAt = DateTime.Now
        };

        _context.TeamSubscriptions.Add(subscription);
        await _context.SaveChangesAsync();

        long orderCode = long.Parse(DateTimeOffset.Now.ToString("yyMMddHHmmssfff"));

        var transaction = new PaymentTransaction
        {
            UserId = userId,
            Amount = amount,
            OrderCode = orderCode,
            TransactionType = "TeamSubscription",
            ReferenceId = subscription.SubscriptionId,
            Description = $"Phí hoạt động hàng tháng - Đội {team.TeamName}",
            Status = "Pending",
            CreatedAt = DateTime.Now
        };

        _context.PaymentTransactions.Add(transaction);
        await _context.SaveChangesAsync();

        return (subscription, transaction);
    }

    /// <summary>
    /// Kích hoạt subscription sau khi thanh toán thành công
    /// </summary>
    public async Task ActivateTeamSubscription(int subscriptionId)
    {
        var subscription = await _context.TeamSubscriptions
            .Include(s => s.Team)
            .FirstOrDefaultAsync(s => s.SubscriptionId == subscriptionId);

        if (subscription == null) return;

        subscription.Status = "Active";
        subscription.Team.IsSubscriptionActive = true;
        subscription.Team.SubscriptionEndDate = subscription.EndDate;

        await _context.SaveChangesAsync();
    }

    // ============================================================
    // 3. PHÍ QUẢNG CÁO (Ad Boost)
    // ============================================================

    /// <summary>
    /// Tạo boost và payment cho quảng cáo/bài đăng
    /// </summary>
    public async Task<(AdBoost boost, PaymentTransaction transaction)> CreateAdBoostPayment(
        int userId, int? recruitmentAdId = null, int? postId = null)
    {
        if (recruitmentAdId == null && postId == null)
            throw new InvalidOperationException("Must specify either RecruitmentAdId or PostId.");

        var amount = GetAdBoostFee();
        var boostDays = GetAdBoostDurationDays();

        var boost = new AdBoost
        {
            RecruitmentAdId = recruitmentAdId,
            PostId = postId,
            BoostedByUserId = userId,
            Amount = amount,
            BoostStartDate = DateTime.Now,
            BoostEndDate = DateTime.Now.AddDays(boostDays),
            Status = "Pending",
            IsPriority = true,
            CreatedAt = DateTime.Now
        };

        _context.AdBoosts.Add(boost);
        await _context.SaveChangesAsync();

        long orderCode = long.Parse(DateTimeOffset.Now.ToString("yyMMddHHmmssfff"));

        string description = recruitmentAdId.HasValue
            ? $"Boost quảng cáo tuyển quân #{recruitmentAdId}"
            : $"Boost bài đăng #{postId}";

        var transaction = new PaymentTransaction
        {
            UserId = userId,
            Amount = amount,
            OrderCode = orderCode,
            TransactionType = "AdBoost",
            ReferenceId = boost.BoostId,
            Description = description,
            Status = "Pending",
            CreatedAt = DateTime.Now
        };

        _context.PaymentTransactions.Add(transaction);
        await _context.SaveChangesAsync();

        return (boost, transaction);
    }

    /// <summary>
    /// Kích hoạt boost sau khi thanh toán thành công
    /// </summary>
    public async Task ActivateAdBoost(int boostId)
    {
        var boost = await _context.AdBoosts
            .Include(b => b.RecruitmentAd)
            .FirstOrDefaultAsync(b => b.BoostId == boostId);

        if (boost == null) return;

        boost.Status = "Active";
        boost.BoostStartDate = DateTime.Now;
        boost.BoostEndDate = DateTime.Now.AddDays(GetAdBoostDurationDays());

        // Cập nhật trạng thái boost trên RecruitmentAd
        if (boost.RecruitmentAd != null)
        {
            boost.RecruitmentAd.IsBoosted = true;
            boost.RecruitmentAd.BoostUntil = boost.BoostEndDate;
        }

        await _context.SaveChangesAsync();
    }

    // ============================================================
    // 4. PHÍ TẠO GIẢI ĐẤU (Tournament Fee)
    // ============================================================

    /// <summary>
    /// Tạo fee và payment cho tạo giải đấu
    /// </summary>
    public async Task<(TournamentFee fee, PaymentTransaction transaction)> CreateTournamentFeePayment(int tournamentId, int userId)
    {
        var tournament = await _context.Tournaments.FindAsync(tournamentId);
        if (tournament == null)
            throw new InvalidOperationException("Tournament not found.");

        if (tournament.IsFeePaid)
            throw new InvalidOperationException("Tournament fee already paid.");

        var amount = GetTournamentCreationFee();

        var fee = new TournamentFee
        {
            TournamentId = tournamentId,
            PaidByUserId = userId,
            Amount = amount,
            Status = "Pending",
            CreatedAt = DateTime.Now
        };

        _context.TournamentFees.Add(fee);
        await _context.SaveChangesAsync();

        long orderCode = long.Parse(DateTimeOffset.Now.ToString("yyMMddHHmmssfff"));

        var transaction = new PaymentTransaction
        {
            UserId = userId,
            Amount = amount,
            OrderCode = orderCode,
            TransactionType = "TournamentFee",
            ReferenceId = fee.FeeId,
            Description = $"Phí tạo giải đấu - {tournament.TournamentName}",
            Status = "Pending",
            CreatedAt = DateTime.Now
        };

        _context.PaymentTransactions.Add(transaction);
        await _context.SaveChangesAsync();

        return (fee, transaction);
    }

    /// <summary>
    /// Kích hoạt giải đấu sau khi thanh toán phí thành công
    /// </summary>
    public async Task ActivateTournament(int feeId)
    {
        var fee = await _context.TournamentFees
            .Include(f => f.Tournament)
            .FirstOrDefaultAsync(f => f.FeeId == feeId);

        if (fee == null) return;

        fee.Status = "Paid";
        fee.Tournament.IsFeePaid = true;
        fee.Tournament.EntryFee = fee.Amount;

        await _context.SaveChangesAsync();
    }

    // ============================================================
    // 5. WEBHOOK PROCESSING - Xử lý thanh toán theo loại
    // ============================================================

    /// <summary>
    /// Xử lý webhook thanh toán thành công dựa theo TransactionType
    /// </summary>
    public async Task<bool> ProcessSuccessfulPayment(long orderCode)
    {
        var transaction = await _context.PaymentTransactions
            .FirstOrDefaultAsync(t => t.OrderCode == orderCode && t.Status == "Pending");

        if (transaction == null) return false;

        transaction.Status = "Paid";

        switch (transaction.TransactionType)
        {
            case "Premium":
                var user = await _context.Users.FindAsync(transaction.UserId);
                if (user != null)
                {
                    user.IsPremium = true;
                    user.PremiumUntil = DateTime.Now.AddMonths(1);
                }
                break;

            case "BookingCommission":
                if (transaction.ReferenceId.HasValue)
                {
                    var commission = await _context.BookingCommissions.FindAsync(transaction.ReferenceId.Value);
                    if (commission != null)
                    {
                        commission.Status = "Collected";
                    }
                }
                break;

            case "TeamSubscription":
                if (transaction.ReferenceId.HasValue)
                {
                    await ActivateTeamSubscription(transaction.ReferenceId.Value);
                }
                break;

            case "AdBoost":
                if (transaction.ReferenceId.HasValue)
                {
                    await ActivateAdBoost(transaction.ReferenceId.Value);
                }
                break;

            case "TournamentFee":
                if (transaction.ReferenceId.HasValue)
                {
                    await ActivateTournament(transaction.ReferenceId.Value);
                }
                break;

            default:
                break;
        }

        await _context.SaveChangesAsync();
        return true;
    }

    // ============================================================
    // 6. REVENUE REPORTS (Admin)
    // ============================================================

    /// <summary>
    /// Lấy tổng doanh thu theo từng loại
    /// </summary>
    public async Task<object> GetRevenueSummary()
    {
        var paidTransactions = _context.PaymentTransactions.Where(t => t.Status == "Paid");

        var premiumRevenue = await paidTransactions
            .Where(t => t.TransactionType == "Premium")
            .SumAsync(t => (decimal?)t.Amount) ?? 0;

        var commissionRevenue = await paidTransactions
            .Where(t => t.TransactionType == "BookingCommission")
            .SumAsync(t => (decimal?)t.Amount) ?? 0;

        var subscriptionRevenue = await paidTransactions
            .Where(t => t.TransactionType == "TeamSubscription")
            .SumAsync(t => (decimal?)t.Amount) ?? 0;

        var adBoostRevenue = await paidTransactions
            .Where(t => t.TransactionType == "AdBoost")
            .SumAsync(t => (decimal?)t.Amount) ?? 0;

        var tournamentFeeRevenue = await paidTransactions
            .Where(t => t.TransactionType == "TournamentFee")
            .SumAsync(t => (decimal?)t.Amount) ?? 0;

        var totalRevenue = premiumRevenue + commissionRevenue + subscriptionRevenue + adBoostRevenue + tournamentFeeRevenue;

        return new
        {
            totalRevenue,
            breakdown = new
            {
                premium = premiumRevenue,
                bookingCommission = commissionRevenue,
                teamSubscription = subscriptionRevenue,
                adBoost = adBoostRevenue,
                tournamentFee = tournamentFeeRevenue
            },
            transactionCount = await paidTransactions.CountAsync(),
            generatedAt = DateTime.Now
        };
    }
}
