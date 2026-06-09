export const publicNav = [
  { to: '/', label: 'Trang chủ' },
  { to: '/teams', label: 'Đội thể thao' },
  { to: '/stadiums', label: 'Sân thể thao' },
  { to: '/matches', label: 'Trận đấu' },
  { to: '/recruitment', label: 'Tuyển quân' },
  { to: '/operations', label: 'Vận hành' },
  { to: '/privacy', label: 'Dữ liệu' },
];

export const adminNav = [
  { to: '/admin-dashboard', label: 'Tổng quan' },
  { to: '/admin/overview', label: 'Điều hành' },
  { to: '/admin/users', label: 'Người dùng' },
  { to: '/admin/teams', label: 'Đội thể thao' },
  { to: '/admin/stadiums', label: 'Sân thể thao' },
  { to: '/admin/matches', label: 'Trận đấu' },
];

export const currentUsers = {
  public: { name: 'Khách truy cập', role: 'Cộng đồng' },
  admin: { name: 'Trần Minh Khôi', role: 'Admin Console' },
  captain: { name: 'Đặng Đức Long', role: 'Đội trưởng' },
  owner: { name: 'Nguyễn Hải Nam', role: 'Chủ sân' },
};

export const teams = [
  {
    id: 101,
    name: 'FC Riverside',
    captain: 'Đặng Đức Long',
    quality: 'Hạng A phủi',
    homeArea: 'Quận 7',
    recentForm: '3 thắng, 1 hòa, 1 thua',
    history: 'Đội đá pressing nhanh, ưu tiên biên và chuyển trạng thái.',
    members: ['Long', 'Tú', 'Phát', 'Việt', 'Khánh', 'Sơn', 'Hào'],
    lookingForOpponent: true,
  },
  {
    id: 102,
    name: 'Mekong United',
    captain: 'Lê Hoàng Phúc',
    quality: 'Hạng B+',
    homeArea: 'Thủ Đức',
    recentForm: '4 trận bất bại',
    history: 'Sở trường kiểm soát bóng và triển khai từ tuyến dưới.',
    members: ['Phúc', 'Trí', 'An', 'Huy', 'Lộc', 'Hiệp', 'Khoa'],
    lookingForOpponent: false,
  },
  {
    id: 103,
    name: 'Bình Minh FC',
    captain: 'Phạm Công Hậu',
    quality: 'Hạng B',
    homeArea: 'Tân Bình',
    recentForm: '2 thắng liên tiếp',
    history: 'Đội trẻ, tốc độ cao, thường đá sân 7 khung 19h30.',
    members: ['Hậu', 'Bảo', 'Khang', 'Nhật', 'Lâm', 'Công', 'Nam'],
    lookingForOpponent: true,
  },
  {
    id: 104,
    name: 'Sài Gòn Pressing',
    captain: 'Nguyễn Quang Vinh',
    quality: 'Hạng A-',
    homeArea: 'Gò Vấp',
    recentForm: 'Giữ sạch lưới 2 trận',
    history: 'Khối đội hình cao, thiên về tranh chấp và chuyển cánh.',
    members: ['Vinh', 'Duy', 'Mẫn', 'Toàn', 'Khôi', 'Đức', 'Sang'],
    lookingForOpponent: false,
  },
];

