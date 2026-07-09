# 🎨 Đề Xuất Thiết Kế Lại UI/UX - FindFootballOpps

## 📊 Phân Tích Tình Trạng Hiện Tại

### ✅ Những Điểm Tốt
1. **Thiết kế hiện đại** - Sử dụng Tailwind CSS với các component đẹp mắt
2. **Dark mode** - Hỗ trợ chế độ sáng/tối
3. **Responsive design** - Mobile-friendly, hoạt động tốt trên mọi kích thước màn hình
4. **Consistent branding** - Sử dụng theme WorldCup 2026 với màu gold/teal/red
5. **Dashboard structure** - Sidebar navigation rõ ràng với tab-based content

### ⚠️ Vấn Đề Cần Cải Thiện

#### 1. **Guest Screens (Home.jsx)**
- ✅ Hero section ấn tượng nhưng:
  - Cần thêm **social proof** (testimonials, statistics)
  - **Call-to-Action** có thể rõ ràng hơn
  - Thiếu **FAQ section** cho người mới
  - Không có **quick comparison** giữa các role

#### 2. **Player Dashboard**
- **Vấn Đề**:
  - Stats section quá nhỏ, khó nhìn
  - Navigation tabs nhiều nhưng không ưu tiên
  - Thiếu **quick actions** cho các tác vụ chính
  - Layout "Team Overview" có thể cải thiện
  - Không có **visual feedback** cho các trạng thái

- **Cơn Đau**:
  - Người dùng phải click multiple lần để tìm đội
  - Không rõ nên làm gì tiếp theo sau khi đăng nhập
  - Lịch trận tiếp theo không nổi bật

#### 3. **Captain Dashboard**
- **Vấn Đề**:
  - Layout stats tương tự Player nhưng cần **more visual distinction**
  - Team management complexity không được highlight
  - Thiếu **team performance analytics**
  - Members list quá basic
  - Không có **quick tournament management**

- **Cơn Đau**:
  - Captain cần nhanh chóng nhìn thấy tình trạng đội
  - Khó quản lý multiple tasks cùng một lúc

#### 4. **Stadium Owner Dashboard**
- **Vấn Đề**:
  - Quyền hạn ít nhất so với các role khác
  - Dashboard không đủ **revenue insights**
  - Booking management không visual
  - Thiếu **calendar view** tốt cho lịch sân

---

## 🎯 Đề Xuất Thiết Kế Lại

### Phần I: GUEST SCREENS (Landing & Public Pages)

#### 1. Home Page - Cải Tiến
```
[HERO SECTION] - Giữ nguyên nhưng tối ưu:
├─ Headline + Subheadline (OK)
├─ CTA Buttons (OK)
└─ Hero Image (Cần tối ưu mobile)

[FEATURES SECTION] - Giữ nguyên (Tốt)

[QUICK ACCESS - Cần Cải Tiến]
├─ Thêm 2 cột mới:
│  ├─ "Tìm Cầu Thủ" - tuyển quân
│  └─ "Tạo Đội/Sân" - nút CTA
└─ Bố cục: 3x2 grid thay vì 2x2

[NEW: SOCIAL PROOF SECTION]
├─ Stats Counter Animated:
│  ├─ "50,000+ Người Dùng Hoạt Động"
│  ├─ "100,000+ Trận Đấu Mỗi Tháng"
│  ├─ "500+ Sân Bóng Đăng Ký"
│  └─ "1,000+ Giải Đấu Năm Ngoái"
├─ Testimonials Carousel (3-4 quotes)
└─ Partner Logos (nếu có)

[NEW: ROLE COMPARISON TABLE]
├─ 4 cột: Player | Captain | Stadium Owner | Admin
├─ Feature rows
└─ CTA: "Tạo Tài Khoản Là [Role]"

[NEW: FAQ SECTION]
├─ Accordion style
├─ 8-10 câu hỏi phổ biến
└─ Expandable answers

[CTA BANNER] - Giữ nguyên (OK)

[FOOTER] - Giữ nguyên (OK)
```

