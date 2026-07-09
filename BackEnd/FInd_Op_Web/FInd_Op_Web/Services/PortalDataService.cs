using FInd_Op_Web.Models;

namespace FInd_Op_Web.Services;

public sealed class PortalDataService
{
    public PortalHubViewModel BuildPortal()
    {
        var players = new List<PlayerCardViewModel>
        {
            new()
            {
                UserId = 1,
                FullName = "Quản Trị Viên",
                Username = "admin_system",
                PreferredPosition = "Điều hành",
                ActiveArea = "Toàn hệ thống",
                AvailabilityNote = "Giám sát vận hành và nội dung",
                TeamName = "Ban điều phối",
                IsFreeAgent = false,
                Roles = new[] { "Admin" }
            },
            new()
            {
                UserId = 2,
                FullName = "Trần Chủ Sân",
                Username = "chusan_caugiay",
                PreferredPosition = "Chủ sân",
                ActiveArea = "Cầu Giấy, Hà Nội",
                AvailabilityNote = "Duyệt lịch lẻ và lịch cố định",
                TeamName = "Cụm Sân Chuyên Việt",
                IsFreeAgent = false,
                Roles = new[] { "StadiumOwner" }
            },
            new()
            {
                UserId = 3,
                FullName = "Hiếu",
                Username = "hieu_dev",
                PreferredPosition = "Tiền vệ trung tâm",
                ActiveArea = "Cầu Giấy, Nam Từ Liêm",
                AvailabilityNote = "Sẵn sàng gặp đội tối thứ 3 tới",
                TeamName = "FC Lập Trình",
                IsFreeAgent = false,
                Roles = new[] { "Captain", "Player" }
            },
            new()
            {
                UserId = 4,
                FullName = "Đoàn Văn Hậu",
                Username = "vanhau_vh5",
                PreferredPosition = "Hậu vệ cánh",
                ActiveArea = "Hà Đông, Cầu Giấy",
                AvailabilityNote = "Theo dõi kèo giao hữu và lịch thi đấu",
                TeamName = "FC Kiến Trúc",
                IsFreeAgent = false,
                Roles = new[] { "Captain", "Player" }
            },
            new()
            {
                UserId = 5,
                FullName = "Nguyễn Quang Hải",
                Username = "quanghai_19",
                PreferredPosition = "Tiền vệ",
                ActiveArea = "Thanh Xuân, Cầu Giấy",
                AvailabilityNote = "Đang bật trạng thái tự do cho trận tối mai",
                TeamName = "FC Lập Trình",
                IsFreeAgent = true,
                Roles = new[] { "Player" }
            }
        };

        var teams = new List<TeamCardViewModel>
        {
            new()
            {
                TeamId = 1,
                TeamName = "FC Lập Trình",
                CaptainName = "Hiếu",
                QualityLevel = "Khá",
                History = "Đội bóng anh em IT giao lưu cuối tuần, ưu tiên kèo đẹp và đúng giờ.",
                HomeArea = "Cầu Giấy",  // Actually HomeArea in display context
                RecentForm = "3 trận gần nhất: Thắng 2, Hoà 1",
                LookingForOpponent = true,
                Members = new[] { "Hiếu", "Nguyễn Quang Hải", "Đang mở tuyển thêm 1 tiền vệ" }
            },
            new()
            {
                TeamId = 2,
                TeamName = "FC Kiến Trúc",
                CaptainName = "Đoàn Văn Hậu",
                QualityLevel = "Trung bình",
                History = "Đội bóng sinh viên, thích kèo 7 người và sân cỏ mới.",
                HomeArea = "Hà Đông",  // Actually HomeArea in display context
                RecentForm = "3 trận gần nhất: Thắng 1, Thua 2",
                LookingForOpponent = false,
                Members = new[] { "Đoàn Văn Hậu", "Đang duyệt 2 yêu cầu gia nhập" }
            }
        };

        var stadiums = new List<StadiumCardViewModel>
        {
            new()
            {
                StadiumId = 1,
                StadiumName = "Cụm Sân Chuyên Việt",
                OwnerName = "Trần Chủ Sân",
                Address = "Cầu Giấy, Hà Nội",
                Description = "Sân cỏ nhân tạo mới thay mặt cỏ 2026, phù hợp kèo 7 và 11 người.",
                UtilizationLabel = "Công suất tuần này: 78%",
                Pitches = new[]
                {
                    new PitchCardViewModel
                    {
                        PitchId = 1,
                        PitchName = "Sân 1A",
                        PitchSize = 7,
                        PricePerSlot = 500000,
                        AvailabilityLabel = "Trống: Thứ 4, 20:30 - 22:00"
                    },
                    new PitchCardViewModel
                    {
                        PitchId = 2,
                        PitchName = "Sân 1B",
                        PitchSize = 7,
                        PricePerSlot = 500000,
                        AvailabilityLabel = "Trống: Thứ 5, 19:00 - 20:30"
                    },
                    new PitchCardViewModel
                    {
                        PitchId = 3,
                        PitchName = "Sân 2 (Sân lớn)",
                        PitchSize = 11,
                        PricePerSlot = 1200000,
                        AvailabilityLabel = "Trống: Chủ nhật, 16:00 - 18:00"
                    }
                }
            }
        };

        var recurringBookings = new List<RecurringBookingCardViewModel>
        {
            new()
            {
                TeamName = "FC Lập Trình",
                PitchName = "Sân 1A",
                WeeklySlot = "Thứ 3, 19:00 - 20:30",
                DateRange = "01/05/2026 - 01/08/2026",
                IsApproved = true
            }
        };

        var schedules = new List<ScheduleCardViewModel>
        {
            new()
            {
                PitchName = "Sân 1A",
                BookedByName = "Hiếu / FC Lập Trình",
                WindowLabel = "28/04/2026, 19:00 - 20:30",
                TypeLabel = "Đặt lẻ",
                Status = "Đã xác nhận"
            },
            new()
            {
                PitchName = "Sân 1B",
                BookedByName = "Trần Chủ Sân",
                WindowLabel = "29/04/2026, 20:30 - 22:00",
                TypeLabel = "Slot trống",
                Status = "Đang mở"
            }
        };

        var matches = new List<MatchCardViewModel>
        {
            new()
            {
                MatchId = 1,
                HomeTeamName = "FC Lập Trình",
                AwayTeamName = "FC Kiến Trúc",
                MatchStatus = "Đã chấp nhận",
                VenueLabel = "Sân 1A — Cụm Sân Chuyên Việt",
                KickoffLabel = "28/04/2026 lúc 19:00",
                AttendanceSummary = "2 phiếu: 1 có mặt, 1 vắng mặt, đang cần người đá bù",
                CancelFlowSummary = "Nếu huỷ kèo, đội gửi lý do và chờ đối thủ xác nhận",
                BookingSummary = "Kèo đã gắn với lịch sân đã xác nhận"
            },
            new()
            {
                MatchId = 2,
                HomeTeamName = "FC Lập Trình",
                AwayTeamName = "Đang tìm đối thủ",
                MatchStatus = "Đề xuất",
                VenueLabel = "Cần chốt sân sau khi đối thủ đồng ý",
                KickoffLabel = "Thứ 5 tuần này sau 20:30",
                AttendanceSummary = "Đội trưởng đã mở bình chọn số lượng tham gia",
                CancelFlowSummary = "Chưa phát sinh yêu cầu huỷ",
                BookingSummary = "Chờ đối thủ chấp nhận trước khi đặt sân"
            }
        };

        var recruitmentAds = new List<RecruitmentAdCardViewModel>
        {
            new()
            {
                AdId = 1,
                TeamName = "FC Lập Trình",
                Title = "Cần 1 tiền vệ đá tối mai",
                Content = "Đội bị rớt 1 thành viên giờ chót, ưu tiên người đá khu Cầu Giấy và có thể đến sớm 15 phút.",
                PositionNeeded = "Tiền vệ",
                MatchLabel = "Cho trận FC Lập Trình vs FC Kiến Trúc",
                UrgencyLabel = "Gấp trong 24 giờ"
            },
            new()
            {
                AdId = 2,
                TeamName = "FC Kiến Trúc",
                Title = "Tuyển thêm thành viên chính thức",
                Content = "Mở rộng đội hình cho lịch cố định tối thứ 3, cần cầu thủ kỷ luật và tham gia đều.",
                PositionNeeded = "Hậu vệ / Tiền đạo",
                MatchLabel = "Gia nhập đội lâu dài",
                UrgencyLabel = "Đang mở tuyển"
            }
        };

        var notifications = new List<NotificationCardViewModel>
        {
            new()
            {
                RecipientName = "Đoàn Văn Hậu",
                Title = "Chốt kèo thành công",
                Message = "FC Lập Trình đã xác nhận kèo đấu và slot sân đã được khoá.",
                RelatedLink = "/Home/Matches"
            },
            new()
            {
                RecipientName = "Hiếu",
                Title = "Cần bù người cho trận tối nay",
                Message = "Bình chọn cho thấy 1 thành viên vắng. Bài tuyển quân đang được đẩy lên trang đầu.",
                RelatedLink = "/Home/Recruitment"
            }
        };

        var actorCapabilities = new List<ActorCapabilityViewModel>
        {
            new()
            {
                ActorName = "Khách",
                Summary = "Khách vãng lai xem sân, đội bóng, giá và lịch sử thi đấu trước khi đăng ký.",
                Capabilities = new[]
                {
                    "Đăng ký và đăng nhập để tham gia hệ thống",
                    "Xem danh sách sân, báo giá từng sân con và khung giờ trống",
                    "Xem đội bóng, thành viên, trình độ và lịch sử thi đấu"
                }
            },
            new()
            {
                ActorName = "Cầu thủ",
                Summary = "Cầu thủ quản lý hồ sơ, tìm đội và bật trạng thái tự do để được gọi đá bù.",
                Capabilities = new[]
                {
                    "Cập nhật vị trí sở trường và khu vực hoạt động",
                    "Tìm đội, gửi yêu cầu gia nhập hoặc nhắn tin cho đội trưởng",
                    "Bật trạng thái \"Đang rảnh\" để đội trưởng thiếu người tìm thấy",
                    "Theo dõi lịch thi đấu của các đội mình tham gia"
                }
            },
            new()
            {
                ActorName = "Đội trưởng",
                Summary = "Trưởng đội điều phối kèo đấu, lịch sân, đội hình và điểm danh trước trận.",
                Capabilities = new[]
                {
                    "Đăng ký đội, duyệt thành viên, giải tán đội khi cần",
                    "Đăng tin tìm đối thủ hoặc gửi lời mời thách đấu",
                    "Đặt sân lẻ, đặt lịch cố định và quản lý huỷ kèo có lý do",
                    "Tuyển thành viên chính thức hoặc cầu thủ đá bù theo trận",
                    "Tạo bình chọn điểm danh và theo dõi trạng thái tham gia"
                }
            },
            new()
            {
                ActorName = "Chủ sân",
                Summary = "Chủ sân quản lý cụm sân, giá từng sân con và phê duyệt booking từ đội trưởng.",
                Capabilities = new[]
                {
                    "Đăng ký cụm sân, số lượng sân con và kích thước 5 / 7 / 11",
                    "Thiết lập đơn giá riêng theo từng sân",
                    "Duyệt đặt lẻ, đặt cố định và theo dõi mật độ sử dụng",
                    "Điều chỉnh vận hành offline dựa trên báo cáo khai thác"
                }
            },
            new()
            {
                ActorName = "Quản trị viên",
                Summary = "Quản trị viên giám sát toàn bộ người dùng, đội bóng, sân bóng và nội dung vi phạm.",
                Capabilities = new[]
                {
                    "Quản lý tài khoản và phân quyền đa vai trò",
                    "Kiểm soát đội bóng, sân bóng và các bài đăng gà đối / tuyển quân",
                    "Theo dõi thông báo và xử lý nội dung vi phạm"
                }
            }
        };

        return new PortalHubViewModel
        {
            SeasonLabel = "MVP dựa theo schema FindFootballOppositeWeb",
            Metrics = new PortalMetricsViewModel
            {
                TeamCount = teams.Count,
                PlayerCount = players.Count,
                FreeAgentCount = players.Count(player => player.IsFreeAgent),
                StadiumCount = stadiums.Count,
                PitchCount = stadiums.SelectMany(stadium => stadium.Pitches).Count(),
                UpcomingMatchCount = matches.Count,
                ActiveRecruitmentCount = recruitmentAds.Count
            },
            ActorCapabilities = actorCapabilities,
            Players = players,
            Teams = teams,
            Stadiums = stadiums,
            RecurringBookings = recurringBookings,
            UpcomingSchedules = schedules,
            Matches = matches,
            RecruitmentAds = recruitmentAds,
            Notifications = notifications
        };
    }
}
