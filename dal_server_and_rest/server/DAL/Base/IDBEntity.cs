using System.Linq.Expressions;

namespace eitanm_supercom_assignment.DAL.Base
{
    public interface IDBEntity<T> where T: IBaseElement
    {
        void SetDatabase(IDBConnector connector);
        IList<T> GetAll(params Expression<Func<T, object>>[] navigationProperties);
        IList<T> GetList(Func<T, bool> where, params Expression<Func<T, object>>[] navigationProperties);
        T? GetSingle(Func<T, bool> where, params Expression<Func<T, object>>[] navigationProperties);
        void Add(params T[] items);
        void Update(params T[] items);
        void Remove(params T[] items);
    }
}
