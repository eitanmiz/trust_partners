namespace eitanm_supercom_assignment.DAL.Base
{
    public interface IDBConnector
    {
        string? ConnectionString { get; set; }
        bool IsConnected { get; set; }


        void Connect();
        void Disconnect();
    }
}
