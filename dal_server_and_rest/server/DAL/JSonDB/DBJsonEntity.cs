using eitanm_supercom_assignment.DAL.Base;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System.Linq;
using System.Linq.Expressions;

// https://blog.magnusmontin.net/2013/05/30/generic-dal-using-entity-framework/

namespace eitanm_supercom_assignment.DAL.JSonDB
{
    public class DBJsonEntity<T> : DBEntityBase<T> where T : BaseElement
    {
        public DBJsonEntity(IDBConnector connector) : base(connector)
        {

        }
        private string FileName { get { return Connector != null ? Path.Combine(Connector.ConnectionString, typeof(T).Name + ".json") : ""; } }

        private void SaveList(List<T> list)
        {
            string fileName = FileName;
            JsonData<T> data = new JsonData<T>
            {
                Data = list.ToArray()
            };
            string s = JsonConvert.SerializeObject(data, Formatting.Indented);
            File.WriteAllText(fileName, s);
        }
        public override void Add(params T[] items)
        {
            long maxID = 0;
            List<T> list = (List<T>)GetAll(d => d);
            if (list != null)
            {
                maxID = list.Max(f => (long)f.ID); // in json the id is always long
            } else
            {
                list = new List<T>();
            }
            foreach(T item in items)
            {
                maxID++;
                item.ID = maxID;
                list.Add(item);
            }
            SaveList(list);
        }

        public override IList<T> GetAll(params Expression<Func<T, object>>[] navigationProperties)
        {
            string data = File.ReadAllText(FileName);
            JsonData<T>? fullData = JsonConvert.DeserializeObject<JsonData<T>>(data);
            if (fullData != null && fullData.Data != null)
            {
                return fullData.Data.ToList();
            } else
            {
                return new List<T>();
            }
        }

        public override IList<T> GetList(Func<T, bool> where, params Expression<Func<T, object>>[] navigationProperties)
        {
            string data = File.ReadAllText(FileName);
            JsonData<T>? fullData = JsonConvert.DeserializeObject<JsonData<T>>(data);
            if (fullData != null && fullData.Data != null)
            {
                IQueryable<T> dbQuery = fullData.Data.AsQueryable();
                foreach (Expression<Func<T, object>> navigationProperty in navigationProperties)
                    dbQuery = dbQuery.Include(navigationProperty);

                return dbQuery.ToList();
            }
            else
            {
                return new List<T>();
            }
        }

        public override T? GetSingle(Func<T, bool> where, params Expression<Func<T, object>>[] navigationProperties)
        {
            string data = File.ReadAllText(FileName);
            T? item = null;
            JsonData<T>? fullData = JsonConvert.DeserializeObject<JsonData<T>>(data);
            if (fullData != null && fullData.Data != null)
            {
                IQueryable<T> dbQuery = fullData.Data.AsQueryable();
                foreach (Expression<Func<T, object>> navigationProperty in navigationProperties)
                    dbQuery = dbQuery.Include(navigationProperty);
                if (dbQuery != null && where != null)
                {
                    item = dbQuery.FirstOrDefault(where);
                }
            }
            return item;
        }

        public override void Remove(params T[] items)
        {
            string data = File.ReadAllText(FileName);
            JsonData<T>? fullData = JsonConvert.DeserializeObject<JsonData<T>>(data);
            if (fullData != null && fullData.Data != null)
            {
                List<T> l = fullData.Data.ToList();
                foreach (T item in items)
                {
                    int ind = l.FindIndex(f => f.HashID == item.HashID);
                    if (ind != -1)
                    {
                        l.RemoveAt(ind);
                    }
                }
                SaveList(l);
            }
        }

        public override void Update(params T[] items)
        {
            string data = File.ReadAllText(FileName);
            JsonData<T>? fullData = JsonConvert.DeserializeObject<JsonData<T>>(data);
            if (fullData != null && fullData.Data != null)
            {
                List<T> l = fullData.Data.ToList();
                foreach (T item in items)
                {
                    T? current = l.FirstOrDefault(f => f.HashID == item.HashID);
                    if (current != null)
                    {
                        int ind = l.IndexOf(current);
                        object saveId = l[ind].ID;
                        l[ind] = item;
                        l[ind].ID = saveId;
                    }
                }
                SaveList(l);
            }
        }
    }
}