#### 2. Public Pages (Teams, Stadiums, Matches, etc.)
```
[PATTERN] Áp dụng cho tất cả public pages:

[HEADER]
├─ Breadcrumb navigation
├─ Page title + description
├─ Filter/Search bar (improved)
└─ View toggle (List/Grid/Map)

[CONTENT AREA]
├─ Filters (Left Sidebar hoặc Top)
│  ├─ Category
│  ├─ Location/Area
│  ├─ Price Range (nếu có)
│  ├─ Rating
│  └─ Status (Open, Full, etc.)
├─ Results Grid/List
│  ├─ Card design consistent
│  ├─ Quick action buttons
│  └─ Rating/Review badges
└─ Pagination (nếu cần)

[DETAILS MODAL]
├─ Hero image carousel
├─ Key info section
├─ Ratings & Reviews
├─ Action buttons
└─ Contact info
```

---

### Phần II: PLAYER DASHBOARD

#### Current Issues → Solutions

```
┌─────────────────────────────────────────────────┐
│ PLAYER DASHBOARD - REDESIGNED LAYOUT            │
└─────────────────────────────────────────────────┘

[TOP SECTION - Welcome & Quick Stats]
├─ Left Side:
│  ├─ "Xin chào, [Name]! ⚽"
│  └─ Quick status: "Bạn đang ở đội [TeamName]"
├─ Right Side:
│  ├─ Next Match Info (BIG & VISIBLE)
│  │  ├─ "Kèo Tiếp Theo"
│  │  ├─ Đối thủ: Team X vs Team Y
│  │  ├─ Ngày giờ: 19/06/2026 19:00
│  │  ├─ Địa điểm: Sân Y
│  │  └─ [Join/View Match] Button
│  ├─ Theme toggle
│  └─ User menu
└─ Stats Bar (Horizontal):
   ├─ Larger icons
   ├─ Tổng Trận: [X] ⚡
   ├─ Tỷ Lệ Thắng: [X]% 🔥
   ├─ Xếp Hạng: [X] ⭐
   └─ Tokens: [X] 💰

[MAIN CONTENT - Tabbed Interface]

Tab 1: TEAM (Active by default)
├─ Layout: 2-column
├─ Left (40%):
│  ├─ Team Card (Highlight)
│  │  ├─ Team Avatar (Large)
│  │  ├─ Team Name + Level
│  │  ├─ Description
│  │  └─ [Leave Team] (Red button, bottom)
│  └─ Team Stats (3x2 Grid):
│     ├─ Win Rate
│     ├─ Average Rating
│     ├─ Founded Date
│     ├─ Home Area
│     ├─ Participation Rate
│     └─ Next Match Date
├─ Right (60%):
│  ├─ Members Section
│  │  ├─ Search & Filter bar
│  │  ├─ Member Grid (2x2):
│  │  │  ├─ Avatar + Name
│  │  │  ├─ Position/Role
│  │  │  ├─ Joined Date
│  │  │  ├─ Participation Rate
│  │  │  ├─ Captain Badge (if applicable)
│  │  │  └─ View Profile Link
│  │  └─ Pagination
│  ├─ Recent Matches
│  │  ├─ Match list (compact)
│  │  ├─ Score + Opponent
│  │  ├─ Date
│  │  └─ View Details Link
│  └─ Team Activities
│     ├─ Recent posts
│     ├─ Member joins
│     └─ Match results

Tab 2: TOURNAMENTS
├─ Ongoing Tournaments (Current)
│  ├─ Card per tournament
│  ├─ Your position/status
│  ├─ Progress bar
│  └─ [View/Manage] link
├─ Upcoming Tournaments
├─ Completed Tournaments
└─ Suggested Tournaments (Recommendations)

Tab 3: MATCHES / FIND MATCHES
├─ Your Recent Matches (Vertical timeline)
├─ Upcoming Matches (Calendar view)
└─ Available Matches to Join
   ├─ Filter by area, level, date
   ├─ Quick join buttons
   └─ Save for later

Tab 4: STADIUMS / FIND STADIUMS
├─ Map view (default)
├─ List view (toggle)
├─ Filters:
│  ├─ Location/Area
│  ├─ Price range
│  ├─ Facilities
│  └─ Availability
├─ Results grid
└─ Booking integration

Tab 5: RANKINGS
├─ Personal ranking
├─ Leaderboard
│  ├─ Top players
│  ├─ Your rank highlighted
│  ├─ Division indicator
│  └─ Points to next rank
└─ Statistics chart

Tab 6: COMMUNITY / FEED
├─ Posts from followers
├─ Posts from your team
├─ Trending posts
└─ Post creation form (quick)

Tab 7: MESSAGES
├─ Conversation list
├─ Active chat
└─ Notifications badge

Tab 8: PROFILE
├─ Edit profile form
├─ Profile preview
├─ Statistics
└─ Account settings
```

