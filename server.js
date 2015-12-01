var nba = require("nba");
var moment = require("moment");

var today = moment().format("MM/DD/YYYY");

nba.stats.scoreboard({gameDate: today}, function(err, res) {

    var matchups = []
      , allTeams = res.eastConfStandingsByDay.concat(res.westConfStandingsByDay);

    res.gameHeader.forEach(function(el, index, arr) {

        var lastMeeting = res.lastMeeting[index]
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

        matchups.push({
            date: res.gameHeader[index].gameDateEst,
            time: res.gameHeader[index].gameStatusText,
            gameId: res.gameHeader[index].gameId,
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

   console.log(matchups);

});
