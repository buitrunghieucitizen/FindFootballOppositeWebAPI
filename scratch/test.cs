using System;
using System.IO;
using System.Text.RegularExpressions;

class Program {
    static void Main() {
        var files = Directory.GetFiles("../FrontEnd/FrontendReact/src", "*.jsx", SearchOption.AllDirectories);
        foreach(var file in files) {
            var text = File.ReadAllText(file);
            if (text.Contains("FiSearch")) {
                bool hasImport = Regex.IsMatch(text, @"import\s+[^;]*FiSearch[^;]*\s+from", RegexOptions.Singleline);
                if (!hasImport) {
                    Console.WriteLine("Missing import in: " + file);
                }
            }
        }
    }
}