#### Design Improvements for Player Dashboard

1. **Hierarchy Fix**:
   - Make "Next Match" the hero element
   - Move team info to second priority
   - Show recent activity prominently

2. **New Components**:
   - Quick action floating button (for urgent actions)
   - Toast notifications for updates
   - Empty state illustrations (when no team, no matches, etc.)

3. **Micro-interactions**:
   - Smooth transitions between tabs
   - Loading skeletons instead of spinners
   - Hover effects on cards
   - Success/Error animations

---

### Phần III: CAPTAIN DASHBOARD

#### Enhanced Captain Experience

```
┌─────────────────────────────────────────────────┐
│ CAPTAIN DASHBOARD - ENHANCED CONTROL            │
└─────────────────────────────────────────────────┘

[TOP SECTION - Enhanced Stats]
├─ Team Health Overview (4 cards):
│  ├─ Team Status:
│  │  ├─ Members: [X] (with + button to add)
│  │  ├─ Active: [X]
│  │  ├─ Pending: [X]
│  │  └─ Badge: "Healthy/Warning/Critical"
│  ├─ Performance:
│  │  ├─ Win Rate: [X]%
│  │  ├─ Trend: ↑/→/↓
│  │  ├─ Last 5 matches
│  │  └─ Chart mini graph
│  ├─ Fairplay:
│  │  ├─ Ranking Score: [X]
│  │  ├─ Red cards: [X]
│  │  ├─ Yellow cards: [X]
│  │  └─ Behavior badge
│  └─ Schedule:
│     ├─ Next 3 matches
│     ├─ Calendar view
│     ├─ Overdue tasks
│     └─ Action items

[MAIN CONTENT - Control Panel]

Tab 1: OVERVIEW (Active by default)
├─ [LEFT SIDEBAR - Quick Actions]
│  ├─ [+ Create Match] - Primary button
│  ├─ [+ Add Member] - Primary button
│  ├─ [View Tournament] - Secondary button
│  ├─ [Team Settings] - Tertiary button
│  └─ [Team Statistics] - Link
│
├─ [CENTER - Team Dashboard]
│  ├─ Team Card (Hero):
│  │  ├─ Large team avatar
│  │  ├─ Team name + motto
│  │  ├─ Stats bar (3 key metrics)
│  │  └─ Action buttons: Edit | Disband
│  │
│  ├─ Next 3 Upcoming Matches:
│  │  ├─ Match 1:
│  │  │  ├─ Date/Time
│  │  │  ├─ Opponent
│  │  │  ├─ Location
│  │  │  ├─ Attendance: [X]/11
│  │  │  └─ [Manage] button
│  │  └─ (Repeat for 3 matches)
│  │
│  ├─ Recent Activities:
│  │  ├─ Timeline format
│  │  ├─ New member joined
│  │  ├─ Match result
│  │  ├─ Post created
│  │  └─ Load more link
│  │
│  └─ Alerts & Notifications:
│     ├─ Low attendance warning
│     ├─ Member activity alerts
│     └─ System notifications

│
├─ [RIGHT SIDEBAR - At a Glance]
│  ├─ Team Composition:
│  │  ├─ Total members bar chart
│  │  ├─ Active this week: [X]
│  │  └─ [See details] link
│  │
│  ├─ Recent Results:
│  │  ├─ Win/Loss/Draw distribution
│  │  └─ Bar chart
│  │
│  ├─ Team Health Score:
│  │  ├─ Overall: [X]/100
│  │  ├─ Participation: [X]%
│  │  ├─ Performance: [X]%
│  │  ├─ Behavior: [X]%
│  │  └─ Gauge chart
│  │
│  └─ Upcoming Tournaments:
│     ├─ Current position
│     ├─ Matches left
│     └─ Link to manage

Tab 2: MEMBERS - TEAM MANAGEMENT
├─ Member List (Table or Grid):
│  ├─ Columns:
│  │  ├─ Avatar + Name
│  │  ├─ Role in team
│  │  ├─ Joined date
│  │  ├─ Participation %
│  │  ├─ Participation rate trend (↑/→/↓)
│  │  ├─ Rating
│  │  ├─ Last active
│  │  └─ Actions (Edit/Remove/Contact)
│  │
│  ├─ Filters:
│  │  ├─ By role
│  │  ├─ By participation
│  │  └─ By status
│  │
│  ├─ Search bar
│  └─ [+ Add Member] button
│
├─ Pending Requests:
│  ├─ Join requests
│  ├─ [Approve/Reject] buttons
│  └─ Message preview
│
├─ Member Statistics:
│  ├─ Average rating
│  ├─ Total attendance
│  ├─ Recent additions
│  └─ Most active members

Tab 3: MATCHES - MATCH MANAGEMENT
├─ Match Calendar (Month view):
│  ├─ All matches displayed
│  ├─ Color coded (Upcoming/Completed/Cancelled)
│  ├─ Click for details
│  └─ [+ Create Match] button overlay
│
├─ Match List (Detailed):
│  ├─ Upcoming Matches:
│  │  ├─ Match card per game
│  │  ├─ Opponent team
│  │  ├─ Date/Time
│  │  ├─ Location
│  │  ├─ Current attendance
│  │  ├─ Team formation (if set)
│  │  └─ [Manage] → Edit/View/Invite/Chat
│  │
│  ├─ Completed Matches:
│  │  ├─ Result (Score)
│  │  ├─ MVP highlight
│  │  ├─ Post-match stats
│  │  └─ [View Report]
│  │
│  └─ Cancelled Matches:
│     ├─ Cancellation reason
│     └─ Reschedule option
│
├─ Match Templates:
│  ├─ Frequently scheduled times
│  ├─ Quick create
│  └─ Save as template

Tab 4: TOURNAMENTS
├─ Active Tournaments:
│  ├─ Tournament card:
│  │  ├─ Name + Logo
│  │  ├─ Current standing
│  │  ├─ Progress (X of Y matches)
│  │  ├─ Points/Ranking
│  │  ├─ Next opponent
│  │  └─ [Manage] button
│  │
│  ├─ Tournament Details (expand):
│  │  ├─ Bracket view
│  │  ├─ Group standings
│  │  ├─ Schedule
│  │  ├─ Statistics
│  │  └─ Communication board
│
├─ Upcoming Tournaments:
│  ├─ Suggested tournaments
│  ├─ Level/Type filtering
│  └─ [Register] buttons
│
└─ Tournament History:
   ├─ Past tournaments
   ├─ Final positions
   └─ Statistics

Tab 5: STADIUMS
├─ Saved Stadiums (Favorites):
│  ├─ Recent bookings
│  ├─ Frequently used
│  └─ Quick book buttons
│
├─ Search & Filter:
│  ├─ Location filter
│  ├─ Price range
│  ├─ Facilities needed
│  ├─ Availability calendar
│  └─ Search results
│
└─ Booking Management:
   ├─ Upcoming bookings
   ├─ Invoice management
   └─ Payment history

Tab 6: POSTS / COMMUNITY
├─ Create New Post (Form):
│  ├─ Text editor
│  ├─ Image upload
│  ├─ Tag members/teams
│  ├─ Post type (News/Achievement/Event)
│  └─ [Publish] button
│
├─ Team Posts:
│  ├─ Posts grid
│  ├─ Engagement metrics (Likes/Comments)
│  ├─ Share options
│  └─ Edit/Delete (own posts)
│
└─ Feed:
   ├─ Posts from your members
   ├─ Posts from connected teams
   └─ Trending posts

Tab 7: RANKINGS
├─ Team Ranking:
│  ├─ Your position
│  ├─ Points/Rating
│  ├─ Next milestone
│  └─ Chart comparison (you vs others)
│
├─ Leaderboard:
│  ├─ Top 10 teams
│  ├─ Your rank highlighted
│  ├─ Points breakdown
│  ├─ Filter by region
│  └─ Time period selector (Monthly/Yearly)
│
├─ Statistics:
│  ├─ Performance trends
│  ├─ Win/Loss ratio
│  ├─ Member distribution
│  └─ Historical data
│
└─ Division System:
   ├─ Current division
   ├─ Promotion/Demotion criteria
   └─ Next season projection

Tab 8: PREMIUM / MONETIZATION
├─ Premium Features:
│  ├─ Feature cards
│  ├─ Price tiers
│  ├─ [Upgrade] buttons
│  └─ Current plan info
│
└─ Monetization Dashboard:
   ├─ Revenue (if applicable)
   ├─ Growth chart
   └─ Payout information

Tab 9: MESSAGES
├─ Conversation list
├─ Active chat
└─ Unread badges

Tab 10: PROFILE
├─ Personal info
├─ Team affiliation
├─ Statistics
└─ Settings
```

