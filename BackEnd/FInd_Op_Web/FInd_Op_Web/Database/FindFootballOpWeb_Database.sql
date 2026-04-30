CREATE DATABASE FindFootballOppositeWeb
USE FindFootballOppositeWeb
-- =============================================
-- 1. TÀI KHOẢN & VAI TRÒ
-- =============================================
CREATE TABLE Roles (
    RoleID INT IDENTITY(1,1) PRIMARY KEY,
    RoleName NVARCHAR(50) UNIQUE NOT NULL 
);

CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(100) UNIQUE NOT NULL,
    PasswordHash NVARCHAR(255) NOT NULL,
    FullName NVARCHAR(100) NOT NULL,
    Phone NVARCHAR(20),
    IsFreeAgent BIT DEFAULT 0, -- Cầu thủ rảnh hay không (Dành cho chức năng tìm đội đá thuê)
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Bảng trung gian (N-N): 1 User có thể có nhiều Role (Vừa làm Chủ sân, vừa làm Cầu thủ)
CREATE TABLE UserRoles (
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    RoleID INT FOREIGN KEY REFERENCES Roles(RoleID),
    PRIMARY KEY (UserID, RoleID)
);

-- =============================================
-- 2. ĐỘI BÓNG & THÀNH VIÊN
-- =============================================
CREATE TABLE Teams (
    TeamID INT IDENTITY(1,1) PRIMARY KEY,
    TeamName NVARCHAR(100) NOT NULL,
    CaptainID INT FOREIGN KEY REFERENCES Users(UserID), -- Đội trưởng chính
    QualityLevel NVARCHAR(50), -- Gà, Trung bình, Khá...
    History NVARCHAR(MAX),
    IsDisbanded BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Bảng trung gian (N-N): 1 Cầu thủ có thể tham gia nhiều Đội, 1 Đội có nhiều Cầu thủ
CREATE TABLE TeamMembers (
    TeamID INT FOREIGN KEY REFERENCES Teams(TeamID),
    PlayerID INT FOREIGN KEY REFERENCES Users(UserID),
    RoleInTeam NVARCHAR(50) DEFAULT 'Member', -- 'Member', 'Vice-Captain'
    Status NVARCHAR(50) DEFAULT 'Active',     -- 'Pending', 'Active', 'Left'
    JoinedDate DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (TeamID, PlayerID) 
);

-- =============================================
-- 3. QUẢN LÝ SÂN BÓNG & BÁO GIÁ
-- =============================================
CREATE TABLE Stadiums (
    StadiumID INT IDENTITY(1,1) PRIMARY KEY,
    OwnerID INT FOREIGN KEY REFERENCES Users(UserID),
    StadiumName NVARCHAR(100) NOT NULL,
    Address NVARCHAR(255),
    Description NVARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE Pitches (
    PitchID INT IDENTITY(1,1) PRIMARY KEY,
    StadiumID INT FOREIGN KEY REFERENCES Stadiums(StadiumID),
    PitchName NVARCHAR(50),
    PitchSize INT, -- Kích thước sân: 5, 7, 11
    PricePerHour DECIMAL(18,2) NOT NULL,
    IsActive BIT DEFAULT 1
);

-- =============================================
-- 4. QUẢN LÝ ĐẶT LỊCH (CỐ ĐỊNH & LẺ)
-- =============================================
-- Bảng lưu quy tắc đặt lịch cố định (VD: Thứ 3 hàng tuần từ 19h-20h30)
CREATE TABLE RecurringBookings (
    RecurringID INT IDENTITY(1,1) PRIMARY KEY,
    PitchID INT FOREIGN KEY REFERENCES Pitches(PitchID),
    TeamID INT FOREIGN KEY REFERENCES Teams(TeamID),
    DayOfWeek INT NOT NULL, -- 0 (Chủ nhật) đến 6 (Thứ 7)
    StartTime TIME NOT NULL,
    EndTime TIME NOT NULL,
    FromDate DATE NOT NULL, -- Bắt đầu áp dụng từ ngày nào
    ToDate DATE NOT NULL,   -- Kết thúc áp dụng vào ngày nào
    IsApproved BIT DEFAULT 0
);

-- Bảng lưu lịch cụ thể của từng ngày trên sân (dùng để kiểm tra sân trống)
CREATE TABLE PitchSchedules (
    ScheduleID INT IDENTITY(1,1) PRIMARY KEY,
    PitchID INT FOREIGN KEY REFERENCES Pitches(PitchID),
    BookedByID INT FOREIGN KEY REFERENCES Users(UserID),
    RecurringID INT NULL FOREIGN KEY REFERENCES RecurringBookings(RecurringID), -- Bỏ trống nếu là đặt lịch lẻ
    StartTime DATETIME NOT NULL,
    EndTime DATETIME NOT NULL,
    ScheduleStatus NVARCHAR(50) DEFAULT 'Confirmed' -- Confirmed, Cancelled
);

-- =============================================
-- 5. GHÉP KÈO (GẠ ĐỘI), ĐIỂM DANH & TUYỂN QUÂN
-- =============================================
CREATE TABLE Matches (
    MatchID INT IDENTITY(1,1) PRIMARY KEY,
    HomeTeamID INT FOREIGN KEY REFERENCES Teams(TeamID),
    AwayTeamID INT FOREIGN KEY REFERENCES Teams(TeamID),
    ScheduleID INT NULL FOREIGN KEY REFERENCES PitchSchedules(ScheduleID), -- Có thể chốt kèo xong mới đặt sân
    MatchStatus NVARCHAR(50), -- Proposed (Mới gạ), Accepted, Rejected, CancelPending, Cancelled, Completed
    
    -- Xử lý luồng hủy kèo giữa 2 đội
    CancelRequestedBy INT NULL FOREIGN KEY REFERENCES Teams(TeamID),
    CancelReason NVARCHAR(MAX) NULL
);

-- Điểm danh trước trận (Poll) để xem ai đi đá
CREATE TABLE MatchPolls (
    MatchID INT FOREIGN KEY REFERENCES Matches(MatchID),
    PlayerID INT FOREIGN KEY REFERENCES Users(UserID),
    IsAttending BIT NULL, -- 1: Tham gia, 0: Nghỉ, NULL: Chưa chọn
    PRIMARY KEY (MatchID, PlayerID)
);

-- Bảng tin tuyển quân (Tuyển thành viên hoặc tuyển người đá bù 1 trận)
CREATE TABLE RecruitmentAds (
    AdID INT IDENTITY(1,1) PRIMARY KEY,
    TeamID INT FOREIGN KEY REFERENCES Teams(TeamID),
    MatchID INT NULL FOREIGN KEY REFERENCES Matches(MatchID), -- Nếu tuyển đá bù cho trận cụ thể
    Title NVARCHAR(255) NOT NULL,
    Content NVARCHAR(MAX) NOT NULL,
    PositionNeeded NVARCHAR(100), -- Thủ môn, Hậu vệ...
    CreatedAt DATETIME DEFAULT GETDATE(),
    IsActive BIT DEFAULT 1
);

-- =============================================
-- 6. TIỆN ÍCH (THÔNG BÁO & LƯU TRỮ FILE ĐA PHƯƠNG TIỆN)
-- =============================================
CREATE TABLE Notifications (
    NotificationID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    Title NVARCHAR(200) NOT NULL,
    Message NVARCHAR(MAX) NOT NULL,
    RelatedLink NVARCHAR(255), -- Link điều hướng (VD: Nhảy thẳng vào chi tiết trận đấu)
    IsRead BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Bảng lưu trữ linh hoạt mọi loại file ảnh (Avatar, Logo đội, Ảnh sân)
CREATE TABLE MediaFiles (
    MediaID INT IDENTITY(1,1) PRIMARY KEY,
    EntityType NVARCHAR(50) NOT NULL, -- Cờ phân loại: 'User', 'Team', 'Stadium', 'Pitch'
    EntityID INT NOT NULL,            -- ID tương ứng với EntityType
    FilePath NVARCHAR(MAX) NOT NULL,  -- Đường dẫn lưu file
    IsPrimary BIT DEFAULT 0,          -- 1 = Ảnh đại diện chính, 0 = Ảnh phụ trong album
    UploadedAt DATETIME DEFAULT GETDATE()
);

-- =============================================
-- 1. THÊM DỮ LIỆU ROLES (VAI TRÒ)
-- =============================================
INSERT INTO Roles (RoleName) VALUES 
('Admin'), 
('StadiumOwner'), 
('Captain'), 
('Player'), 
('Guest');

-- =============================================
-- 2. THÊM DỮ LIỆU USERS (TÀI KHOẢN)
-- Lưu ý: Cột PasswordHash ở đây chỉ là chuỗi giả định.
-- =============================================
INSERT INTO Users (Username, PasswordHash, FullName, Phone, IsFreeAgent) VALUES 
('admin_system', 'hash_123', N'Quản Trị Viên', '0900000000', 0),
('chusan_caugiay', 'hash_123', N'Trần Chủ Sân', '0911111111', 0),
('hieu_dev', 'hash_123', N'Hiếu', '0922222222', 0),
('vanhau_vh5', 'hash_123', N'Đoàn Văn Hậu', '0933333333', 0),
('quanghai_19', 'hash_123', N'Nguyễn Quang Hải', '0944444444', 1); -- Cầu thủ tự do

-- =============================================
-- 3. THÊM DỮ LIỆU USER ROLES (PHÂN QUYỀN N-N)
-- =============================================
INSERT INTO UserRoles (UserID, RoleID) VALUES 
(1, 1), -- Admin
(2, 2), -- Trần Chủ Sân (StadiumOwner)
(3, 3), (3, 4), -- Hiếu: Vừa là Captain vừa là Player
(4, 3), (4, 4), -- Văn Hậu: Vừa là Captain vừa là Player
(5, 4); -- Quang Hải: Chỉ là Player

-- =============================================
-- 4. THÊM DỮ LIỆU TEAMS (ĐỘI BÓNG)
-- =============================================
INSERT INTO Teams (TeamName, CaptainID, QualityLevel, History) VALUES 
(N'FC Lập Trình', 3, N'Khá', N'Đội bóng anh em IT giao lưu cuối tuần'),
(N'FC Kiến Trúc', 4, N'Trung bình', N'Đội bóng sinh viên');

-- =============================================
-- 5. THÊM DỮ LIỆU TEAM MEMBERS (THÀNH VIÊN ĐỘI BÓNG)
-- =============================================
INSERT INTO TeamMembers (TeamID, PlayerID, RoleInTeam, Status) VALUES 
(1, 3, 'Captain', 'Active'), -- Hiếu là Đội trưởng FC Lập Trình
(1, 5, 'Member', 'Active'),  -- Quang Hải đá cho FC Lập Trình
(2, 4, 'Captain', 'Active'); -- Văn Hậu là Đội trưởng FC Kiến Trúc

-- =============================================
-- 6. THÊM DỮ LIỆU STADIUMS & PITCHES (SÂN BÓNG)
-- =============================================
INSERT INTO Stadiums (OwnerID, StadiumName, Address, Description) VALUES 
(2, N'Cụm Sân Chuyên Việt', N'Cầu Giấy, Hà Nội', N'Sân cỏ nhân tạo mới thay mặt cỏ 2026');

INSERT INTO Pitches (StadiumID, PitchName, PitchSize, PricePerHour) VALUES 
(1, N'Sân 1A', 7, 500000.00),
(1, N'Sân 1B', 7, 500000.00),
(1, N'Sân 2 (Sân lớn)', 11, 1200000.00);

-- =============================================
-- 7. THÊM DỮ LIỆU ĐẶT LỊCH (RECURRING & SCHEDULES)
-- =============================================
-- FC Lập Trình đặt cố định Sân 1A vào thứ 3 (DayOfWeek = 2)
INSERT INTO RecurringBookings (PitchID, TeamID, DayOfWeek, StartTime, EndTime, FromDate, ToDate, IsApproved) VALUES 
(1, 1, 2, '19:00', '20:30', '2026-05-01', '2026-08-01', 1);

-- Một lịch sân cụ thể đã được hệ thống sinh ra hoặc ai đó đặt lẻ
INSERT INTO PitchSchedules (PitchID, BookedByID, StartTime, EndTime, ScheduleStatus) VALUES 
(1, 3, '2026-04-28 19:00:00', '2026-04-28 20:30:00', 'Confirmed');

-- =============================================
-- 8. THÊM DỮ LIỆU MATCHES & MATCH POLLS (GẠ KÈO & ĐIỂM DANH)
-- =============================================
-- FC Lập Trình đã gạ kèo thành công FC Kiến Trúc trên khung giờ có sẵn
INSERT INTO Matches (HomeTeamID, AwayTeamID, ScheduleID, MatchStatus) VALUES 
(1, 2, 1, 'Accepted');

-- Các cầu thủ vote điểm danh xem mai có đi đá không
INSERT INTO MatchPolls (MatchID, PlayerID, IsAttending) VALUES 
(1, 3, 1), -- Hiếu: Có mặt
(1, 5, 0); -- Hải: Xin nghỉ

-- =============================================
-- 9. THÊM DỮ LIỆU RECRUITMENT ADS (TUYỂN QUÂN)
-- =============================================
-- Do Hải xin nghỉ, FC Lập Trình đăng tin tuyển người đá trận ngày mai
INSERT INTO RecruitmentAds (TeamID, MatchID, Title, Content, PositionNeeded) VALUES 
(1, 1, N'Cần 1 tiền vệ đá tối mai', N'Đội bị rụng 1 thành viên giờ chót, cần anh em gánh tuyến giữa.', N'Tiền vệ');

-- =============================================
-- 10. THÊM DỮ LIỆU NOTIFICATIONS & MEDIA FILES (TIỆN ÍCH)
-- =============================================
INSERT INTO Notifications (UserID, Title, Message, RelatedLink) VALUES 
(4, N'Chốt kèo thành công', N'FC Lập Trình đã xác nhận kèo đấu với đội của bạn!', N'/matches/detail/1');

INSERT INTO MediaFiles (EntityType, EntityID, FilePath, IsPrimary) VALUES 
('Team', 1, '/uploads/teams/fclaptrinh_logo.png', 1),
('Stadium', 1, '/uploads/stadiums/chuyen_viet_1.jpg', 1);