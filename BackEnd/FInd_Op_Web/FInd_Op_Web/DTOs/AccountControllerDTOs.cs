using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;

namespace FInd_Op_Web.DTOs
{
            public class LoginRequest
            {
                public string Username { get; set; }
                public string Password { get; set; }
            }
    
            public class Verify2FARequest
            {
                public string Username { get; set; }
                public string Password { get; set; }
                public string Code { get; set; }
            }
    
            public class Setup2FARequest
            {
                public string Username { get; set; }
                public string Password { get; set; }
            }
    
            public class RegisterRequest
            {
                public string Username { get; set; }
                public string FullName { get; set; }
                public string Phone { get; set; }
                public string Password { get; set; }
                public string ConfirmPassword { get; set; }
                public string UserRole { get; set; }
            }
    
}

