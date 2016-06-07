//index from 1
var SCORE_COLUMN_NO = 7;
var TITLE_COLUMN_NO = 1;

var SHEET_NAME = "Movie List";

var API_URL = "www.omdbapi.com/";
var IMDB_URL = "www.imdb.com/title/";

var ADD_PLOT = true;

//global
var ss = SpreadsheetApp.getActive();
var sh = ss.getSheetByName(SHEET_NAME);
var lRow = sh.getLastRow(), lCol = sh.getLastColumn();


function myOnEdit(e){
  getEmptyScoreRows();
}

function getEmptyScoreRows(){  
  //Split into two lists so that empty scores are prioritized before checking n/a ones
  var rowNoList = [];
  var naList = [];
  
  var allScoresValues = sh.getRange(2, SCORE_COLUMN_NO, lRow, 1).getValues();
  
  for (var i = 0; i < allScoresValues.length; i++) {
    var scoreValue = allScoresValues[i][0];
    
    if (scoreValue === "") {
      //increment i by 2 to account for headers and 0 indexing
      rowNoList.push(i + 2);
    } else if (scoreValue === "N/A") {
      naList.push(i + 2); 
    }
  }
  
  addRTScores(rowNoList);
  addRTScores(naList);
  
}

function addRTScores(emptyScoreRowNos) {
  for (var i = 0; i < emptyScoreRowNos.length; i++){
    var row = sh.getRange(emptyScoreRowNos[i] , 1, 1, lCol);
    var titleCol = row.getCell(1, TITLE_COLUMN_NO);

    if (titleCol.getValue() !== ""){
      var params = getRTScore(titleCol.getValue());
      var score = params.tomatoMeter;
      
      var scoreCol = row.getCell(1, SCORE_COLUMN_NO);
      
      if (score === undefined || score === "N/A"){
        scoreCol.setValue("N/A");
      } else {
        scoreCol.setFormula("=HYPERLINK(\"" + params.tomatoURL + "\",\"" + score + "%\")");
      }
      
      if (ADD_PLOT){
        var plot = params.Plot;
        if (plot !== undefined) titleCol.setNote(plot);
      }
    }
  }
}

function getRTScore(title) {
  //Create URL
  var queryString = "?r=json&tomatoes=true&t=" + title;
  var url = API_URL + queryString;

  var options =
      {
        "method"  : "GET",   
        "followRedirects" : true,
        "muteHttpExceptions": true
      };
  
  //send GET request
  var result = UrlFetchApp.fetch(url, options);

  if (result.getResponseCode() == 200) {
    return JSON.parse(result.getContentText());
  }
}