export const freeAgents = [
  {
    id: 201,
    fullName: 'Nguyễn Thành Đạt',
    preferredPosition: 'Thủ môn',
    activeArea: 'Quận 1 - Quận 3',
    availabilityNote: 'Rảnh tối thứ 4 và thứ 6, có găng riêng.',
    roles: ['Player'],
    level: 'Ổn định, phản xạ tốt',
  },
  {
    id: 202,
    fullName: 'Trần Bảo Khang',
    preferredPosition: 'Trung vệ',
    activeArea: 'Phú Nhuận',
    availabilityNote: 'Đá được sân 7 hoặc sân 11, ưu tiên kèo giao hữu.',
    roles: ['Player'],
    level: 'Tì đè khỏe, chuyền dài ổn',
  },
  {
    id: 203,
    fullName: 'Lê Gia Huy',
    preferredPosition: 'Tiền vệ trung tâm',
    activeArea: 'Bình Thạnh',
    availabilityNote: 'Có thể tham gia các trận đá bù gấp trong 60 phút.',
    roles: ['Player', 'Captain'],
    level: 'Thoát pressing, giữ nhịp',
  },
  {
    id: 204,
    fullName: 'Phạm Minh Quân',
    preferredPosition: 'Tiền đạo cánh',
    activeArea: 'Tân Phú',
    availabilityNote: 'Tăng tốc tốt, phù hợp sân 5 khung 18h00.',
    roles: ['Player'],
    level: 'Chạy chỗ rộng, dứt điểm 1 chạm',
  },
];

export const users = [
  {
    id: 1,
    fullName: 'Trần Minh Khôi',
    username: 'khoi.admin',
    phone: '0901 234 567',
    roles: ['Admin'],
    createdAt: '12/03/2026',
  },
  {
    id: 2,
    fullName: 'Nguyễn Hải Nam',
    username: 'nam.stadium',
    phone: '0908 998 112',
    roles: ['StadiumOwner'],
    createdAt: '18/03/2026',
  },
  {
    id: 3,
    fullName: 'Đặng Đức Long',
    username: 'long.fc',
    phone: '0917 456 123',
    roles: ['Captain'],
    createdAt: '21/03/2026',
  },
  {
    id: 4,
    fullName: 'Nguyễn Thành Đạt',
    username: 'dat.gk',
    phone: '0932 888 221',
    roles: ['Player'],
    createdAt: '24/03/2026',
  },
  {
    id: 5,
    fullName: 'Trần Bảo Khang',
    username: 'khang.cb',
    phone: '0988 333 441',
    roles: ['Player'],
    createdAt: '02/04/2026',
  },
];

export const stadiums = [
  {
    id: 301,
    name: 'Sân Sao Biển',
    ownerName: 'Nguyễn Hải Nam',
    address: '57 Nguyễn Lương Bằng, Quận 7',
    description: 'Cụm sân có mái lưới cao, bãi xe rộng và đèn LED mới.',
    utilizationLabel: '78% công suất trong tuần',
    pitches: [
      {
        id: 1,
        name: 'Sân 7A',
        size: 7,
        availabilityLabel: 'Trống 20:30 - 22:00',
        pricePerHour: 650000,
      },
      {
        id: 2,
        name: 'Sân 7B',
        size: 7,
        availabilityLabel: 'Đã kín khung vàng',
        pricePerHour: 620000,
      },
    ],
  },
  {
    id: 302,
    name: 'Arena Thủ Đức',
    ownerName: 'Mai Thanh Tùng',
    address: '188 Võ Văn Ngân, Thủ Đức',
    description: 'Nền cỏ mới, có khu thay đồ và nước uống theo đội.',
    utilizationLabel: '64% công suất trong tuần',
    pitches: [
      {
        id: 3,
        name: 'Sân 5A',
        size: 5,
        availabilityLabel: 'Trống từ 18:00',
        pricePerHour: 420000,
      },
      {
        id: 4,
        name: 'Sân 7C',
        size: 7,
        availabilityLabel: 'Còn 1 slot cuối tuần',
        pricePerHour: 700000,
      },
    ],
  },
  {
    id: 303,
    name: 'Bến Thành Pitch Hub',
    ownerName: 'Võ Thành An',
    address: '19 Trần Hưng Đạo, Quận 1',
    description: 'Sân trung tâm, phù hợp giao hữu doanh nghiệp và đá bù gấp.',
    utilizationLabel: '83% công suất trong tuần',
    pitches: [
      {
        id: 5,
        name: 'Sân 5 Prime',
        size: 5,
        availabilityLabel: 'Trống 17:30 thứ 5',
        pricePerHour: 480000,
      },
      {
        id: 6,
        name: 'Sân 7 Prime',
        size: 7,
        availabilityLabel: 'Có thể ghép kèo cuối tuần',
        pricePerHour: 760000,
      },
    ],
  },
];

