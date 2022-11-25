/**
 * Output 
 * @type {object}
 */
const output = document.getElementById("output");

/**
 * Money 
 * @type {object}
 */
const Money = document.getElementById("money")
/**
 * Settingup Ace
 * @type {object}
 */
let codeEditor = ace.edit("editorCode");
output.value = "Initializing...\n";

/**
 * Default code provider
 * @type {string}
 */
let defaultcode = "#Initially you have a credit of 100 with you\n#moveTo(a): Moves the warrior to position 'a' only if 'a' is adjacent to the current position\n#collect(): Collects the gem\n#Green Gem: On collecting green gem amount of credits with you doubles\n#Red Gem: On collecting red gem amount of credits with you becomes half\n#Pink Gem: On collecting pink gem amount of credits with you decreases by 40\n#Blue Gem: On collecting blue gem amount of credits with you increases by 50\n#By the end of the game you should have 130 credits\n";

/**
 * Configuring Ace Properties
 * @type {object}
 */
let editorLib = {
    init() {
        // Theme
        codeEditor.setTheme("ace/theme/xcode");
        // Set language
        codeEditor.session.setMode("ace/mode/python");
        // Set Options
        codeEditor.setOptions({
            fontFamily: 'monospace',
            fontSize: '13pt',
            autoScrollEditorIntoView: true,
            enableLiveAutocompletion: true,
            highlightActiveLine: true,
            highlightSelectedWord: true,
            cursorStyle:"slim"
        });
        // Set Default Code
        codeEditor.setValue(defaultcode);        
    }
}

/**
 * Position of the warrior
 * @type {number}
 */
let position = 0;

/**
 * Count of number of points in arena
 * @type {number}
 */
const no_of_points = 8;

/**
 * Direction in which warrior is facing
 * @type {number}
 */
let left_right = 1;

/**
 * Money
 * @type {number}
 */
let money = 100;

/**
 * Array to track each position and its neighbouring positions
 * @type {Array<number>}
 */
let points = new Array(no_of_points);
//Points for warrior
points[0] = [3,48,1];
points[1] = [10,72,0,2];
points[2] = [28,72,1,3];
points[3] = [45,72,2,4];
points[4] = [50,50,3,5];
points[5] = [65,48,4,6];
points[6] = [65.1,30,5,7];
points[7] = [65.2,5,6];

/**
 * Positions of the gems
 * @type {Array<number>}
 */
let gems = new Array(6);
gems[0] = [14,70];
gems[1] = [32.5,70];
gems[2] = [49.5,70];
gems[3] = [54.5,47];
gems[4] = [69.5,43];
gems[5] = [69.5,23];

/**
 * Random Numbers
 * @type {Array<number>}
 */
let arr=[];
while(arr.length<4){
  var diode = Math.floor(Math.random()*6)+1;
  if(arr.indexOf(diode)===-1) arr.push(diode);
}
console.log(arr)
document.getElementById("g1").style.top = gems[arr[0]-1][1] + '%';
document.getElementById("g1").style.left = gems[arr[0]-1][0] + '%';
document.getElementById("g2").style.top = gems[arr[1]-1][1] + '%';
document.getElementById("g2").style.left = gems[arr[1]-1][0] + '%';
document.getElementById("g3").style.top = gems[arr[2]-1][1] + '%';
document.getElementById("g3").style.left = gems[arr[2]-1][0] + '%';
document.getElementById("g4").style.top = gems[arr[3]-1][1] + '%';
document.getElementById("g4").style.left = gems[arr[3]-1][0] + '%';

/**
 * Initiates the pyodide editor using loadpyodide and returns the editor
 * @returns {object} pyodide
 */
async function main() {
	let pyodide = await loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.21.0/full/" });
	// Pyodide ready
    output.value += "Ready!\n";
	return pyodide;
};

/**
 * Pyodide initialization promise
 * @type {object}
 */
let pyodideReadyPromise = main();

/**
 * Adds the output to output textarea in the page
 * @param {*} s 
 */
function addToOutput(s) {
	output.value += ">>>" + s + "\n";
}

/**
 * Checks the position of the warrior and decides wether warrior is safe or not
 * @param {number} s 
 * @param {number} iter 
 * @param {object} passedmap 
 */
async function check(s,iter,passedmap){
  console.log(money);
  if (money == 130)
  {
    document.getElementById("goal1").style.color = "green";
    await new Promise(r=>setTimeout(r,1000));
  }
  else{
    document.getElementById("goal1").style.color = "rgb(238, 131, 37)";
  }
  if(s==7){
    if(money==130){
      if(confirm("You have successfully completed the tutorial, Click ok to proceed to the next one")){
        window.location.href="../tutorials/sets.html"
      }
      else{
        window.location.reload()
      }
    }

    else{
      alert("You have not made the required amount of money to proceed to the next level.")
      window.location.reload()
    }
  }
  if(arr.includes(s)){
    let index = arr.indexOf(s);
    let text = "g";
    let name = text.concat(String(index+1));
    const id = document.getElementById(name);
    // Calculates money according to collection of gems and displays it in the doument
    if(iter==passedmap.get(s)){
      if(index==0 && window.getComputedStyle(id).visibility === "visible"){
        money = money-40;
        document.getElementById('m1').textContent = 'Credits: '+money;
        id.style.visibility = "hidden";
      }
      if(index==1 && window.getComputedStyle(id).visibility === "visible"){
        money = money*2;
        document.getElementById('m1').textContent = 'Credits: '+money;
        id.style.visibility = "hidden";
      }
      if(index==2 && window.getComputedStyle(id).visibility === "visible"){
        money = money+50;
        document.getElementById('m1').textContent = 'Credits: '+money;
        id.style.visibility = "hidden";
      }
      if(index==3 && window.getComputedStyle(id).visibility === "visible"){
        money = money/2;
        document.getElementById('m1').textContent = 'Credits: '+money;
        id.style.visibility = "hidden";
      }
    }
  }

}