#### Key Improvements for Captain

1. **Control Center**: All critical team management in one dashboard
2. **Visual Feedback**: Charts, graphs, and progress indicators
3. **Quick Actions**: Floating button with common tasks
4. **Notifications**: Alerts for important team events
5. **Collaboration**: Integrated communication tools
6. **Analytics**: Team performance tracking

---

### Phần IV: STADIUM OWNER DASHBOARD

#### New Owner Experience

```
┌─────────────────────────────────────────────────┐
│ STADIUM OWNER DASHBOARD - BUSINESS CONTROL      │
└─────────────────────────────────────────────────┘

[TOP SECTION - Revenue Snapshot]
├─ Key Metrics (4 cards):
│  ├─ Today's Revenue:
│  │  ├─ Amount: [X] VND
│  │  ├─ Bookings: [X]
│  │  ├─ Trend: ↑ +X% vs yesterday
│  │  └─ Currency selector
│  ├─ This Month:
│  │  ├─ Amount: [X] VND
│  │  ├─ Bookings: [X]
│  │  ├─ Growth: ↑ X% vs last month
│  │  └─ Chart icon (mini sparkline)
│  ├─ Occupancy Rate:
│  │  ├─ This month: [X]%
│  │  ├─ Peak hours analysis
│  │  ├─ Trend line
│  │  └─ [Details] link
│  └─ Pending Payouts:
│     ├─ Amount: [X] VND
│     ├─ Next payout date
│     ├─ [Withdraw] button
│     └─ Payment method

[MAIN CONTENT - Business Dashboard]

Tab 1: STADIUMS - PROPERTY MANAGEMENT
├─ [Quick Stats Bar]
│  ├─ Total stadiums: [X]
│  ├─ Active: [X]
│  ├─ Pending approval: [X]
│  └─ [+ Add Stadium] button
│
├─ Stadium Cards (Grid):
│  ├─ Stadium 1:
│  │  ├─ Hero image carousel
│  │  ├─ Name + Location
│  │  ├─ Type (5v5, 7v7, 11v11)
│  │  ├─ Rating: ⭐ [X]/5
│  │  ├─ Status badge (Active/Inactive/Pending)
│  │  ├─ Quick stats:
│  │  │  ├─ Booking rate: [X]%
│  │  │  ├─ Revenue: [X] VND/month
│  │  │  └─ Reviews: [X]
│  │  ├─ [Quick Actions]:
│  │  │  ├─ View Calendar
│  │  │  ├─ Edit
│  │  │  └─ View Reviews
│  │  └─ More options (...) menu
│  │
│  └─ (Repeat for each stadium)
│
├─ Add New Stadium:
│  ├─ [+ Create Stadium] button
│  └─ Multi-step form:
│     ├─ Basic info
│     ├─ Location/GPS
│     ├─ Facilities
│     ├─ Pricing
│     ├─ Photos/Gallery
│     └─ Review & Publish

Tab 2: CALENDAR / TIMELINE - BOOKING MANAGEMENT
├─ [Month/Week/Day View Toggle]
│
├─ Calendar Grid:
│  ├─ Color coded by stadium
│  ├─ Booked slots: Green
│  ├─ Available slots: Gray
│  ├─ Maintenance: Yellow
│  ├─ Click for details
│  └─ Drag to reschedule
│
├─ Booking List:
│  ├─ Today's bookings (Top priority):
│  │  ├─ Booking card:
│  │  │  ├─ Stadium name
│  │  │  ├─ Time slot
│  │  │  ├─ Booked by (Team/Player)
│  │  │  ├─ Duration
│  │  │  ├─ Price: [X] VND
│  │  │  ├─ Status (Confirmed/Pending/Cancelled)
│  │  │  ├─ Contact info
│  │  │  └─ Actions:
│  │  │     ├─ [Confirm] (if pending)
│  │  │     ├─ [Cancel] (with reason)
│  │  │     ├─ [Reschedule]
│  │  │     └─ [Message]
│  │
│  ├─ Upcoming Bookings (Next 7 days):
│  │  └─ (Similar layout)
│  │
│  └─ [View All Bookings] link
│
├─ Maintenance Schedule:
│  ├─ Scheduled maintenance
│  ├─ [+ Add Maintenance]
│  └─ Block calendar
│
└─ Quick Actions:
   ├─ [Block Time] - For maintenance/private use
   ├─ [Create Promotion] - Discount offer
   └─ [View Analytics] - Performance

Tab 3: BOOKINGS - ORDER MANAGEMENT
├─ Booking Filters:
│  ├─ By stadium
│  ├─ By status (Pending/Confirmed/Completed/Cancelled)
│  ├─ By date range
│  └─ Search by customer name
│
├─ Booking List (Table):
│  ├─ Columns:
│  │  ├─ ID
│  │  ├─ Stadium
│  │  ├─ Date/Time
│  │  ├─ Duration
│  │  ├─ Customer
│  │  ├─ Price
│  │  ├─ Status
│  │  ├─ Payment status
│  │  └─ Actions (View/Edit/Cancel)
│  │
│  ├─ Bulk Actions:
│  │  ├─ Select multiple
│  │  ├─ [Confirm Selected]
│  │  └─ [Cancel Selected]
│  │
│  └─ Pagination
│
├─ Pending Approvals:
│  ├─ New booking requests
│  ├─ [Approve]/[Reject] buttons
│  └─ Auto-approve settings
│
├─ Payment Management:
│  ├─ Pending payments
│  ├─ Send invoice
│  ├─ Payment history
│  └─ Refund management

Tab 4: REVENUE - ANALYTICS & INSIGHTS
├─ Revenue Overview (Large Chart):
│  ├─ Line chart: Revenue trend (Last 30 days)
│  ├─ Time period selector:
│  │  ├─ 7 days
│  │  ├─ 30 days
│  │  ├─ 90 days
│  │  ├─ Year
│  │  └─ Custom range
│  ├─ Key metrics overlay:
│  │  ├─ Total: [X] VND
│  │  ├─ Average: [X] VND/day
│  │  └─ Trend: [X]%
│  └─ [Export] button
│
├─ Revenue by Stadium (Pie/Stacked Bar):
│  ├─ Stadium A: [X]% - [X] VND
│  ├─ Stadium B: [X]% - [X] VND
│  └─ (By each stadium)
│
├─ Occupancy Analysis:
│  ├─ Occupancy rate by hour
│  ├─ Peak hours identification
│  ├─ Low occupancy alerts
│  ├─ Recommendations for pricing/promotions
│  └─ Chart: Heatmap by time
│
├─ Customer Analytics:
│  ├─ New customers this month
│  ├─ Repeat customers
│  ├─ Customer lifetime value
│  ├─ Customer retention rate
│  └─ Churn analysis
│
├─ Financial Reports:
│  ├─ Monthly statement
│  ├─ Quarterly report
│  ├─ Annual summary
│  ├─ Tax information
│  └─ [Download PDF] button
│
├─ Expense Tracking:
│  ├─ Maintenance costs
│  ├─ Staff costs
│  ├─ Utilities
│  ├─ Marketing expenses
│  └─ Profit/Loss calculation
│
└─ Pricing Strategy:
   ├─ Current pricing
   ├─ Price recommendations (AI-based)
   ├─ Dynamic pricing toggle
   ├─ A/B test pricing
   └─ Historical price changes

Tab 5: TOURNAMENTS - STADIUM HOSTING
├─ Active Tournaments (Hosted):
│  ├─ Tournament card:
│  │  ├─ Name + Logo
│  │  ├─ Start/End date
│  │  ├─ Teams count
│  │  ├─ Revenue: [X] VND
│  │  ├─ Status (Ongoing/Completed)
│  │  └─ [View Details] link
│  │
├─ Upcoming Tournaments:
│  ├─ Scheduled hosting
│  ├─ Preparation checklist
│  └─ [View Details]
│
├─ Tournament Management:
│  ├─ Bracket/Schedule
│  ├─ Team management
│  ├─ Match scheduling
│  ├─ Referee assignment
│  ├─ Revenue tracking
│  └─ [Manage] button
│
├─ Host New Tournament:
│  ├─ [+ Create Tournament] button
│  └─ Tournament creation form:
│     ├─ Name & description
│     ├─ Format selection
│     ├─ Scheduling
│     ├─ Prize pool
│     ├─ Rules
│     └─ Publish
│
└─ Tournament Reports:
   ├─ Attendance
   ├─ Revenue details
   ├─ Participant feedback
   └─ [View Report]

Tab 6: REVIEWS - REPUTATION MANAGEMENT
├─ Review Summary:
│  ├─ Average rating: ⭐ [X]/5
│  ├─ Total reviews: [X]
│  ├─ Rating distribution:
│  │  ├─ ⭐⭐⭐⭐⭐: [X]%
│  │  ├─ ⭐⭐⭐⭐: [X]%
│  │  ├─ ⭐⭐⭐: [X]%
│  │  ├─ ⭐⭐: [X]%
│  │  └─ ⭐: [X]%
│  └─ Trend: ↑/→/↓
│
├─ Reviews List:
│  ├─ Sort by: Latest/Most Helpful/Rating
│  ├─ Filter by rating
│  ├─ Review card:
│  │  ├─ Reviewer avatar & name
│  │  ├─ Rating stars
│  │  ├─ Review text
│  │  ├─ Helpful count
│  │  ├─ Date posted
│  │  └─ [Reply] button
│  │
├─ Your Responses:
│  ├─ Reviews awaiting response
│  ├─ Response form
│  ├─ [Publish Response]
│  └─ View previous responses
│
└─ Reputation Tools:
   ├─ Auto-request review after booking
   ├─ Email templates
   ├─ Monitor keywords
   └─ Alert on bad reviews

Tab 7: SETTINGS - BUSINESS CONFIGURATION
├─ Stadium Settings:
│  ├─ General info
│  ├─ Location & hours
│  ├─ Facilities & amenities
│  ├─ Pricing & policies
│  ├─ Photos & gallery
│  └─ [Save]
│
├─ Booking Rules:
│  ├─ Cancellation policy
│  ├─ Deposit requirements
│  ├─ Lead time
│  ├─ Auto-approval settings
│  └─ [Update]
│
├─ Payment Settings:
│  ├─ Bank account
│  ├─ Payment gateway
│  ├─ Payout schedule
│  ├─ Commission settings
│  └─ [Update]
│
├─ Communication:
│  ├─ Email notifications
│  ├─ SMS alerts
│  ├─ Message templates
│  └─ Preferences
│
├─ Team Settings:
│  ├─ Staff management
│  ├─ Permissions
│  ├─ Roles
│  └─ [Add Staff]
│
└─ Integration:
   ├─ Connected apps
   ├─ API keys
   ├─ Webhooks
   └─ [Connect]

Tab 8: MESSAGES
├─ Conversation list
├─ Active chat
└─ Unread badges

Tab 9: PROFILE
├─ Business profile
├─ Account settings
└─ Billing
```

