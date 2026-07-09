using FInd_Op_Web.Data;
using FInd_Op_Web.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FInd_Op_Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SportsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SportsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetSports()
        {
            var sports = await _context.Sports.OrderBy(s => s.SportId).ToListAsync();
            return Ok(sports);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateSport([FromBody] Sport sport)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            sport.CreatedAt = DateTime.UtcNow;
            _context.Sports.Add(sport);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSports), new { id = sport.SportId }, sport);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateSport(int id, [FromBody] Sport sport)
        {
            if (id != sport.SportId)
                return BadRequest("ID mismatch");

            var existing = await _context.Sports.FindAsync(id);
            if (existing == null)
                return NotFound();

            existing.SportName = sport.SportName;
            existing.Icon = sport.Icon;
            existing.HasScoring = sport.HasScoring;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteSport(int id)
        {
            var sport = await _context.Sports.FindAsync(id);
            if (sport == null)
                return NotFound();

            _context.Sports.Remove(sport);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
