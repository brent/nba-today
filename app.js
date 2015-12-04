var nba = require("nba");
var moment = require("moment");
var express = require("express");

var app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', function(req, res) {

  var today = moment().format("MM/DD/YYYY");

  nba.stats.scoreboard({gameDate: today}, function(err, response) {

    var matchups = [];
    // combine east/west rosters so it can be looped through later
    var allTeams = response.eastConfStandingsByDay.concat(response.westConfStandingsByDay);

    response.gameHeader.forEach(function(el, index, arr) {

      // relevant stats
      var lastMeeting = response.lastMeeting[index]
        , homeTeamId = el.homeTeamId
        , homeTeamCity = lastMeeting.lastGameHomeTeamCity
        , homeTeamName = lastMeeting.lastGameHomeTeamName
        , homeTeamAbbreviation = lastMeeting.lastGameHomeTeamAbbreviation
        , homeTeamWins = 0
        , homeTeamLosses = 0
        , homeTeamHomeRecord = ""
        , homeTeamRoadRecord = ""
        , visitorTeamId = el.visitorTeamId
        , visitorTeamCity = lastMeeting.lastGameVisitorTeamCity
        , visitorTeamName = lastMeeting.lastGameVisitorTeamName
        , visitorTeamAbbreviation = lastMeeting.lastGameVisitorTeamCity1
        , visitorTeamWins = 0
        , visitorTeamLosses = 0
        , visitorTeamHomeRecord = ""
        , visitorTeamRoadRecord = "";

      // loop through roster to find home/away team stats
      allTeams.forEach(function(el, index, arr) {
          if(el.teamId === homeTeamId) {
              homeTeamWins = el.w;
              homeTeamLosses = el.l;
              homeTeamHomeRecord = el.homeRecord;
              homeTeamRoadRecord = el.roadRecord;
          }
          if(el.teamId === visitorTeamId) {
              visitorTeamWins = el.w;
              visitorTeamLosses = el.l;
              visitorTeamHomeRecord = el.homeRecord;
              visitorTeamRoadRecord = el.roadRecord;
          }
      });

      // add stats to matchups array
      matchups.push({
        date: response.gameHeader[index].gameDateEst,
        time: response.gameHeader[index].gameStatusText,
        gameId: response.gameHeader[index].gameId,
        homeTeam: {
          id: homeTeamId,
          city: homeTeamCity,
          name: homeTeamName,
          abbr: homeTeamAbbreviation,
          wins: homeTeamWins,
          losses: homeTeamLosses,
          homeRecord: homeTeamHomeRecord,
          roadRecord: homeTeamRoadRecord
        },
        visitorTeam: {
          id: visitorTeamId,
          city: visitorTeamCity,
          name: visitorTeamName,
          abbr: visitorTeamAbbreviation,
          wins: visitorTeamWins,
          losses: visitorTeamLosses,
          homeRecord: visitorTeamHomeRecord,
          roadRecord: visitorTeamRoadRecord
        }
      });

    });

    res.render('index', { matchups: matchups });

  });

});

var server = app.listen(3000, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('listening @ http://localhost:' + port);
});
