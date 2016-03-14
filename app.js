var nba = require("nba");
var moment = require("moment");
var express = require("express");
var fs = require('fs');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var nbaDailyScheduleSchema = new Schema({ schedule: {} });
var nbaDailySchedule = mongoose.model('nbaDailySchedule', nbaDailyScheduleSchema);

mongoose.connect('mongodb://localhost/nbaDaily');

var db = mongoose.connection;

db.on('error', console.error.bind(console, "connection error:"));
db.once('open', function() {
  console.log("mongo connection successful!");
});

var CronJob = require('cron').CronJob;
var job = new CronJob({
  // cronTime: '0 */2 * * * *', // every 2 min, but data isn't fresh
  cronTime: '0 0 7 * * *',
  onTick: function() {
    var today = moment().format("MM/DD/YYYY");

    nba.stats.scoreboard({ gameDate: today }, function(err, res) {

      var schedule = new nbaDailySchedule({ schedule: res });
      schedule.save(function(err) {
        if(err) return handleError(err);
        if(!err) console.log("["+moment().format("MM-DD-YYYY @ HH:mm:ss] - ") + "data saved to mongo!");
      });

    });
  },
  start: true,
  runOnInit: true
});

var app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

function getDailySchedule(cb) {
  nbaDailySchedule.find().sort( { _id : -1 } ).limit(1).exec(function(err, scheduleData) {
    cb(scheduleData[0].schedule);
  });
}

// For production: '/' becomes '/nba-today'
// Also, index.ejs needs all paths to be prefaced with '/nba-today'
app.get('/', function(req, res) {

  getDailySchedule(function(schedule) {

    var matchups = [];

    // combine east/west rosters so it can be looped through later
    var allTeams = schedule.eastConfStandingsByDay.concat(schedule.westConfStandingsByDay);

    schedule.gameHeader.forEach(function(el, index, arr) {

      // relevant stats
      var lastMeeting = schedule.lastMeeting[index], // this assumes the same order as the gameHeader, doesn't it?
          matchupId = el.gameId;

      var homeTeamId = el.homeTeamId,
          // homeTeamCity = lastMeeting.lastGameHomeTeamCity,
          // homeTeamName = lastMeeting.lastGameHomeTeamName,
          // homeTeamAbbreviation = lastMeeting.lastGameHomeTeamAbbreviation,
          homeTeamCity = "",
          homeTeamName = "",
          homeTeamAbbreviation = "",
          homeTeamWins = 0,
          homeTeamLosses = 0,
          homeTeamHomeRecord = "",
          homeTeamRoadRecord = "",
          homeTeamScore = 0,
          visitorTeamId = el.visitorTeamId,
          // visitorTeamCity = lastMeeting.lastGameVisitorTeamCity,
          // visitorTeamName = lastMeeting.lastGameVisitorTeamName,
          // visitorTeamAbbreviation = lastMeeting.lastGameVisitorTeamCity1,
          visitorTeamCity = "",
          visitorTeamName = "",
          visitorTeamAbbreviation = "",
          visitorTeamWins = 0,
          visitorTeamLosses = 0,
          visitorTeamHomeRecord = "",
          visitorTeamRoadRecord = "",
          visitorTeamScore = 0;

      // loop through roster to find home/away team stats
      allTeams.forEach(function(el, index, arr) {
        if(homeTeamId === el.teamId) {
          homeTeamWins = el.w;
          homeTeamLosses = el.l;
          homeTeamHomeRecord = el.homeRecord;
          homeTeamRoadRecord = el.roadRecord;
        }
        else if(visitorTeamId === el.teamId) {
          visitorTeamWins = el.w;
          visitorTeamLosses = el.l;
          visitorTeamHomeRecord = el.homeRecord;
          visitorTeamRoadRecord = el.roadRecord;
        }
      });

      // loop through last meeting for some secondary info
      schedule.lastMeeting.forEach(function(el, index, arr) {
        if(homeTeamId === el.lastGameHomeTeamId) {
          homeTeamCity = el.lastGameHomeTeamCity;
          homeTeamName = el.lastGameHomeTeamName;
        }
        if(visitorTeamId === el.lastGameVisitorTeamId) {
          visitorTeamCity = el.lastGameVisitorTeamCity;
          visitorTeamName = el.lastGameVisitorTeamName;
        }
      });

      schedule.lineScore.forEach(function(el, index, arr) {
        if(matchupId === el.gameId && el.teamId === homeTeamId) {
          homeTeamScore = el.pts;
        }
        else if(matchupId === el.gameId && el.teamId === visitorTeamId) {
          visitorTeamScore = el.pts;
        }
      });

      // add stats to matchups array
      matchups.push({
        date: schedule.gameHeader[index].gameDateEst,
        time: schedule.gameHeader[index].gameStatusText,
        gameId: schedule.gameHeader[index].gameId,
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
