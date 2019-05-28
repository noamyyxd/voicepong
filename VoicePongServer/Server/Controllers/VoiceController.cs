using Server.Models;
using System;
using System.Collections.Generic;
using System.Web.Mvc;

namespace Server.Controllers
{
    public class VoiceController : Controller
    {
        // GET: Voice
        public JsonResult FindSong(string phrase)
        {
            DBConnection conn = new DBConnection();
            List<string>[] songs = conn.QuerySongs("SELECT * from `Songs` where `lyrics` like '%" + phrase + "%'");

            if (songs[0].Count >= 1)
            {
                return Json(songs[4][0].ToString());
            }

            string[] words = phrase.Split(' ');
            string newPhrase = string.Empty;

            foreach(string word in words)
            {
                newPhrase += word + " ";
                List<string>[] curr = conn.QuerySongs("SELECT * from `Songs` where `lyrics` like '%" + newPhrase + "%'");

                if(curr[0].Count > 0)
                {
                    foreach(string id in curr[1])
                    {

                    }
                }
            }
        }
    }
}