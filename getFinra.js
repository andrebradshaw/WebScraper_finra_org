var ss = SpreadsheetApp.openById("YOUR_ID_goes_here");
var s1 = ss.getSheetByName("Sheet1");
function partition(items, size) {
    var p = [];
    for (var i=Math.floor(items.length/size); i-->0; ) {
        p[i]=items.slice(i*size, (i+1)*size);
    }
    return p;
}

function fixCase(fullname){ 
if(fullname != undefined){
    return fullname.replace(/\w\S*/g, function(txt){
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}else{
  return '';
}
}

//function un(s){if(s != undefined){ return s;}else{ return ''}}
function dater(d){ if(typeof d === "number"){ return new Date(d); }else{ return '';}}

function jsonToCsv(resps){
var containArr = [];
for(r=0; r<resps.length; r++){
  var resp = resps[r].toString().replace(/\n|\r/g, '');
  var peopleRes = JSON.parse(resp).results.BROKER_CHECK_REP.results;
  for(i=0; i<peopleRes.length; i++) {
    var res = peopleRes[i].fields;
    var curEmplArr = res.bc_current_employments[0]; //need to build a function to check active status of employements in list and return only the first one listed as active.
    var firmName = curEmplArr.bc_firm_name;
    var firmStart = dater(curEmplArr.bc_reg_begin_date);
    var firmGeo = curEmplArr.bc_branch_location;
    var firmStreet = curEmplArr.bc_branch_street1;
    var firmSuite = curEmplArr.bc_branch_street2;
    var firmCity = curEmplArr.bc_branch_city;
    var altCity = curEmplArr.bc_branch_city_alias.toString();
    var firmState = curEmplArr.bc_branch_state;
    var firmZip = curEmplArr.bc_branch_zip;
    var firmId = curEmplArr.bc_firm_id;
    var branchId = curEmplArr.bc_branch_id;
    
    var infraId = res.bc_source_id;
    var firstname = fixCase(res.bc_firstname);
    var lastname = fixCase(res.bc_lastname);
    var middlename = fixCase(res.bc_middlename);
    var status = res.bc_ia_scope;
    var industryStart = dater(res.bc_industry_cal_date);
    var defaultEmpl = res.bc_default_employment;
    var disclosure = res.bc_disclosure_fl;

    var arr = new Array(infraId,firstname,middlename,lastname,status,industryStart,defaultEmpl,disclosure,firmName,firmStart,firmGeo,firmStreet,firmSuite,firmCity,altCity,firmState,firmZip,firmId,branchId);
    containArr.push(arr);
  }
}
  return containArr;
}
function getjson(){
  var url = "https://doppler.finra.org/doppler-lookup/api/v1/search/individuals?lat=33.924714&lon=-84.337984&nrows=24&r=25&sort=score+desc&wt=json&start=";
  var resp1 = UrlFetchApp.fetch(url+"0").toString().replace(/\n|\r/g, '');
  var totalResults = JSON.parse(resp1).results.BROKER_CHECK_REP.totalResults;

  function iterateUrl(url, totalResults){
	var totalIterations = Math.ceil(totalResults/24);
	var urlArray = [];
	for(i=0; i<totalIterations; i++){
          var start = i*24;
		urlArray.push(url+start);
	}
    return urlArray;
  }
  var urlsArr = partition(iterateUrl(url,totalResults),100);
  for(i=0; i<urlsArr.legnth; i++){//urlsArr.length
  Logger.log(urlsArr.length)
    var datArr = jsonToCsv(UrlFetchApp.fetchAll(urlsArr[i]));
    var next = s1.getLastRow()+1;
    s1.getRange(next, 1, datArr.length,datArr[0].length).setValues(datArr);
  }
}
