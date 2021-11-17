using eitanm_supercom_assignment.DAL.Base;
using eitanm_supercom_assignment.DAL.JSonDB;

namespace eitanm_supercom_assignment.Models.Structure
{
    public class Users: BaseElement
    {
        public string? UserName { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public int? TimeZone { get; set; }
        public string? WebSite { get; set; }
        public string? PhoneSkype { get; set; }
        public string? AboutMe { get; set; }
    }
}
