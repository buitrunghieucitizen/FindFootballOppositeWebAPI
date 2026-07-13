using FInd_Op_Web.Data;
using FInd_Op_Web.Models;
using Microsoft.EntityFrameworkCore;

namespace FInd_Op_Web.Services
{
    public class MatchMaintenanceService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<MatchMaintenanceService> _logger;

        public MatchMaintenanceService(IServiceProvider serviceProvider, ILogger<MatchMaintenanceService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await MaintainMatchesAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred executing MatchMaintenanceService.");
                }

                // Run every 5 minutes
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
        }

        private async Task MaintainMatchesAsync()
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var threeDaysAgo = DateTime.Now.AddDays(-3);

            // Find matches that ended more than 3 days ago, and don't have a score
            var expiredMatches = await context.Matches
                .Where(m => (m.MatchStatus == "Scheduled" || m.MatchStatus == "Completed")
                         && m.MatchDate <= threeDaysAgo.Date 
                         && m.HomeScore == null 
                         && m.AwayScore == null
                         && m.SetScores == null)
                .ToListAsync();

            if (expiredMatches.Any())
            {
                foreach (var match in expiredMatches)
                {
                    // Cancel results, mark as finished without score
                    match.MatchStatus = "Completed";
                    match.CancelReason = "Hủy kết quả do không có tỉ số sau 3 ngày";
                }

                await context.SaveChangesAsync();
                _logger.LogInformation($"MatchMaintenanceService: Cancelled {expiredMatches.Count} matches due to missing scores.");
            }

            var thirtyMinsFromNow = DateTime.Now.AddMinutes(30);

            // Find pending payment schedules less than 30 mins away
            var pendingSchedules = await context.PitchSchedules
                .Where(ps => ps.ScheduleStatus == "PendingPayment"
                          && ps.StartTime <= thirtyMinsFromNow)
                .ToListAsync();

            if (pendingSchedules.Any())
            {
                foreach (var ps in pendingSchedules)
                {
                    ps.ScheduleStatus = "Cancelled";
                    // Also notify the user who booked it
                    if (ps.BookedById.HasValue)
                    {
                        context.Notifications.Add(new Notification
                        {
                            UserId = ps.BookedById.Value,
                            Title = "Sân đã bị hủy",
                            Message = $"Lịch đặt sân lúc {ps.StartTime:HH:mm dd/MM/yyyy} đã bị hủy do chưa xác nhận đặt cọc trước 30 phút.",
                            CreatedAt = DateTime.Now,
                            IsRead = false
                        });
                    }
                }

                await context.SaveChangesAsync();
                _logger.LogInformation($"MatchMaintenanceService: Cancelled {pendingSchedules.Count} pending payment schedules.");
            }
        }
    }
}
