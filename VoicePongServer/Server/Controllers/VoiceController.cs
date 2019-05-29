using Server.Models;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Web.Mvc;

namespace Server.Controllers
{
    public class VoiceController : Controller
    {
        // GET: Voice
        public JsonResult FindSong(string phrase)
        {
            DBConnection conn = new DBConnection();
            List<string>[] songs = conn.QuerySongs("SELECT `title`,`artist` from `Songs` where `lyrics` like '%" + phrase + "%' group by `title`,`artist`");

            if (songs[0].Count == 1)
            {
                if (songs[0][0].StartsWith("\n"))
                    songs[0][0] = songs[0][0].Substring(1);

                if (songs[0][0].EndsWith("\n"))
                    songs[0][0] = songs[0][0].Substring(0, songs[0][0].Length - 1);

                if (songs[1][0].StartsWith("\n"))
                    songs[1][0] = songs[1][0].Substring(1);

                if (songs[1][0].EndsWith("\n"))
                    songs[1][0] = songs[1][0].Substring(0, songs[1][0].Length - 1);

                string url = getUrl(songs[0][0] + " " + songs[1][0]);
                
                return Json("{\"result\": \"true\", \"url\": \"" + url + "\"}");
            }

            string[] words = phrase.Split(' ');
            string newPhrase = "%";

            foreach (string word in words)
            {
                newPhrase += word + "%";
            }

            songs = conn.QuerySongs("SELECT `title`,`artist` from `Songs` where `lyrics` like '" + newPhrase + "' group by `title`,`artist`");

            if(songs[0].Count == 1)
            {
                if (songs[0][0].StartsWith("\n"))
                    songs[0][0] = songs[0][0].Substring(1);

                if (songs[0][0].EndsWith("\n"))
                    songs[0][0] = songs[0][0].Substring(0, songs[0][0].Length - 1);

                if (songs[1][0].StartsWith("\n"))
                    songs[1][0] = songs[1][0].Substring(1);

                if (songs[1][0].EndsWith("\n"))
                    songs[1][0] = songs[1][0].Substring(0, songs[1][0].Length - 1);

                string url = getUrl(songs[0][0] + " " + songs[1][0]);
                return Json("{\"result\": \"true\", \"url\": \"" + url + "\"}");
            }

            return Json("{\"result\": \"false\", \"url\": \"null\"}");
        }

        public string getUrl(string args)
        {
            ProcessStartInfo start = new ProcessStartInfo();
            start.FileName = "C:\\Users\\noamv\\AppData\\Local\\Programs\\Python\\Python37\\python.exe";
            start.Arguments = string.Format("C:\\Users\\noamv\\Desktop\\VoicePong\\voicepong\\FetchURL.py \"{0}\"", args);
            start.UseShellExecute = false;
            start.RedirectStandardOutput = true;

            using (Process process = Process.Start(start))
            {
                using (StreamReader reader = process.StandardOutput)
                {
                    string result = reader.ReadToEnd();
                    return result;
                }
            }
        }
    }
}