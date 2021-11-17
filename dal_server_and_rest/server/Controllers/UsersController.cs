using eitanm_supercom_assignment.DAL.Base;
using eitanm_supercom_assignment.DAL.JSonDB;
using eitanm_supercom_assignment.Models.Structure;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace eitanm_supercom_assignment.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IDBConnector connector;
        private readonly IDBEntity<Users>? usersEntity;
        private readonly IDBEntity<Locations>? locationsEntity;

        public IDBConnector Connector => connector;
        public IDBEntity<Users>? UsersEntity => usersEntity;
        public IDBEntity<Locations>? LocationsEntity => locationsEntity;

        private readonly bool isJson;

        public UsersController(IDBConnector connector, IDBEntityContext entityContext)
        {
            this.connector = connector;
            isJson = connector is DBJsonConnector;
            usersEntity = entityContext.Users;
            locationsEntity = entityContext.Locations;
        }

        [HttpGet]
        public IList<Users>? GetUsers()
        {
            // return minimal list columns
            return usersEntity?
                .GetAll()
                .Select(s => 
                new Users { ID = s.ID, FirstName = s.FirstName, LastName = s.LastName }
                ).ToList();
        }

        [HttpGet("GetUserData/{id}")]
        public Users? GetUserData(long id)
        {
            return usersEntity?.GetSingle(f => (long)f.ID == id, f => f);
        }

        [HttpPost("Add")]
        public void Add([FromBody] Users user)
        {
            bool addOk = user.HashID != null && (isJson && user.HashID.Equals("0") || !isJson && user.HashID.Equals(""));
            if (addOk)
            {
                usersEntity?.Add(new Users[] { user });
            }
        }

        [HttpPut("Update")]
        public void Put([FromBody] Users user)
        {
            if (!string.IsNullOrEmpty(user.HashID))
            {
                usersEntity?.Update(new Users[] { user });
            }
        }

        [HttpDelete("Delete/{id}")]
        public void Delete(string id)
        {
            if (!string.IsNullOrEmpty(id))
            {
                Users? user = usersEntity?.GetSingle(f => f.HashID != null && f.HashID.Equals(id));
                if (user != null)
                {
                    usersEntity?.Remove(new Users[] {  user }) ;
                }
            }
        }
    }
}
