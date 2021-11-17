using eitanm_supercom_assignment.DAL.Base;
using System.Data;

namespace eitanm_supercom_assignment.DAL.JSonDB
{
    public class DBJsonConnector : DBConnectorBase, IDisposable

    {
        public override void Connect()
        {
            if (Directory.Exists(ConnectionString))
            {
                IsConnected = true;
            }
        }

        public override void Disconnect()
        {
            IsConnected = false;
        }

        public void Dispose()
        {
            // free resource 
            IsConnected = false;
        }
    }
}
