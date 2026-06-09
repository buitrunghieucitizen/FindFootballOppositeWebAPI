using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;
namespace FInd_Op_Web.DTOs
{
        public class SendMessageDto
        {
            [Required]
            public int ReceiverId { get; set; }
            
            [Required]
            public string Content { get; set; } = null!;
        }
    
}

