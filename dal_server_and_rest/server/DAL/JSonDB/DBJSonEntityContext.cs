using eitanm_supercom_assignment.DAL.Base;
using eitanm_supercom_assignment.Models.Structure;

namespace eitanm_supercom_assignment.DAL.JSonDB
{
    public class DBJSonEntityContext : IDBEntityContext
    {
        public IDBEntity<Users>? Users { get; set; }
        public IDBEntity<Locations>? Locations { get; set; }

        public void InitEntities(IDBConnector connector)
        {
            Users = new DBJsonEntity<Users>(connector);
            Locations = new DBJsonEntity<Locations>(connector);
        }
    }
}