#### Key Features for Stadium Owner

1. **Revenue Dashboard**: Real-time financial tracking
2. **Calendar Management**: Visual booking schedule
3. **Occupancy Analytics**: Data-driven insights
4. **Review Management**: Reputation tracking
5. **Reporting**: Financial & operational reports
6. **Team Collaboration**: Multi-user support

---

## 🎨 Design System Enhancements

### Colors
```
Primary: Gold (#FBD34D, #F59E0B) - Accent
Secondary: Navy (#0F172A, #1E293B) - Background
Tertiary: Teal (#14B8A6) - Positive/Success
Danger: Red (#EF4444) - Warnings/Destructive
Neutral: Slate (#64748B, #94A3B8) - Text/Borders
```

### Typography
```
Headings:
- H1: 2.5rem (40px) - Bold, Pages
- H2: 1.875rem (30px) - Bold, Sections
- H3: 1.5rem (24px) - Bold, Subsections
- H4: 1.125rem (18px) - Bold, Cards

Body:
- Large: 1.125rem (18px) - Important text
- Normal: 1rem (16px) - Standard text
- Small: 0.875rem (14px) - Secondary
- Tiny: 0.75rem (12px) - Captions
```

### Spacing
```
xs: 4px (0.25rem)
sm: 8px (0.5rem)
md: 16px (1rem)
lg: 24px (1.5rem)
xl: 32px (2rem)
2xl: 48px (3rem)
3xl: 64px (4rem)
```

