// Unused usings removed
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using TodoApi.Models;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Cors;

namespace TodoApi
{
    [EnableCors]
    public class Startup
    {
        readonly string MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }


            public void ConfigureServices(IServiceCollection services)
        {
                services.AddCors(options =>
                {
                    options.AddPolicy(name: MyAllowSpecificOrigins,
                                      builder =>
                                      {
                                          builder.WithOrigins("http://localhost:3000").AllowAnyHeader();
                                      });
                });

                services.AddDbContext<TodoContext>(opts =>
               opts.UseInMemoryDatabase("minesweeperdb"));
            services.AddScoped<TodoContext>();
            services.AddControllers();
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseHttpsRedirection();

            app.UseRouting();

            app.UseCors("AllowAllOrigins");

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers().RequireCors(MyAllowSpecificOrigins);
            });
        }
    }
}