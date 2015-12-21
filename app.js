var nba = require("nba");
var moment = require("moment");
var express = require("express");
var fs = require('fs');

var app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', function(req, res) {

  var today = moment().subtract(1, 'days').format("MM/DD/YYYY");
  // var today = moment().format("MM/DD/YYYY");

  nba.stats.scoreboard({gameDate: today}, function(err, response) {

    console.log(response);

    var matchups = [];

    // combine east/west rosters so it can be looped through later
    var allTeams = response.eastConfStandingsByDay.concat(response.westConfStandingsByDay);
    var lineScore = response.lineScore;

    response.gameHeader.forEach(function(el, index, arr) {

      // relevant stats
      var lastMeeting = response.lastMeeting[index],
          matchupId = el.gameId;

      var homeTeamId = el.homeTeamId
        , homeTeamCity = lastMeeting.lastGameHomeTeamCity
        , homeTeamName = lastMeeting.lastGameHomeTeamName
        , homeTeamAbbreviation = lastMeeting.lastGameHomeTeamAbbreviation
        , homeTeamWins = 0
        , homeTeamLosses = 0
        , homeTeamHomeRecord = ""
        , homeTeamRoadRecord = ""
        , homeTeamScore = 0
        , visitorTeamId = el.visitorTeamId
        , visitorTeamCity = lastMeeting.lastGameVisitorTeamCity
        , visitorTeamName = lastMeeting.lastGameVisitorTeamName
        , visitorTeamAbbreviation = lastMeeting.lastGameVisitorTeamCity1
        , visitorTeamWins = 0
        , visitorTeamLosses = 0
        , visitorTeamHomeRecord = ""
        , visitorTeamRoadRecord = ""
        , visitorTeamScore = 0
      ;

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

      lineScore.forEach(function(el, index, arr) {
        if(matchupId == el.gameId && el.teamId == homeTeamId) {
          homeTeamScore = el.pts;
        }
        if(matchupId == el.gameId && el.teamId == visitorTeamId) {
          visitorTeamScore = el.pts;
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
          roadRecord: homeTeamRoadRecord,
          score: homeTeamScore
        },
        visitorTeam: {
          id: visitorTeamId,
          city: visitorTeamCity,
          name: visitorTeamName,
          abbr: visitorTeamAbbreviation,
          wins: visitorTeamWins,
          losses: visitorTeamLosses,
          homeRecord: visitorTeamHomeRecord,
          roadRecord: visitorTeamRoadRecord,
          score: visitorTeamScore
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
