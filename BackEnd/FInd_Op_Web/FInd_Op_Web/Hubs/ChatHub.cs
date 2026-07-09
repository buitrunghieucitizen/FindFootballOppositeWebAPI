using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using FInd_Op_Web.Data;
using FInd_Op_Web.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;
using System;

namespace FInd_Op_Web.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly ApplicationDbContext _context;

        public ChatHub(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task JoinMatchGroup(string matchId)
        {
            var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return;

            await Groups.AddToGroupAsync(Context.ConnectionId, $"Match_{matchId}");
        }

        public async Task LeaveMatchGroup(string matchId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Match_{matchId}");
        }

        public async Task SendMessage(int matchId, int senderTeamId, string encryptedMessage)
        {
            var userIdStr = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId)) return;

            var chatMsg = new MatchChat
            {
                MatchId = matchId,
                SenderTeamId = senderTeamId,
                EncryptedMessage = encryptedMessage,
                SentAt = DateTime.Now
            };

            _context.MatchChats.Add(chatMsg);
            await _context.SaveChangesAsync();

            await Clients.Group($"Match_{matchId}").SendAsync("ReceiveMessage", new 
            {
                ChatId = chatMsg.ChatId,
                MatchId = chatMsg.MatchId,
                SenderTeamId = chatMsg.SenderTeamId,
                EncryptedMessage = chatMsg.EncryptedMessage,
                SentAt = chatMsg.SentAt
            });
        }
    }
}
