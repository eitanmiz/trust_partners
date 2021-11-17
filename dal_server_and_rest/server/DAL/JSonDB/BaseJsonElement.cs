using eitanm_supercom_assignment.DAL.Base;
using Newtonsoft.Json;

namespace eitanm_supercom_assignment.DAL.JSonDB
{
    public class BaseJsonElement : BaseElement
    {
        public new long ID
        {
            get { return (int)base.ID; }
            set { base.ID = value; }
        }
    }
}
