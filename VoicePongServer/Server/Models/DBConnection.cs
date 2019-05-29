using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;

namespace Server.Models
{
    class DBConnection
    {
        private MySqlConnection connection;
        private string server;
        private string database;
        private string uid;
        private string password;

        //Constructor
        public DBConnection()
        {
            Initialize();
        }

        //Initialize values
        private void Initialize()
        {
            server = "remotemysql.com";
            database = "sxZaoaM2jp";
            uid = "sxZaoaM2jp";
            password = "GkVgSXYqGS";
            string connectionString;
            connectionString = "SERVER=" + server + ";" + "DATABASE=" +
            database + ";" + "UID=" + uid + ";" + "PASSWORD=" + password + ";";

            connection = new MySqlConnection(connectionString);
        }

        //open connection to database
        private bool OpenConnection()
        {
            try
            {
                connection.Open();
                return true;
            }
            catch (MySqlException ex)
            {
                //0: Cannot connect to server.
                //1045: Invalid user name and/or password.
                switch (ex.Number)
                {
                    case 0:
                        throw new Exception( "Cannot connect to server. ");

                    case 1045:
                        throw new Exception("Invalid username/password, please try again");
                }
                return false;
            }
        }

        //Close connection
        private bool CloseConnection()
        {
            try
            {
                connection.Close();
                return true;
            }
            catch (MySqlException ex)
            {
                throw new Exception(ex.Message);
            }
        }

        //Insert statement
        public void NonQuery(string sql)
        {
            string query = sql;

            //open connection
            if (this.OpenConnection() == true)
            {
                try
                {
                    //create command and assign the query and connection from the constructor
                    MySqlCommand cmd = new MySqlCommand(query, connection);

                    //Execute command
                    cmd.ExecuteNonQuery();
                }
                catch (Exception ex) {
                    this.CloseConnection();
                    throw ex;
                }
                //close connection
                this.CloseConnection();
            }
        }

        //Select statement
        public List<string>[] QuerySongs(string sql)
        {
            string query = sql;

            //Create a list to store the result
            List<string>[] list = new List<string>[2];
            list[0] = new List<string>();
            list[1] = new List<string>();

            //Open connection
            if (this.OpenConnection() == true)
            {
                try
                {
                    //Create Command
                    MySqlCommand cmd = new MySqlCommand(query, connection);
                    //Create a data reader and Execute the command
                    MySqlDataReader dataReader = cmd.ExecuteReader();

                    //Read the data and store them in the list
                    while (dataReader.Read())
                    {
                        list[0].Add(dataReader["artist"] + "");
                        list[1].Add(dataReader["title"] + "");
                    }

                    //close Data Reader
                    dataReader.Close();
                }
                catch(Exception ex)
                {
                    this.CloseConnection();
                    throw ex;
                }
                //close Connection
                this.CloseConnection();

                //return list to be displayed
                return list;
            }
            else
            {
                return null;
            }
        }
    }
}