export const pitchCatalog = stadiums.flatMap((stadium) =>
  stadium.pitches.map((pitch) => ({
    ...pitch,
    stadiumId: stadium.id,
    stadiumName: stadium.name,
    ownerName: stadium.ownerName,
    address: stadium.address,
    description: stadium.description,
    utilizationLabel: stadium.utilizationLabel,
  })),
);

export const matches = [
  {
    id: 401,
    homeTeamName: 'FC Riverside',
    awayTeamName: 'Mekong United',
    matchStatus: 'Accepted',
    kickoffLabel: '19:30 · Thứ sáu, 03/05',
    venueLabel: 'Sân Sao Biển - Sân 7A',
    attendanceSummary: '14/16 người đã xác nhận',
  },
  {
    id: 402,
    homeTeamName: 'Bình Minh FC',
    awayTeamName: 'Chờ đối thủ',
    matchStatus: 'Proposed',
    kickoffLabel: '21:00 · Thứ bảy, 04/05',
    venueLabel: 'Arena Thủ Đức - Sân 7C',
    attendanceSummary: 'Đang thiếu 1 thủ môn và 1 pivot',
  },
  {
    id: 403,
    homeTeamName: 'Sài Gòn Pressing',
    awayTeamName: 'FC Riverside',
    matchStatus: 'Completed',
    kickoffLabel: '19:00 · Thứ ba, 29/04',
    venueLabel: 'Bến Thành Pitch Hub - Sân 7 Prime',
    attendanceSummary: 'Đã chốt biên bản và tỷ số 4-3',
  },
];

export const recruitmentAds = [
  {
    id: 501,
    title: 'FC Riverside cần thủ môn cho kèo tối thứ sáu',
    content: 'Ưu tiên keeper phản xạ tốt, có thể giao tiếp hàng thủ và bắt bóng bổng ổn.',
    teamName: 'FC Riverside',
    positionNeeded: 'Thủ môn',
    urgencyLabel: 'Khẩn trong 24 giờ',
    matchLabel: 'Kèo giao hữu sân 7',
  },
  {
    id: 502,
    title: 'Bình Minh FC tìm pivot đá bù cuối tuần',
    content: 'Cần cầu thủ xoay sở hẹp tốt, biết lùi nhận bóng và dứt điểm nhanh.',
    teamName: 'Bình Minh FC',
    positionNeeded: 'Pivot',
    urgencyLabel: 'Ưu tiên tối thứ bảy',
    matchLabel: 'Đá bù giải nội bộ',
  },
  {
    id: 503,
    title: 'Mekong United bổ sung trung vệ cho chuỗi giải tháng 5',
    content: 'Đội cần trung vệ có nhịp phòng ngự tốt, đọc tình huống và hỗ trợ build-up.',
    teamName: 'Mekong United',
    positionNeeded: 'Trung vệ',
    urgencyLabel: 'Cần trong tuần này',
    matchLabel: 'Giải doanh nghiệp',
  },
];

export const upcomingSchedules = [
  {
    id: 601,
    pitchName: 'Sân 7A',
    windowLabel: '19:30 - 21:00 · 03/05',
    bookedByName: 'FC Riverside',
    typeLabel: 'Đặt lẻ',
    status: 'Đã xác nhận',
  },
  {
    id: 602,
    pitchName: 'Sân 5 Prime',
    windowLabel: '17:30 - 18:30 · 05/05',
    bookedByName: 'Tập thể Luật K44',
    typeLabel: 'Đặt lẻ',
    status: 'Chờ thanh toán',
  },
  {
    id: 603,
    pitchName: 'Sân 7C',
    windowLabel: '21:00 - 22:30 · 06/05',
    bookedByName: 'Bình Minh FC',
    typeLabel: 'Giữ chỗ đá bù',
    status: 'Giữ slot mềm',
  },
];