### Border Radius
```
Small: 0.5rem (8px) - Small components
Medium: 1rem (16px) - Buttons, inputs
Large: 1.5rem (24px) - Cards, modals
XL: 2rem (32px) - Large sections
Round: 9999px - Circles
```

### Shadows
```
sm: 0 1px 2px rgba(0,0,0,0.05)
md: 0 4px 6px rgba(0,0,0,0.1)
lg: 0 10px 15px rgba(0,0,0,0.1)
xl: 0 20px 25px rgba(0,0,0,0.1)
2xl: 0 25px 50px rgba(0,0,0,0.1)
```

### Transitions
```
Fast: 150ms
Normal: 300ms
Slow: 500ms
```

---

## 📱 Responsive Breakpoints

```
Mobile: 320px - 640px
Tablet: 641px - 1024px
Desktop: 1025px - 1920px
Ultra-wide: 1921px+
```

---

## 🚀 Implementation Priority

### Phase 1: Foundation (Week 1-2)
- [ ] Update design system/colors in Tailwind
- [ ] Create new component library (Cards, Buttons, Modals)
- [ ] Implement improved Home page
- [ ] Update public pages structure

### Phase 2: Player & Captain Dashboards (Week 3-4)
- [ ] Redesign Player dashboard layout
- [ ] Add new Player dashboard components
- [ ] Redesign Captain dashboard layout
- [ ] Add Captain-specific features (Analytics, quick actions)