/**
 * Function to handle exception whether the night is out of arena or not
 */
function moving_out(){
  alert("Movement not possible");
  window.location.reload();
}

/**
 * Loads the pyodide,
 * checks if there are any print statements and prints them into output text area,
 * checks if any wranings or errors are present in the code written by user in the editor, if no implements the movements
 */
async function evaluatePython() {

	// Calls pyodide main() function
	let pyodide = await pyodideReadyPromise;

  // Load packages if any in the code written by user
  await pyodide.loadPackagesFromImports(codeEditor.getValue())
	try {
    codeEditor.session.clearAnnotations();
    position = 0;
    $("#warrior").animate({left:points[position][0] + '%',top:points[position][1] + '%'},0,);
    document.getElementById("g1").style.visibility = "visible";
    document.getElementById("g2").style.visibility = "visible";
    document.getElementById("g3").style.visibility = "visible";
    document.getElementById("g4").style.visibility = "visible";
    money=100;
    document.getElementById('m1').textContent='Credits: '+money;		
		let put = pyodide.runPython("printer=[]\ndef print(x):printer.append(x)\nsukuna = []\ndict = {}\ndef moveTo(a): sukuna.append(a)\ndef collect():\n if sukuna[-1] not in dict: dict[sukuna[-1]]=len(sukuna)-1\n"+codeEditor.getValue());
    // To mark warnings in the editor 
    var x = (codeEditor.getValue()).split("\n");
    var b = []
    for(var i=0;i<x.length;i++){
      if((x[i]=="moveTo")||(x[i]=="collect")){
        b.push({
          row: i,
          column: 0,
          text: "function calling without parameter",
          type: "warning",
        });
      }
    }
    codeEditor.getSession().setAnnotations(b);
    //Prints into output if any print is called
    let p = pyodide.globals.get("printer").toJs();
    for(var i=0;i<p.length;i++){
      addToOutput(p[i]);
    }

    // If no warnings and errors then animate the warrior according to code written by user
    if(b.length==0){
      let a = pyodide.globals.get("sukuna").toJs();
      let map = pyodide.globals.get("dict").toJs();
      
      for(var i=0;i<a.length;i++){
        if(points[position].slice(2).includes(a[i])){
          let new_pos = a[i];
          //Turns the warrior to particular direction
          if(left_right==1 && points[new_pos][0] < points[position][0]){
            document.getElementById("warrior").style.transform = "scaleX(-1)";
            left_right = -1;
          }
          else if(left_right==-1 && points[new_pos][0] > points[position][0]){
            document.getElementById("warrior").style.transform = "scaleX(+1)";
            left_right = 1;
          }
          if (new_pos == 7)
          {
            document.getElementById("goal2").style.color="green";
          }
          //Movement of warrior according to mowement written by user
          position = new_pos;
          $("#warrior").animate({top:points[new_pos][1] + '%',left:points[new_pos][0] + '%'},{duration:1000,complete: function(){check(new_pos,i,map)}});
          await new Promise(r=>setTimeout(r,1500));
        }

        else{
          $("#warrior").animate({top:points[position][1] + '%'},{duration:0,complete: function(){moving_out()}});
          break;
        }
      }
    }
	} catch (err) {
    var error = err.toString().split("\n");
    addToOutput(err);
    //Prints into output if any print is called
    let p = pyodide.globals.get("printer").toJs();    
    for(var i=0;i<p.length;i++){
      addToOutput(p[i]);
    }
   
        var str = err.toString().match(/\d+/g);
        codeEditor.getSession().setAnnotations([{
            row: str[str.length-1]-8,
            column: 0,
            text: error[error.length -2],
            type: "error" // also warning and information
            }]);
	}
}

editorLib.init();

//Function to read the uploaded file and write it into editor
document.getElementById("filetoRead").addEventListener("change",function(){
    var file = this.files[0];

    if (file) {
        var reader = new FileReader();
        reader.onload = function (evt) {
            console.log(evt);
            codeEditor.setValue(evt.target.result);
            // codeEditor.session.addFold("new text",new ace.Range(1, 0, 1, 1));
        };
        reader.onerror = function (evt) {
            alert("An error ocurred reading the file",evt);
        };
        reader.readAsText(file, "UTF-8");
    }
},false);
