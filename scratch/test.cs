using System;
using System.Data.SqlClient;

class Program {
    static void Main() {
        string connStr = "workstation id=findfootball.mssql.somee.com;packet size=4096;user id=Lemonsumo982005_SQLLogin_1;pwd=3jyrpc9sgs;data source=findfootball.mssql.somee.com;persist security info=False;initial catalog=findfootball;TrustServerCertificate=True";
        using(var conn = new SqlConnection(connStr)) {
            conn.Open();
            using(var cmd = new SqlCommand("UPDATE Users SET IsTwoFactorEnabled = 0, TwoFactorSecret = NULL;", conn)) {
                int rows = cmd.ExecuteNonQuery();
                Console.WriteLine("Updated " + rows + " users.");
            }
        }
    }
}
