using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;

namespace FInd_Op_Web.DTOs
{
            public class UpdateProfileRequest
            {
                public string? FullName { get; set; }
                public string? Phone { get; set; }
                public string? AvatarUrl { get; set; }
            }
    
            public class ChangePasswordRequest
            {
                public string CurrentPassword { get; set; } = null!;
                public string NewPassword { get; set; } = null!;
                public string ConfirmNewPassword { get; set; } = null!;
            }
    
}

