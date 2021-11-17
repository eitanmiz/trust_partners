namespace eitanm_supercom_assignment.DAL.Base
{
    public abstract class DBConnectorBase : IDBConnector
    {
        public string? ConnectionString { get; set; }
        public bool IsConnected { get; set; }

        public abstract void Connect();
        public abstract void Disconnect();
    }
}
