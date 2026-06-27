using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;

namespace Novac.Api.Services
{
    public class EmailService
    {
        private readonly string _from;
        private readonly string _password;

        public EmailService(IConfiguration config)
        {
            _from = config["EmailSettings:From"];
            _password = config["EmailSettings:Password"];
        }

        private SmtpClient GetClient()
        {
            return new SmtpClient("smtp.gmail.com", 587)
            {
                Credentials = new NetworkCredential(_from, _password),
                EnableSsl = true
            };
        }

        public async Task SendEmailAsync(string to, string subject, string body)
        {
            try
            {
                var client = GetClient();

                var mail = new MailMessage
                {
                    From = new MailAddress(_from, "Novac System"),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true
                };

                mail.To.Add(to);

                await client.SendMailAsync(mail);
            }
            catch
            {
            }
        }

        public string GetTemplate(string title, string message)
        {
            return $@"
            <div style='font-family:Arial; padding:20px'>
                <h2 style='color:#4f46e5'>{title}</h2>
                <p style='font-size:16px'>{message}</p>
                <hr/>
                <small style='color:#888'>Novac Team System</small>
            </div>";
        }
    }
}