export const recurringBookings = [
  {
    id: 701,
    teamName: 'Mekong United',
    pitchName: 'Sân 7B',
    weeklySlot: 'Thứ tư · 20:00 - 21:30',
    dateRange: '01/05 - 31/07/2026',
    isApproved: true,
  },
  {
    id: 702,
    teamName: 'Sài Gòn Pressing',
    pitchName: 'Sân 5A',
    weeklySlot: 'Chủ nhật · 08:00 - 09:30',
    dateRange: '05/05 - 04/08/2026',
    isApproved: false,
  },
];

export const notifications = [
  {
    id: 801,
    title: 'Slot sân giờ vàng gần kín',
    recipientName: 'Chủ sân Sao Biển',
    message: 'Khung 19:00 - 21:00 đã chạm 92% công suất tuần này.',
  },
  {
    id: 802,
    title: 'Tin tuyển quân cần duyệt',
    recipientName: 'Admin Console',
    message: 'Có 3 bài đăng mới chứa yêu cầu đá bù gấp trong 24 giờ.',
  },
  {
    id: 803,
    title: 'Người dùng mới cần gán vai trò',
    recipientName: 'Trần Minh Khôi',
    message: '2 tài khoản mới chưa được map đầy đủ sang role vận hành.',
  },
];

export const actorCapabilities = [
  {
    actorName: 'Cầu thủ',
    summary: 'Tìm đội, bật trạng thái rảnh và nhận thông báo khi đội thiếu người.',
    capabilities: [
      'Cập nhật vị trí sở trường và khu vực hoạt động',
      'Nhận lời mời đá bù trực tiếp từ đội trưởng',
      'Theo dõi lịch sân đã xác nhận theo từng trận',
    ],
  },
  {
    actorName: 'Đội trưởng',
    summary: 'Quản lý danh sách thành viên, ghép đối và đăng tin tuyển quân.',
    capabilities: [
      'Gửi kèo giao hữu theo khung giờ trống thực tế',
      'Theo dõi trạng thái xác nhận của từng thành viên',
      'Tạo bài đăng tuyển người theo vị trí và mức độ gấp',
    ],
  },
  {
    actorName: 'Chủ sân',
    summary: 'Duyệt lịch, quản lý sân con, doanh thu và booking lặp tuần.',
    capabilities: [
      'Xem công suất theo cụm sân và từng khung giờ',
      'Chốt hợp đồng đặt sân cố định hàng tuần',
      'Ưu tiên phân bổ slot cho các đội lịch sử tốt',
    ],
  },
  {
    actorName: 'Quản trị viên',
    summary: 'Giám sát người dùng, nội dung và sự cân bằng vận hành toàn hệ thống.',
    capabilities: [
      'Theo dõi tăng trưởng người dùng và chất lượng dữ liệu',
      'Duyệt nhanh bài tuyển quân và báo cáo xung đột lịch',
      'Kiểm tra tình trạng phân quyền và sức khỏe toàn nền tảng',
    ],
  },
];

export const databaseSchema = [
  {
    name: 'users',
    purpose: 'Lưu tài khoản, định danh và trạng thái tham gia hệ thống.',
    fields: ['user_id', 'full_name', 'username', 'phone', 'created_at'],
  },
  {
    name: 'roles',
    purpose: 'Phân vai trò Player, Captain, StadiumOwner và Admin cho từng user.',
    fields: ['role_id', 'user_id', 'role_name', 'granted_at'],
  },
  {
    name: 'teams',
    purpose: 'Đại diện đội thể thao, đội trưởng, khu vực hoạt động và chất lượng đội.',
    fields: ['team_id', 'team_name', 'captain_id', 'home_area', 'quality_level'],
  },
  {
    name: 'stadiums',
    purpose: 'Lưu cụm sân, chủ sân, mô tả, địa chỉ và các sân con đi kèm.',
    fields: ['stadium_id', 'owner_id', 'stadium_name', 'address', 'description'],
  },
  {
    name: 'matches',
    purpose: 'Ghi nhận các kèo đấu, trạng thái ghép đối và thông tin sân thi đấu.',
    fields: ['match_id', 'home_team_id', 'away_team_id', 'status', 'kickoff_at'],
  },
  {
    name: 'recruitment_ads',
    purpose: 'Bài đăng tuyển quân hoặc tìm người đá bù theo vị trí cụ thể.',
    fields: ['ad_id', 'team_id', 'title', 'position_needed', 'urgency'],
  },
];

