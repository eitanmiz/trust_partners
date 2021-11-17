using eitanm_supercom_assignment.DAL.Base;

namespace eitanm_supercom_assignment.DAL.JSonDB
{ 
    public class JsonData<T> where T: BaseElement
    {
        public T[] Data { get; set; } = Array.Empty<T>();
    }
}
