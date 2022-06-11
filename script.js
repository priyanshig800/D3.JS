// Selecting the svg element
let drawSpace = d3.select("#drawspace");
// Reading the datasets and the geoJSON file for India
Promise.all([d3.json("states.json"), d3.csv("Road_accidents.csv"), d3.csv("Person_injured.csv"),d3.csv("person_killed.csv")]).then(showData);

var mapInfo, reqData, drawSpaceW, drawSpaceH, cropInfo, accInfo, deathInfo, injuryInfo;

// making dataTypeMap for dropdowns
const dataTypeMap1 = new Map();
const dataTypeMap2 = new Map();

function showData(datasources) {
  drawSpaceH = 700;
  drawSpaceW = 700;

  // Saving the array read file into variables
  mapInfo = datasources[0];
  accInfo = datasources[1];
  injuryInfo = datasources[2];
  deathInfo = datasources[3];

  dataTypeMap1.set("Number of Accidents", 0);
  dataTypeMap1.set("Number of Deaths", 1);
  dataTypeMap1.set("Number of Injuries", 2);

  //Making a drop down list of data
  let sel = "";
  dataTypeMap1.forEach(
    (val, keys) => (sel += `<option value="${keys}">${keys}</option>`)
  );
  document.getElementById("data").innerHTML = sel;
  document.getElementById("data").value = dataTypeMap1.keys().next().value;
 
  dataTypeMap2.set("2015", 0);
  dataTypeMap2.set("2016", 1);
  dataTypeMap2.set("2017", 2);
  dataTypeMap2.set("2018", 3);

  let selc = "";
  dataTypeMap2.forEach(
    (val, keys) => (selc += `<option value="${keys}">${keys}</option>`)
  );
  document.getElementById("year").innerHTML = selc;
  // document.getElementById("year").value = dataTypeMap2.keys().next().value;

  map();
}

function map() {
  //Making a list of states in the data
  let states = [...new Set(accInfo.map((d) => d.name))];
  //taking input from user of year and dataType
  let yearReq = document.getElementById("year").value;
  let dataTypeReq = document.getElementById("data").value;

  let dataCol = {};

  if(dataTypeReq=="Number of Accidents"){
      accInfo.forEach(e=>{
        let state = e.name;
        console.log(state);
        if (yearReq == "2015") {dataCol[state] = (+e.data_2015);}
        else if (yearReq == "2016") {dataCol[state] = (+e.data_2016);}
        else if (yearReq == "2017") {dataCol[state] = (+e.data_2017);}
        else {dataCol[state] = (+e.data_2018);}
      })
    }

  else if(dataTypeReq=="Number of Deaths"){
      deathInfo.forEach(e=>{
      let state = e.name;
      console.log(state);
      if (yearReq == "2015") {dataCol[state] = (+e.data_2015);}
      else if (yearReq == "2016") {dataCol[state] = (+e.data_2016);}
      else if (yearReq == "2017") {dataCol[state] = (+e.data_2017);}
      else {dataCol[state] = (+e.data_2018);}
    })
  }
  else {
      injuryInfo.forEach(e=>{
      let state = e.name;
      console.log(state);
      if (yearReq == "2015") {dataCol[state] = (+e.data_2015);}
      else if (yearReq == "2016") {dataCol[state] = (+e.data_2016);}
      else if (yearReq == "2017") {dataCol[state] = (+e.data_2017);}
      else {dataCol[state] = (+e.data_2018);} 
      })
  }

      mapInfo.features = mapInfo.features.map((d) => 
      {
      let stateName = d.properties.st_nm 
      let areawiseData = dataCol[stateName] 
      d.properties.areawiseData = areawiseData
      return d;
      })

      console.log(mapInfo.features)

      let maxData = d3.max(
        mapInfo.features,
        (d) => d.properties.areawiseData
      );
      console.log(maxData);

  //Color Scale for the data
let cScale = d3.scaleLinear().domain([0, maxData]).range(["#FFD68A", "red"]);

// removing the already created svgs before redrawing the new one
drawSpace.select("g").remove();
drawSpace.selectAll("path").remove();

let text ="";
if(dataTypeReq=="Number of Deaths"){text = "Number of deaths"}
else if(dataTypeReq=="Number of Accidents"){text = "Number of Accidents"}
else {text = "Number of injured people"}

//  Using geoMercator for our map projection
let myProjection = d3.geoMercator().scale(1150).translate([-1350,820]);
let geoPath = d3.geoPath().projection(myProjection);


let mOver = function(d){
  d3.selectAll(".state")
    .style("opacity","0.6")

  d3.select(this)
    .style("opacity","1")
    .style("stroke","black")
}

let mLeave = function(d){
  d3.selectAll(".state")
    .style("opacity","0.75")
    .style("stroke","grey")  
  }

  drawSpace.selectAll("path")
  .data(mapInfo.features)
  .enter()
  .append("path")
  .attr("d", (d) => geoPath(d))
  .attr("stroke", "grey")
  .attr("class","state")
  .attr("fill", (d) => d.properties.areawiseData ? cScale(d.properties.areawiseData) : "white" )
  .style("opacity",0.75)
  .on("mouseover",mOver)
  .on("mouseleave",mLeave)
  .append("title") 
  .text((d) =>`${d.properties.st_nm}\n`+ text.concat(` :- ${
          d.properties.areawiseData ? d.properties.areawiseData : 0
        }`))      
}





