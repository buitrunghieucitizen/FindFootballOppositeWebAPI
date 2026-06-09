using FInd_Op_Web.DTOs;
using FInd_Op_Web.Data;
using FInd_Op_Web.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.AspNetCore.SignalR;
using FInd_Op_Web.Hubs;
using System.ComponentModel.DataAnnotations;

namespace FInd_Op_Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DirectMessageController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<NotificationHub> _hubContext;

        public DirectMessageController(ApplicationDbContext context, IHubContext<NotificationHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        }

        [HttpGet("Conversations")]
        public async Task<IActionResult> GetConversations()
        {
            try
            {
                int userId = GetUserId();
                
                var sentMessages = await _context.DirectMessages
                    .Include(m => m.Receiver)
                    .Where(m => m.SenderId == userId)
                    .ToListAsync();

                var receivedMessages = await _context.DirectMessages
                    .Include(m => m.Sender)
                    .Where(m => m.ReceiverId == userId)
                    .ToListAsync();

                // Group by the other user
                var allUsersInvolved = sentMessages.Select(m => new { m.ReceiverId, User = m.Receiver, m.CreatedAt, m.Content, m.IsRead, IsSender = true })
                    .Concat(receivedMessages.Select(m => new { ReceiverId = m.SenderId, User = m.Sender, m.CreatedAt, m.Content, m.IsRead, IsSender = false }))
                    .GroupBy(x => x.ReceiverId)
                    .Select(g =>
                    {
                        var lastMessage = g.OrderByDescending(x => x.CreatedAt).First();
                        var unreadCount = g.Count(x => !x.IsSender && !x.IsRead);
                        var user = g.First().User;
                        return new
                        {
                            UserId = user?.UserId,
                            FullName = user?.FullName,
                            LastMessage = lastMessage.Content,
                            LastMessageTime = lastMessage.CreatedAt,
                            UnreadCount = unreadCount
                        };
                    })
                    .OrderByDescending(c => c.LastMessageTime)
                    .ToList();

                return Ok(allUsersInvolved);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("History/{otherUserId}")]
        public async Task<IActionResult> GetHistory(int otherUserId)
        {
            try
            {
                int userId = GetUserId();
                var messages = await _context.DirectMessages
                    .Where(m => (m.SenderId == userId && m.ReceiverId == otherUserId) || 
                                (m.SenderId == otherUserId && m.ReceiverId == userId))
                    .OrderBy(m => m.CreatedAt)
                    .ToListAsync();

                // Mark unread messages as read
                var unreadReceived = messages.Where(m => m.ReceiverId == userId && !m.IsRead).ToList();
                foreach (var msg in unreadReceived)
                {
                    msg.IsRead = true;
                }
                
                if (unreadReceived.Any())
                {
                    await _context.SaveChangesAsync();
                }

                return Ok(messages.Select(m => new
                {
                    m.MessageId,
                    m.SenderId,
                    m.ReceiverId,
                    m.Content,
                    m.CreatedAt,
                    m.IsRead
                }));
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("Send")]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageDto dto)
        {
            try
            {
                int senderId = GetUserId();
                if (senderId == dto.ReceiverId) return BadRequest(new { message = "You cannot send a message to yourself." });

                var message = new DirectMessage
                {
                    SenderId = senderId,
                    ReceiverId = dto.ReceiverId,
                    Content = dto.Content,
                    CreatedAt = DateTime.Now,
                    IsRead = false
                };

                _context.DirectMessages.Add(message);
                await _context.SaveChangesAsync();

                var msgResponse = new
                {
                    message.MessageId,
                    message.SenderId,
                    message.ReceiverId,
                    message.Content,
                    message.CreatedAt,
                    message.IsRead,
                    SenderFullName = User.FindFirstValue(ClaimTypes.Name) ?? "Người dùng"
                };

                var connectionId = NotificationHub.GetConnectionIdForUser(dto.ReceiverId.ToString());
                if (!string.IsNullOrEmpty(connectionId))
                {
                    await _hubContext.Clients.Client(connectionId).SendAsync("ReceiveDirectMessage", msgResponse);
                }

                return Ok(msgResponse);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("UnreadCount")]
        public async Task<IActionResult> GetUnreadCount()
        {
            int userId = GetUserId();
            int count = await _context.DirectMessages.CountAsync(m => m.ReceiverId == userId && !m.IsRead);
            return Ok(new { count });
        }
    }

}
