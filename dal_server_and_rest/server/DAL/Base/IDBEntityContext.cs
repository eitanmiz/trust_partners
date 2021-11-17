using eitanm_supercom_assignment.Models.Structure;

namespace eitanm_supercom_assignment.DAL.Base
{
    public interface IDBEntityContext
    {
        IDBEntity<Users>? Users { get; set; }
        IDBEntity<Locations>? Locations { get; set; }
        void InitEntities(IDBConnector connector);
    }
}
