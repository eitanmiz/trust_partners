using Newtonsoft.Json;
// using System.Text.Json.Serialization;

namespace eitanm_supercom_assignment.DAL.Base
{
    public class BaseElement : IBaseElement
    {
        //protected string? _hashId;
        public object ID { get; set; } = 0;
 
        [JsonIgnore]
        public string? HashID { get { return ID.ToString(); } }
    }
}
