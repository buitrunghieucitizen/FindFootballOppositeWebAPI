# Database setup

1. Open SQL Server Management Studio.
2. Run `Database/FindFootballOpWeb_Database.sql`.
3. Confirm that the database `FindFootballOppositeWeb` is created with sample data.
4. Update `appsettings.Development.json` if your SQL Server instance is different.

Example connection string:

`Server=localhost,1433;Database=FindFootballOppositeWeb;User Id=sa;Password=123;Encrypt=True;TrustServerCertificate=True`

If you use SQL authentication:

`Server=localhost,1433;Database=FindFootballOppositeWeb;User Id=sa;Password=123;Encrypt=True;TrustServerCertificate=True`

Notes:

- The Spring config you provided pointed to `ShoesOnlineShop`, which belongs to another project.
- This ASP.NET project uses the database name created by `Database/FindFootballOpWeb_Database.sql`, which is `FindFootballOppositeWeb`.

Current status in this repo:

- UI already follows the template and uses seeded demo data from `Services/PortalDataService.cs`.
- Next implementation step is replacing that service with a repository or DbContext connected to SQL Server.
