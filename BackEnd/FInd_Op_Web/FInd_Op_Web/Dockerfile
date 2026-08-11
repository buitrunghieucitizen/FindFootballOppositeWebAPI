FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["FInd_Op_Web.csproj", "./"]
RUN dotnet restore "FInd_Op_Web.csproj"
COPY . .
RUN dotnet publish "FInd_Op_Web.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "FInd_Op_Web.dll"]
