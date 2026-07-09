using System;
using FInd_Op_Web.Models;

namespace FInd_Op_Web.Services
{
    public enum MatchResult
    {
        TeamAWon,
        TeamBWon,
        Draw
    }

    public static class RankingUtility
    {
        /// <summary>
        /// Tính toán điểm thay đổi cho 2 đội sau khi trận đấu kết thúc.
        /// </summary>
        /// <param name="pointsA">Điểm hiện tại của đội A (ví dụ: Đội Chủ nhà)</param>
        /// <param name="pointsB">Điểm hiện tại của đội B (ví dụ: Đội Khách)</param>
        /// <param name="result">Kết quả trận đấu</param>
        /// <returns>Tuple chứa sự thay đổi điểm của (Đội A, Đội B)</returns>
        public static (int DeltaA, int DeltaB) CalculatePointChanges(int pointsA, int pointsB, MatchResult result)
        {
            int diff = Math.Abs(pointsA - pointsB);
            
            bool isA_Higher = pointsA >= pointsB;

            // Xác định xem đội cửa trên/cửa dưới là ai
            // Nếu bằng điểm nhau, coi như A là cửa trên (hoặc xử lý chung vì diff = 0 < 15)
            
            // Mặc định Delta
            int deltaA = 0;
            int deltaB = 0;

            if (diff < 15)
            {
                // Ngang trình (lệch dưới 15 điểm)
                // Thắng +3 điểm, Thua -3 điểm, Hòa cả 2 đội +1 điểm.
                switch (result)
                {
                    case MatchResult.TeamAWon:
                        deltaA = 3; deltaB = -3;
                        break;
                    case MatchResult.TeamBWon:
                        deltaA = -3; deltaB = 3;
                        break;
                    case MatchResult.Draw:
                        deltaA = 1; deltaB = 1;
                        break;
                }
            }
            else if (diff >= 15 && diff < 20)
            {
                // Lệch 15 - 20 bậc (điểm)
                switch (result)
                {
                    case MatchResult.TeamAWon:
                        if (isA_Higher) { deltaA = 2; deltaB = -1; }      // Đội cao thắng
                        else            { deltaA = 9; deltaB = -6; }      // Đội thấp thắng (Đội cao thua)
                        break;
                    case MatchResult.TeamBWon:
                        if (isA_Higher) { deltaA = -6; deltaB = 9; }      // Đội cao thua
                        else            { deltaA = -1; deltaB = 2; }      // Đội cao thắng
                        break;
                    case MatchResult.Draw:
                        if (isA_Higher) { deltaA = -3; deltaB = 5; }      // Hòa
                        else            { deltaA = 5; deltaB = -3; }
                        break;
                }
            }
            else
            {
                // Lệch từ 20 bậc trở lên
                switch (result)
                {
                    case MatchResult.TeamAWon:
                        if (isA_Higher) { deltaA = 1; deltaB = -1; }      // Đội cao thắng
                        else            { deltaA = 15; deltaB = -12; }    // Đội thấp thắng (Đội cao thua)
                        break;
                    case MatchResult.TeamBWon:
                        if (isA_Higher) { deltaA = -12; deltaB = 15; }    // Đội cao thua
                        else            { deltaA = -1; deltaB = 1; }      // Đội cao thắng
                        break;
                    case MatchResult.Draw:
                        if (isA_Higher) { deltaA = -5; deltaB = 9; }      // Hòa
                        else            { deltaA = 9; deltaB = -5; }
                        break;
                }
            }

            return (deltaA, deltaB);
        }

        /// <summary>
        /// Hàm tiện ích tính và cập nhật điểm trực tiếp vào Model của 2 đội
        /// Điểm không bao giờ giảm xuống dưới 0.
        /// </summary>
        public static void UpdateTeamsPoints(Team teamA, Team teamB, MatchResult result)
        {
            var (deltaA, deltaB) = CalculatePointChanges(teamA.Points, teamB.Points, result);

            teamA.Points += deltaA;
            teamB.Points += deltaB;

            // Đảm bảo không bị âm điểm
            if (teamA.Points < 0) teamA.Points = 0;
            if (teamB.Points < 0) teamB.Points = 0;

            // Cập nhật RankingTier (Bậc xếp hạng) nếu cần
            teamA.RankingTier = DetermineRankingTier(teamA.Points);
            teamB.RankingTier = DetermineRankingTier(teamB.Points);
        }

        private static string DetermineRankingTier(int points)
        {
            if (points < 20) return "Đồng";
            if (points < 50) return "Bạc";
            if (points < 100) return "Vàng";
            if (points < 200) return "Bạch Kim";
            if (points < 500) return "Kim Cương";
            return "Thách Đấu";
        }
    }
}
