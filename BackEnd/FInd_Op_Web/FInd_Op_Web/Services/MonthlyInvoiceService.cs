using FInd_Op_Web.Data;
using FInd_Op_Web.Models;
using Microsoft.EntityFrameworkCore;

namespace FInd_Op_Web.Services
{
    public class MonthlyInvoiceService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<MonthlyInvoiceService> _logger;

        public MonthlyInvoiceService(IServiceProvider serviceProvider, ILogger<MonthlyInvoiceService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                var now = DateTime.Now;
                
                // Calculate next run time: End of the current month
                var daysInMonth = DateTime.DaysInMonth(now.Year, now.Month);
                var endOfMonth = new DateTime(now.Year, now.Month, daysInMonth, 23, 59, 59);
                var delay = endOfMonth - now;

                // For testing purposes, we can override delay to a small amount if needed
                // delay = TimeSpan.FromMinutes(1);

                _logger.LogInformation($"MonthlyInvoiceService waiting for {delay.TotalHours} hours until end of month.");
                await Task.Delay(delay, stoppingToken);

                if (!stoppingToken.IsCancellationRequested)
                {
                    await GenerateMonthlyInvoicesAsync();
                }
            }
        }

        private async Task GenerateMonthlyInvoicesAsync()
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

            var lastMonth = DateTime.Now.AddDays(-1); // At end of month, this is still the same month
            var monthStart = new DateTime(lastMonth.Year, lastMonth.Month, 1);
            var monthEnd = new DateTime(lastMonth.Year, lastMonth.Month, DateTime.DaysInMonth(lastMonth.Year, lastMonth.Month), 23, 59, 59);

            var stadiumOwners = await context.Users
                .Include(u => u.Roles)
                .Where(u => u.Roles.Any(r => r.RoleName == "StadiumOwner"))
                .ToListAsync();

            foreach (var owner in stadiumOwners)
            {
                var ownerId = owner.UserId;
                var ownerSchedules = await context.PitchSchedules
                    .Include(ps => ps.Pitch)
                    .ThenInclude(p => p.Stadium)
                    .Where(ps => ps.Pitch != null && ps.Pitch.Stadium != null && ps.Pitch.Stadium.OwnerId == ownerId 
                                 && ps.ScheduleStatus == "Confirmed" 
                                 && ps.StartTime >= monthStart && ps.StartTime <= monthEnd)
                    .ToListAsync();

                decimal totalRevenue = 0;
                foreach (var s in ownerSchedules)
                {
                    var durationHours = (decimal)(s.EndTime - s.StartTime).TotalHours;
                    totalRevenue += durationHours * (s.Pitch?.PricePerHour ?? 0);
                }

                // Include BookingCommissions if any
                var commissionRevenueSum = await context.BookingCommissions
                    .Where(c => c.StadiumOwnerId == ownerId && c.CreatedAt >= monthStart && c.CreatedAt <= monthEnd)
                    .SumAsync(c => (decimal?)(c.BookingAmount - c.CommissionAmount)) ?? 0;

                totalRevenue += commissionRevenueSum;

                var totalCommission = totalRevenue * 0.05m; // Example: 5% fee to the platform
                var payableToOwner = totalRevenue - totalCommission;

                if (totalRevenue > 0)
                {
                    var invoice = new SystemInvoice
                    {
                        StadiumOwnerId = owner.UserId,
                        Month = lastMonth.Month,
                        Year = lastMonth.Year,
                        TotalRevenue = totalRevenue,
                        TotalCommission = totalCommission,
                        TotalPayableToOwner = payableToOwner,
                        Status = "Pending",
                        CreatedAt = DateTime.Now
                    };
                    context.SystemInvoices.Add(invoice);

                    // Send email to owner
                    if (!string.IsNullOrEmpty(owner.Email))
                    {
                        var emailBody = $@"
                        <h3>Tổng kết doanh thu tháng {lastMonth.Month}/{lastMonth.Year}</h3>
                        <p>Chào {owner.FullName},</p>
                        <p>Doanh thu sân của bạn trong tháng qua là: <strong>{totalRevenue:N0} VNĐ</strong>.</p>
                        <p>Phí sử dụng hệ thống (5%): <strong>{totalCommission:N0} VNĐ</strong>.</p>
                        <p>Vui lòng thanh toán khoản phí này trước ngày 10 tháng sau. Mã hóa đơn: {lastMonth.Month}{lastMonth.Year}_{owner.UserId}</p>
                        <p>Trân trọng,<br>FindFootballOpposite Team</p>";

                        try
                        {
                            await emailService.SendEmailAsync(owner.Email, $"Hóa đơn hệ thống tháng {lastMonth.Month}", emailBody);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError($"Failed to send email to {owner.Email}: {ex.Message}");
                        }
                    }
                }
            }

            await context.SaveChangesAsync();
            _logger.LogInformation("Monthly invoices generated successfully.");
        }
    }
}
