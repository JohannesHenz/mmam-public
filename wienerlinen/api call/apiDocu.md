The api.js file makes an asynch API call to Wiener Linien an fetches the following Infos from the URL Parameters:
1. monitorTitle (e.g. Schottentor U)
2. lineInfo (which includes:)
  
      a. name of the line (e.g. 37)
      b. towards (e.g.Hohe Warte)
      c. departureTime (e.g. 20:37:14)



For testing purposes I included a proxyServer.js file which only bypasses CORS Errors 
I first installed this: "npm install cors-anywhere" and then ran the server like this:
To start that simply type: "node proxyServer.js"
This will be changed in the future



For now the data from the API Call is being written into a div in the testing.html file, but this will be changed later so send the data to the correct endpoint

An Example API Call would look like this:


"http://127.0.0.1:5500/wienerlinen/api%20call/testing.html?stopId=1212"

Here I am running a localhost Live Server on Port 5500
And I am checking the info for the Stop with stopId 1212 which is Schottentor
This should be the expected result:

"Wiener Linien API Test
Monitor 1:
{
  "monitorTitle": "Schottentor U",
  "lineInfo": [
    {
      "name": "37",
      "towards": "Hohe Warte",
      "departureTime": "21:04:12"
    }
  ]
}
Monitor 2:
{
  "monitorTitle": "Schottentor U",
  "lineInfo": [
    {
      "name": "38",
      "towards": "Grinzing",
      "departureTime": "20:49:34"
    }
  ]
}
Monitor 3:
{
  "monitorTitle": "Schottentor U",
  "lineInfo": [
    {
      "name": "40",
      "towards": "Gersthof, Herbeckstraße",
      "departureTime": "20:54:27"
    }
  ]
}
Monitor 4:
{
  "monitorTitle": "Schottentor U",
  "lineInfo": [
    {
      "name": "41",
      "towards": "Pötzleinsdorf",
      "departureTime": "20:59:40"
    }
  ]
}
Monitor 5:
{
  "monitorTitle": "Schottentor U",
  "lineInfo": [
    {
      "name": "42",
      "towards": "Antonigasse",
      "departureTime": "20:54:34"
    }
  ]
}
"