export const publicMetrics = [
  { label: 'Đội đang hoạt động', value: teams.length, note: 'Đang có lịch hoặc tìm kèo tuần này' },
  { label: 'Sân đang khai thác', value: pitchCatalog.length, note: 'Slot hiển thị theo tình trạng thật' },
  { label: 'Kèo sắp diễn ra', value: matches.length, note: 'Bao gồm giao hữu và đá bù đã lên lịch' },
  { label: 'Cầu thủ tự do', value: freeAgents.length, note: 'Có thể liên hệ trong ngày' },
];

export const adminMetrics = [
  { label: 'Người dùng', value: users.length, note: 'Tài khoản đã xác minh' },
  { label: 'Đội thể thao', value: teams.length, note: 'Đội có captain rõ ràng' },
  { label: 'Cụm sân', value: stadiums.length, note: `${pitchCatalog.length} sân con đang mở` },
  { label: 'Tin tuyển quân', value: recruitmentAds.length, note: 'Bài đăng còn hiệu lực' },
];

export const ownerMetrics = [
  { label: 'Cụm sân', value: stadiums.length, note: 'Đang hoạt động bình thường' },
  { label: 'Sân con', value: pitchCatalog.length, note: 'Phân bổ khung giờ tự động' },
  { label: 'Lịch sắp tới', value: upcomingSchedules.length, note: 'Bao gồm slot chờ xác nhận' },
  { label: 'Hợp đồng tuần', value: recurringBookings.length, note: 'Đặt sân cố định theo mùa' },
];

export const captainMetrics = [
  { label: 'Đội quản lý', value: teams.filter((team) => team.captain).length, note: 'Có đủ đội hình ra sân' },
  { label: 'Kèo đấu', value: matches.length, note: 'Đã ghép hoặc đang chờ đối' },
  { label: 'Tin tuyển quân', value: recruitmentAds.length, note: 'Đang mở ứng tuyển' },
  { label: 'Cầu thủ tự do', value: freeAgents.length, note: 'Có thể gọi bổ sung ngay' },
];

export const adminShortcuts = [
  {
    title: 'Quản lý người dùng',
    description: 'Gán vai trò, theo dõi tài khoản mới và kiểm tra trạng thái xác minh.',
    to: '/admin/users',
  },
  {
    title: 'Quản lý đội thể thao',
    description: 'Xem chất lượng đội, captain phụ trách và tình trạng tìm đối thủ.',
    to: '/admin/teams',
  },
  {
    title: 'Quản lý sân thể thao',
    description: 'Theo dõi công suất, giá sân và booking lặp theo từng cụm.',
    to: '/admin/stadiums',
  },
  {
    title: 'Quản lý trận đấu',
    description: 'Kiểm tra lịch thi đấu, tình trạng ghép kèo và sân đã chốt.',
    to: '/admin/matches',
  },
];

export const releaseChecklist = [
  'Đảm bảo mọi page dùng JSX hợp lệ, không còn Razor token.',
  'Tất cả link điều hướng dùng route phía client thay cho asp-controller.',
  'Form demo hiển thị đúng cấu trúc để nối API thật ở bước sau.',
  'Dashboard sử dụng dữ liệu mẫu thống nhất để dễ thay bằng backend thật.',
];

export const sampleSelections = {
  primaryUser: users[2],
  primaryTeam: teams[0],
  primaryStadium: stadiums[0],
  primaryMatch: matches[0],
};
