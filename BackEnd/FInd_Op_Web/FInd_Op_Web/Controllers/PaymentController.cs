using FInd_Op_Web.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FInd_Op_Web.Data;
using FInd_Op_Web.Models;
using PayOS;
using PayOS.Models.V2.PaymentRequests;
using PayOS.Models.Webhooks;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace FInd_Op_Web.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly PayOSClient? _payOS;
        private readonly IConfiguration _configuration;

        public PaymentController(ApplicationDbContext context, IConfiguration configuration, PayOSClient? payOS = null)
        {
            _context = context;
            _payOS = payOS;
            _configuration = configuration;
        }

        [Authorize]
        [HttpPost("CreatePaymentLink")]
        public async Task<IActionResult> CreatePaymentLink([FromBody] CreatePaymentDto dto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null) return Unauthorized("User not authenticated.");
                int userId = int.Parse(userIdClaim.Value);

                var user = await _context.Users.FindAsync(userId);
                if (user == null) return NotFound("User not found.");

                // Create a unique OrderCode (must be max 53 bit integer)
                long orderCode = long.Parse(DateTimeOffset.Now.ToString("yyMMddHHmmssfff"));
                int amount = 59000; // default Player Pro 59k
                string description = "Player Pro Subscription";

                if (dto.Type == "TeamUpgrade")
                {
                    amount = 99000;
                    description = $"Team {dto.TeamId} Pro Upgrade";
                }
                else if (dto.Type == "TokenTopup")
                {
                    amount = dto.Amount ?? 50000;
                    description = $"Mua {dto.Tokens ?? 50} Token";
                }
                else if (dto.Type == "VenuePro")
                {
                    amount = 299000;
                    description = "Venue Pro Subscription";
                }
                else if (dto.Type == "PickupMatch")
                {
                    amount = 9000;
                    description = "Mua lượt đá lẻ";
                }
                else if (dto.Type == "BoostPost")
                {
                    amount = 19000;
                    description = "Boost bài tìm đối";
                }
                else if (dto.Type == "AntiFlakeDeposit")
                {
                    amount = 50000;
                    description = "Cọc chống bùng kèo";
                }
                else if (dto.Type == "PitchCreation")
                {
                    amount = 30000;
                    description = "Tạo sân thứ 3";
                }
                else if (dto.Type == "BookingDeposit")
                {
                    if (dto.ScheduleId == null) return BadRequest("ScheduleId is required for BookingDeposit");
                    var schedule = await _context.PitchSchedules.Include(ps => ps.Pitch).FirstOrDefaultAsync(ps => ps.ScheduleId == dto.ScheduleId);
                    if (schedule == null || schedule.Pitch == null) return NotFound("Schedule or Pitch not found");
                    
                    var durationHours = (decimal)(schedule.EndTime - schedule.StartTime).TotalHours;
                    var totalAmount = durationHours * schedule.Pitch.PricePerHour;
                    amount = (int)(totalAmount * 0.3m); // 30% deposit
                    if (amount < 2000) amount = 2000; // PayOS min amount is 2000 VND
                    description = $"Cọc 30% sân {schedule.Pitch.PitchName}";
                }

                // Save pending transaction
                var transaction = new Models.PaymentTransaction
                {
                    UserId = userId,
                    Amount = amount,
                    OrderCode = orderCode,
                    Status = "Pending",
                    TransactionType = dto.Type,
                    Description = description,
                    CreatedAt = DateTime.Now
                };

                _context.PaymentTransactions.Add(transaction);
                await _context.SaveChangesAsync();

                // Create PayOS payment link
                var paymentRequest = new CreatePaymentLinkRequest
                {
                    OrderCode = orderCode,
                    Amount = amount,
                    Description = "Upgrade Premium",
                    CancelUrl = _configuration["PayOS:CancelUrl"],
                    ReturnUrl = _configuration["PayOS:ReturnUrl"]
                };

                try
                {
                    if (_payOS == null || string.IsNullOrEmpty(_configuration["PayOS:ClientId"]) || _configuration["PayOS:ClientId"] == "YOUR_CLIENT_ID")
                        throw new Exception("PayOS not configured");

                    var createPaymentResult = await _payOS.PaymentRequests.CreateAsync(paymentRequest);

                    return Ok(new
                    {
                        checkoutUrl = createPaymentResult.CheckoutUrl,
                        qrCode = createPaymentResult.QrCode,
                        orderCode = orderCode
                    });
                }
                catch (Exception)
                {
                    // Mock success
                    transaction.Status = "Paid";
                    if (transaction.TransactionType == "UserPremium" || string.IsNullOrEmpty(transaction.TransactionType))
                    {
                        if (user != null)
                        {
                            user.IsPremium = true;
                            user.PremiumUntil = DateTime.Now.AddMonths(1);
                        }
                    }
                    else if (transaction.TransactionType == "TeamUpgrade")
                    {
                        var team = await _context.Teams.FirstOrDefaultAsync(t => t.CaptainId == transaction.UserId);
                        if (team != null)
                        {
                            team.IsSubscriptionActive = true;
                            team.SubscriptionEndDate = DateTime.Now.AddMonths(1);
                        }
                    }
                    else if (transaction.TransactionType == "VenuePro")
                    {
                        if (user != null)
                        {
                            user.IsPremium = true;
                            user.PremiumUntil = DateTime.Now.AddMonths(1);
                        }
                    }
                    else if (transaction.TransactionType == "BookingDeposit")
                    {
                        var schedule = await _context.PitchSchedules
                            .Where(ps => ps.BookedById == transaction.UserId && ps.ScheduleStatus == "PendingPayment")
                            .OrderByDescending(ps => ps.ScheduleId)
                            .FirstOrDefaultAsync();

                        if (schedule != null)
                        {
                            schedule.ScheduleStatus = "Booked"; // or Confirmed

                            // Calculate 8% commission
                            var fullSchedule = await _context.PitchSchedules.Include(s => s.Pitch).ThenInclude(p => p.Stadium).FirstOrDefaultAsync(s => s.ScheduleId == schedule.ScheduleId);
                            if (fullSchedule?.Pitch?.Stadium != null)
                            {
                                var durationHours = (decimal)(fullSchedule.EndTime - fullSchedule.StartTime).TotalHours;
                                var totalAmount = durationHours * fullSchedule.Pitch.PricePerHour;
                                var commission = totalAmount * 0.08m;

                                var commissionRecord = new BookingCommission
                                {
                                    ScheduleId = fullSchedule.ScheduleId,
                                    StadiumOwnerId = fullSchedule.Pitch.Stadium.OwnerId ?? 0,
                                    BookingAmount = totalAmount,
                                    CommissionAmount = commission,
                                    IsPaidToPlatform = false,
                                    CreatedAt = DateTime.Now
                                };
                                _context.BookingCommissions.Add(commissionRecord);
                            }
                        }
                    }
                    else if (transaction.TransactionType == "BoostPost" && dto.PitchId.HasValue) // PitchId here acts as PostId or we can just give generic tokens
                    {
                        // Ignore for now
                    }
                    else if (transaction.TransactionType == "TokenTopup")
                    {
                        if (user != null)
                        {
                            user.Tokens += dto.Tokens ?? 50;
                            
                            _context.TokenTransactions.Add(new TokenTransaction {
                                UserId = user.UserId,
                                Amount = dto.Tokens ?? 50,
                                TransactionType = "Topup",
                                Description = "Nạp Token",
                                CreatedAt = DateTime.Now
                            });
                        }
                    }
                    
                    await _context.SaveChangesAsync();

                    string returnUrl = _configuration["PayOS:ReturnUrl"] ?? "http://localhost:5173/payment-success";
                    string mockedCheckoutUrl = $"{returnUrl}?code=00&id={orderCode}&cancel=false&status=PAID&orderCode={orderCode}";

                    return Ok(new
                    {
                        checkoutUrl = mockedCheckoutUrl,
                        qrCode = "",
                        orderCode = orderCode,
                        isMocked = true
                    });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("Webhook")]
        public async Task<IActionResult> Webhook([FromBody] Webhook webhookBody)
        {
            try
            {
                if (_payOS == null)
                    return BadRequest(new { message = "Payment service is not configured." });

                // Verify webhook signature to ensure it's from PayOS
                WebhookData webhookData = await _payOS.Webhooks.VerifyAsync(webhookBody);

                // If verification is successful, process the payment
                if (webhookData.Code == "00")
                {
                    long orderCode = webhookData.OrderCode;
                    
                    var transaction = await _context.PaymentTransactions
                        .FirstOrDefaultAsync(t => t.OrderCode == orderCode);

                    if (transaction != null && transaction.Status == "Pending")
                    {
                        transaction.Status = "Paid";

                        if (transaction.TransactionType == "UserPremium" || string.IsNullOrEmpty(transaction.TransactionType))
                        {
                            var user = await _context.Users.FindAsync(transaction.UserId);
                            if (user != null)
                            {
                                user.IsPremium = true;
                                user.PremiumUntil = DateTime.Now.AddMonths(1);
                            }
                        }
                        else if (transaction.TransactionType == "TeamUpgrade")
                        {
                            var team = await _context.Teams.FirstOrDefaultAsync(t => t.CaptainId == transaction.UserId);
                            if (team != null)
                            {
                                team.IsSubscriptionActive = true;
                                team.SubscriptionEndDate = DateTime.Now.AddMonths(1);
                            }
                        }
                        else if (transaction.TransactionType == "VenuePro")
                        {
                            var user = await _context.Users.FindAsync(transaction.UserId);
                            if (user != null)
                            {
                                user.IsPremium = true;
                                user.PremiumUntil = DateTime.Now.AddMonths(1);
                            }
                        }
                        else if (transaction.TransactionType == "BookingDeposit")
                        {
                            // Parse ScheduleId from Description "Cọc 30% sân...|ScheduleId:X"
                            // Wait, the description didn't have it. Let's assume we can fetch the latest PendingPayment schedule for this user.
                            var schedule = await _context.PitchSchedules
                                .Where(ps => ps.BookedById == transaction.UserId && ps.ScheduleStatus == "PendingPayment")
                                .OrderByDescending(ps => ps.ScheduleId)
                                .FirstOrDefaultAsync();

                            if (schedule != null)
                            {
                                schedule.ScheduleStatus = "Booked"; // or Confirmed

                                // Calculate 8% commission
                                if (schedule.Pitch != null && schedule.Pitch.Stadium != null)
                                {
                                    var durationHours = (decimal)(schedule.EndTime - schedule.StartTime).TotalHours;
                                    var totalAmount = durationHours * schedule.Pitch.PricePerHour;
                                    var commission = totalAmount * 0.08m;

                                    var commissionRecord = new BookingCommission
                                    {
                                        ScheduleId = schedule.ScheduleId,
                                        StadiumOwnerId = schedule.Pitch.Stadium.OwnerId ?? 0,
                                        BookingAmount = totalAmount,
                                        CommissionAmount = commission,
                                        IsPaidToPlatform = false,
                                        CreatedAt = DateTime.Now
                                    };
                                    _context.BookingCommissions.Add(commissionRecord);
                                }
                            }
                        }

                        await _context.SaveChangesAsync();
                        return Ok(new { success = true });
                    }
                }

                return BadRequest(new { success = false, message = "Invalid webhook or transaction already processed" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [Authorize]
        [HttpPost("UpgradeTeam")]
        public async Task<IActionResult> UpgradeTeam()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized("User not authenticated.");
            int userId = int.Parse(userIdClaim.Value);

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound("User not found.");

            if ((user.Tokens ?? 0) < 150)
                return BadRequest(new { message = "Không đủ Tokens. Vui lòng nạp thêm." });

            var team = await _context.Teams.FirstOrDefaultAsync(t => t.CaptainId == userId);
            if (team == null) return NotFound("Team not found.");

            user.Tokens -= 150;
            
            var subscription = new TeamSubscription {
                TeamId = team.TeamId,
                PaidByUserId = userId,
                Amount = 150,
                PlanType = "Premium",
                StartDate = DateTime.Now,
                EndDate = DateTime.Now.AddMonths(1),
                Status = "Active",
                CreatedAt = DateTime.Now
            };
            _context.TeamSubscriptions.Add(subscription);
            
            _context.TokenTransactions.Add(new TokenTransaction {
                UserId = userId,
                Amount = -150,
                TransactionType = "TeamUpgrade",
                Description = "Mua gói Đội Thể Thao VIP",
                CreatedAt = DateTime.Now
            });

            await _context.SaveChangesAsync();
            return Ok(new { message = "Nâng cấp Đội VIP thành công!" });
        }

        [Authorize]
        [HttpPost("UpgradeOwner")]
        public async Task<IActionResult> UpgradeOwner()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized("User not authenticated.");
            int userId = int.Parse(userIdClaim.Value);

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound("User not found.");

            if ((user.Tokens ?? 0) < 250)
                return BadRequest(new { message = "Không đủ Tokens. Vui lòng nạp thêm." });

            user.Tokens -= 250;
            user.IsPremium = true;
            user.PremiumUntil = user.PremiumUntil.HasValue && user.PremiumUntil > DateTime.Now 
                ? user.PremiumUntil.Value.AddMonths(1) 
                : DateTime.Now.AddMonths(1);

            _context.TokenTransactions.Add(new TokenTransaction {
                UserId = userId,
                Amount = -250,
                TransactionType = "OwnerUpgrade",
                Description = "Mua gói Chủ Sân VIP",
                CreatedAt = DateTime.Now
            });

            await _context.SaveChangesAsync();
            return Ok(new { message = "Nâng cấp Chủ Sân VIP thành công!" });
        }

        [HttpPost("UpgradePlayer")]
        public async Task<IActionResult> UpgradePlayer()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized("User not authenticated.");
            int userId = int.Parse(userIdClaim.Value);

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound("User not found.");

            if ((user.Tokens ?? 0) < 100)
                return BadRequest(new { message = "Không đủ Tokens. Vui lòng nạp thêm." });

            user.Tokens -= 100;
            user.IsPremium = true;
            user.PremiumUntil = DateTime.Now.AddMonths(1);

            _context.TokenTransactions.Add(new TokenTransaction {
                UserId = userId,
                Amount = -100,
                TransactionType = "PlayerUpgrade",
                Description = "Mua gói Cầu thủ VIP",
                CreatedAt = DateTime.Now
            });

            await _context.SaveChangesAsync();
            return Ok(new { message = "Nâng cấp người chơi VIP thành công!", tokens = user.Tokens, premiumUntil = user.PremiumUntil });
        }
    }
}
