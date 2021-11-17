using System.Linq.Expressions;

namespace eitanm_supercom_assignment.DAL.Base
{
    public abstract class DBEntityBase<T> : IDBEntity<T> where T: BaseElement
    {
        private IDBConnector? connector;

        public IDBConnector? Connector { get => connector; private set => connector = value; }
        


        public void SetDatabase(IDBConnector connector)
        {
            this.connector = connector;
        }

        
        protected DBEntityBase(IDBConnector dbConnector)
        {
            connector = dbConnector;
        }
        public abstract IList<T> GetAll(params Expression<Func<T, object>>[] properties);
        public abstract IList<T> GetList(Func<T, bool> where, params Expression<Func<T, object>>[] properties);
        public abstract T? GetSingle(Func<T, bool> where, params Expression<Func<T, object>>[] properties);
        public abstract void Add(params T[] items);
        public abstract void Update(params T[] items);
        public abstract void Remove(params T[] items);
    }
}
