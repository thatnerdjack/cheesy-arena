// Copyright 2014 Team 254. All Rights Reserved.
// Author: pat@patfairbank.com (Patrick Fairbank)
//
// Client-side methods for editing a match in the match review page.

var scoreTemplate = Handlebars.compile($("#scoreTemplate").html());
var allianceResults = {};

// Hijack the form submission to inject the data in JSON form so that it's easier for the server to parse.
$("form").submit(function() {
  updateResults("red");
  updateResults("blue");

  var redScoreJson = JSON.stringify(allianceResults["red"].score);
  var blueScoreJson = JSON.stringify(allianceResults["blue"].score);
  var redCardsJson = JSON.stringify(allianceResults["red"].cards);
  var blueCardsJson = JSON.stringify(allianceResults["blue"].cards);

  // Inject the JSON data into the form as hidden inputs.
  $("<input />").attr("type", "hidden").attr("name", "redScoreJson").attr("value", redScoreJson).appendTo("form");
  $("<input />").attr("type", "hidden").attr("name", "blueScoreJson").attr("value", blueScoreJson).appendTo("form");
  $("<input />").attr("type", "hidden").attr("name", "redCardsJson").attr("value", redCardsJson).appendTo("form");
  $("<input />").attr("type", "hidden").attr("name", "blueCardsJson").attr("value", blueCardsJson).appendTo("form");

  return true;
});

// Draws the match-editing form for one alliance based on the cached result data.
var renderResults = function(alliance) {
  var result = allianceResults[alliance];
  var scoreContent = scoreTemplate(result);
  $("#" + alliance + "Score").html(scoreContent);

  // Set the values of the form fields from the JSON results data.
  $("input[name=" + alliance + "AutoRuns]").val(result.score.AutoRuns);
  $("input[name=" + alliance + "AutoOwnershipPoints]").val(result.score.AutoOwnershipPoints);
  $("input[name=" + alliance + "AutoEndSwitchOwnership]").prop("checked", result.score.AutoEndSwitchOwnership);

  $("input[name=" + alliance + "TeleopOwnershipPoints]").val(result.score.TeleopOwnershipPoints);
  $("input[name=" + alliance + "VaultCubes]").val(result.score.VaultCubes);
  $("input[name=" + alliance + "Levitate]").prop("checked", result.score.Levitate);
  $("input[name=" + alliance + "Climbs]").val(result.score.Climbs);
  $("input[name=" + alliance + "Parks]").val(result.score.Parks);

  if (result.score.Fouls != null) {
    $.each(result.score.Fouls, function(k, v) {
      $("input[name=" + alliance + "Foul" + k + "Team][value=" + v.TeamId + "]").prop("checked", true);
      $("input[name=" + alliance + "Foul" + k + "RuleNumber]").val(v.RuleNumber);
      $("input[name=" + alliance + "Foul" + k + "IsTechnical]").prop("checked", v.IsTechnical);
      $("input[name=" + alliance + "Foul" + k + "Time]").val(v.TimeInMatchSec);
    });
  }

  if (result.cards != null) {
    $.each(result.cards, function(k, v) {
      $("input[name=" + alliance + "Team" + k + "Card][value=" + v + "]").prop("checked", true);
    });
  }
}

// Converts the current form values back into JSON structures and caches them.
var updateResults = function(alliance) {
  var result = allianceResults[alliance];
  var formData = {}
  $.each($("form").serializeArray(), function(k, v) {
    formData[v.name] = v.value;
  });

  result.score.AutoRuns = parseInt(formData[alliance + "AutoRuns"]);
  result.score.AutoOwnershipPoints = parseInt(formData[alliance + "AutoOwnershipPoints"]);
  result.score.AutoEndSwitchOwnership = formData[alliance + "AutoEndSwitchOwnership"] === "on";
  result.score.TeleopOwnershipPoints = parseInt(formData[alliance + "TeleopOwnershipPoints"]);
  result.score.VaultCubes = parseInt(formData[alliance + "VaultCubes"]);
  result.score.Levitate = formData[alliance + "Levitate"] === "on";
  result.score.Climbs = parseInt(formData[alliance + "Climbs"]);
  result.score.Parks = parseInt(formData[alliance + "Parks"]);

  result.score.Fouls = [];
  for (var i = 0; formData[alliance + "Foul" + i + "Time"]; i++) {
    var prefix = alliance + "Foul" + i;
    var foul = {TeamId: parseInt(formData[prefix + "Team"]), RuleNumber: formData[prefix + "RuleNumber"],
                IsTechnical: formData[prefix + "IsTechnical"] === "on",
                TimeInMatchSec: parseFloat(formData[prefix + "Time"])};
    result.score.Fouls.push(foul);
  }

  result.cards = {};
  $.each([result.team1, result.team2, result.team3], function(i, team) {
    result.cards[team] = formData[alliance + "Team" + team + "Card"];
  });
}

// Appends a blank foul to the end of the list.
var addFoul = function(alliance) {
  updateResults(alliance);
  var result = allianceResults[alliance];
  result.score.Fouls.push({TeamId: 0, Rule: "", TimeInMatchSec: 0})
  renderResults(alliance);
}

// Removes the given foul from the list.
var deleteFoul = function(alliance, index) {
  updateResults(alliance);
  var result = allianceResults[alliance];
  result.score.Fouls.splice(index, 1);
  renderResults(alliance);
}
