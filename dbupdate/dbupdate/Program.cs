using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using Excel = Microsoft.Office.Interop.Excel;

namespace dbupdate
{
    class Program
    {
        static void Main(string[] args)
        {
            DBConnect conn = new DBConnect();

            Excel.Application xlApp = new Excel.Application();
            Excel.Workbook xlWorkbook = xlApp.Workbooks.Open(@"..\voicepong\LyricsData.xlsx");
            Excel._Worksheet xlWorksheet = xlWorkbook.Sheets[1];
            Excel.Range xlRange = xlWorksheet.UsedRange;

            int rowCount = xlRange.Rows.Count;
            int colCount = xlRange.Columns.Count;

            string id = null, artist = null, title = null, lyrics = null, sql = null;
            int cFaults = 0;
            for (int i = 1; i <= rowCount; i++)
            {
                //write the value to the console
                if (xlRange.Cells[i, 1] != null && xlRange.Cells[i, 1].Value2 != null)
                    id = xlRange.Cells[i, 1].Value2.ToString();

                if (xlRange.Cells[i, 2] != null && xlRange.Cells[i, 2].Value2 != null)
                    artist = xlRange.Cells[i, 2].Value2.ToString();

                if (xlRange.Cells[i, 3] != null && xlRange.Cells[i, 3].Value2 != null)
                    title = xlRange.Cells[i, 3].Value2.ToString();

                if (xlRange.Cells[i, 4] != null && xlRange.Cells[i, 4].Value2 != null)
                    lyrics = xlRange.Cells[i, 4].Value2.ToString();

                if (id != null && artist != null && title != null && lyrics != null && i > 27)
                {
                    sql = "INSERT INTO `Songs` VALUES('" + id + "', \"" + artist + "\", \"" + title + "\", \"" + lyrics + "\")";
                    try
                    {
                        conn.NonQuery(sql);
                    }
                    catch(Exception ex)
                    {
                        Console.WriteLine("Could not parse id:" + id);
                        cFaults++;
                    }
                }
            }

            Console.WriteLine("Ended with " + cFaults + " faults.");

            //cleanup
            GC.Collect();
            GC.WaitForPendingFinalizers();

            //rule of thumb for releasing com objects:
            //  never use two dots, all COM objects must be referenced and released individually
            //  ex: [somthing].[something].[something] is bad

            //release com objects to fully kill excel process from running in the background
            Marshal.ReleaseComObject(xlRange);
            Marshal.ReleaseComObject(xlWorksheet);

            //close and release
            xlWorkbook.Close();
            Marshal.ReleaseComObject(xlWorkbook);

            //quit and release
            xlApp.Quit();
            Marshal.ReleaseComObject(xlApp);
        }
    }
}
