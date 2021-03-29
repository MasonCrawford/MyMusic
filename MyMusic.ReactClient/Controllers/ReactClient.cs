using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace MyMusic.ReactClient.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ReactClient : ControllerBase
    {
        private static readonly string[] Summaries = new[]
        {
            "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
        };

        private readonly ILogger<ReactClient> _logger;
        private readonly HttpClient _client;

        public ReactClient(ILogger<ReactClient> logger)
        {
            _logger = logger;

        }

        [HttpGet]
        public async Task<IEnumerable<Music>> Get()
        {
            
            IEnumerable<Music> music = null;

            using (var client = new HttpClient())
            {
                client.BaseAddress = new Uri("https://localhost:44372/api/");
                //HTTP GET
                var responseTask = client.GetAsync("Musics");
                responseTask.Wait();

                var result = responseTask.Result;
                if (result.IsSuccessStatusCode)
                {
                    music = JsonConvert.DeserializeObject<IList<Music>>(await result.Content.ReadAsStringAsync());
                }
                else //web api sent error response 
                {
                    //log response status here..

                    music = Enumerable.Empty<Music>();

                    ModelState.AddModelError(string.Empty, "Server error. Please contact administrator.");
                }
            }
            return music;


        }
    }
}
