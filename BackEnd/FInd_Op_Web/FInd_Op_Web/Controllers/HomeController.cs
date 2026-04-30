using FInd_Op_Web.Data;
using System.Diagnostics;
using FInd_Op_Web.Models;
using FInd_Op_Web.Services;
using Microsoft.AspNetCore.Mvc;

namespace FInd_Op_Web.Controllers
{
    [ApiController]
    [Route("api/[controller]/[action]")]
    public class HomeController : ControllerBase
    {
        private readonly ILogger<HomeController> _logger;
        private readonly PortalDataService _portalData;

        public HomeController(ILogger<HomeController> logger, PortalDataService portalData)
        {
            _logger = logger;
            _portalData = portalData;
        }

        [HttpGet]
        public IActionResult Index()
        {
            return Ok(_portalData.BuildPortal());
        }

        [HttpGet]
        public IActionResult Teams()
        {
            return Ok(_portalData.BuildPortal());
        }

        [HttpGet]
        public IActionResult Stadiums()
        {
            return Ok(_portalData.BuildPortal());
        }

        [HttpGet]
        public IActionResult Matches()
        {
            return Ok(_portalData.BuildPortal());
        }

        [HttpGet]
        public IActionResult Recruitment()
        {
            return Ok(_portalData.BuildPortal());
        }

        [HttpGet]
        public IActionResult Operations()
        {
            return Ok(_portalData.BuildPortal());
        }

        [HttpGet]
        public IActionResult Admin()
        {
            return Ok(_portalData.BuildPortal());
        }

        [HttpGet]
        public IActionResult StadiumOwner()
        {
            return Ok(_portalData.BuildPortal());
        }

        [HttpGet]
        public IActionResult Captain()
        {
            return Ok(_portalData.BuildPortal());
        }

        [HttpGet]
        public IActionResult Privacy()
        {
            return Ok(new { view = "Guest/Privacy" });
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        [HttpGet]
        public IActionResult Error()
        {
            return Ok(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
