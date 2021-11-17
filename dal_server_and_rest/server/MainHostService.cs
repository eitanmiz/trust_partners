using eitanm_supercom_assignment.DAL.Base;
using eitanm_supercom_assignment.Services;

namespace eitanm_supercom_assignment
{
    public class MainHostService : IHostedService
    {
        
        public MainHostService(IDBConnector connector, IDBEntityContext entityContext, IConfiguration configuration) { 

            connector.ConnectionString = configuration.GetSection("General").GetValue(typeof(string), "ConnectionString").ToString();
            entityContext.InitEntities(connector);
            UsersManager.Instance(connector, entityContext);

      }
        public Task StartAsync(CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }
    }
}
