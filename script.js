//index from 1
var SCORE_COLUMN_NO = 7;
var TITLE_COLUMN_NO = 1;

var SHEET_NAME = "Movie List";

var API_URL = "www.omdbapi.com/";
var IMDB_URL = "www.imdb.com/title/";

//global
var ss = SpreadsheetApp.getActive();
var sh = ss.getSheetByName(SHEET_NAME);
var lRow = sh.getLastRow(), lCol = sh.getLastColumn();


function myOnEdit(e){
  getEmptyScoreRows();
}

function getEmptyScoreRows(){
  //Start from 2 to account for headers
  var allCellsRange = sh.getRange(2, 1, lRow, lCol);
  
  //Split into two lists so that empty scores are prioritized before checking n/a ones
  var rowNoList = [];
  var naList = [];
  
  for (var i = 1; i < allCellsRange.getNumRows(); i++) {
    var scoreValue = allCellsRange.getCell(i, SCORE_COLUMN_NO).getValue();
    if (scoreValue === "") {
      //increment i to account for headers
      rowNoList.push(i + 1);
    } else if (scoreValue === "N/A") {
      naList.push(i + 1); 
    }
  }
  
  addRTScores(rowNoList);
  addRTScores(naList);
  
}

function addRTScores(emptyScoreRowNos) {
  for (var i = 0; i < emptyScoreRowNos.length; i++){
    var row = sh.getRange(emptyScoreRowNos[i] , 1, 1, lCol);
    var title = row.getCell(1, TITLE_COLUMN_NO).getValue();

    var params = getRTScore(title);
    var score = params.tomatoMeter;
    
    var scoreCol = row.getCell(1, SCORE_COLUMN_NO);
    
    if (score === undefined || score === "N/A"){
      scoreCol.setValue("N/A");
    } else {
      scoreCol.setFormula("=HYPERLINK(\"" + params.tomatoURL + "\",\"" + score + "%\")");
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