### Phase 3: Stadium Owner Dashboard (Week 5-6)
- [ ] Redesign Owner dashboard layout
- [ ] Add revenue analytics
- [ ] Implement booking calendar
- [ ] Add reporting features

### Phase 4: Polish & Testing (Week 7-8)
- [ ] Performance optimization
- [ ] Mobile responsiveness testing
- [ ] Accessibility audit
- [ ] User testing & feedback

---

## ✅ Checklist for Implementation

### For Each Dashboard:
- [ ] Skeleton/Loading states
- [ ] Empty states with illustrations
- [ ] Error handling
- [ ] Success feedback
- [ ] Mobile responsiveness
- [ ] Dark mode support
- [ ] Accessibility (WCAG 2.1 AA)
- [ ] Performance (Load time < 3s)
- [ ] Animations & transitions
- [ ] Keyboard navigation

---

## 📊 Success Metrics

1. **Engagement**:
   - Increase in user session duration
   - More frequent dashboard visits
   - Higher feature adoption rate

2. **Usability**:
   - Reduced bounce rate
   - Improved task completion rate
   - Better user retention

3. **Performance**:
   - Page load time < 3 seconds
   - Lighthouse score > 90
   - Mobile first index

4. **Conversion**:
   - Increased registrations
   - More premium subscriptions
   - Better monetization

---

## 💡 Additional Features to Consider

1. **AI-Powered Recommendations**:
   - Suggest teams based on skill level
   - Recommend stadiums based on location
   - Smart match suggestions

2. **Gamification**:
   - Achievements & badges
   - Level system
   - Leaderboards
   - Streak tracking

3. **Social Features**:
   - Follow other teams/players
   - Share achievements
   - Team chat/forum
   - Live match commentary

4. **Mobile App Features**:
   - Push notifications
   - Offline support
   - Quick check-in
   - Live match updates

---

## 🎯 Conclusion

Đây là một redesign toàn diện giúp:
1. **Guest** → Dễ dàng hiểu được nền tảng và đăng ký
2. **Player** → Nhanh chóng tìm kiếm trận đấu và đội bóng
3. **Captain** → Quản lý đội và trận đấu hiệu quả
4. **Owner** → Theo dõi doanh thu và quản lý sân bóng

Mỗi role có trải nghiệm tối ưu cho nhu cầu riêng của họ.
