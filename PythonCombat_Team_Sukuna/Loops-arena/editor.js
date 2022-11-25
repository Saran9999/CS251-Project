/**
 * Output
 * @type {object}
 */
const output = document.getElementById("output");

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
let defaultcode = "#moveTo(a): Moves to the position 'a' only if 'a' is adjacent to the current position\n#attack(): Attacks if there is a knight at that position\n#If you do not attack knight when you reach him first time,\n#He will kill the warrior.\nfor i in range(1,9,3):\n    moveTo(i)\n    #Complete the code here\n    #Use the for loops explained in the tutorial to collect all the gems and return home\n    \nmoveTo(0)\n";

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
 * Resizes the knight
 */
function resizing(){
  var width = window.innerWidth*0.61;
  document.getElementById("p2").style.transform = `scale(${width/927})`;
  document.getElementById("p5").style.transform = `scale(${width/927})`;
  document.getElementById("p8").style.transform = `scale(${width/927})`;
}
window.onresize = resizing;
window.onload = resizing;

/**
 * Position of the warrior
 * @type {number}
 */
let position = 0;

/**
 * Count of number of gems with the warrior
 * @type {number}
 */
let count_gems = 0;

/**
 * Count of number of points in arena
 * @type {number}
 */
const no_of_points = 10;

/**
 * Direction in which warrior is facing
 * @type {number}
 */
let left_right = 1;

/**
 * Counts number of kills made by warrior
 * @type {number}
 */
let num_kills=0;

/**
 * Array to track each position and its neighbouring positions
 * @type {Array<number>}
 */
let points = new Array(no_of_points);

points[0] = [48,75,1,7];
points[1] = [37,63,2,4];
points[2] = [18,50,1,3];
points[3] = [1,35,2];
points[4] = [48,38,1,5,7];
points[5] = [54,25,4,6];
points[6] = [72,17,5];
points[7] = [59,62,0,4,8];
points[8] = [79,60,7,9];
points[9] = [87,38,8]

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
 */
async function check(s,iter,passedmap){
  if(count_gems==6){
    document.getElementById("goal1").style.color="green";
  }
  if(s==0){
    //Won or lost the game
    if(count_gems==6){
      if(confirm("You have successfully completed the tutorial, Click ok to proceed to the next one")){
        window.location.href="../tutorials/functions.html"
      }
      else{
        window.location.reload()
      }
    }

    else{
      alert("You have not collected all the gems,collect all the gems to proceed to the next level")
      window.location.reload()
    }
  }

  let text = "g";
  let name = text.concat(String(s));
  var id = document.getElementById(name);

  if(id){
    if(window.getComputedStyle(id).visibility === "visible"){
      count_gems++;
      id.style.visibility = "hidden";
    }
  }

  let text1 = "p";
  let name1 = text1.concat(String(s));
  const id1 = document.getElementById(name1);

  if(id1 && window.getComputedStyle(id1).visibility === "visible"){
    if(passedmap.has(s)){
      if(iter==passedmap.get(s)){
        id1.style.visibility = "hidden";
        num_kills++;
      }
    }
    else{
      func(id1);
      await new Promise(r=>setTimeout(r,1000));
      alert("The knight has killed you");
      window.location.reload();
    }
  }
  if (num_kills == 3)
  {
    document.getElementById("goal2").style.color="green";
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
    $("#warrior").animate({left:points[position][0] + "%",top:points[position][1] + "%"},0,);
		console.log(codeEditor.getValue())
		let put = pyodide.runPython("printer=[]\ndef print(x):printer.append(x)\nsukuna = []\ndict = {}\ndef moveTo(a): sukuna.append(a)\ndef attack():\n if sukuna[-1] not in dict: dict[sukuna[-1]]=len(sukuna)-1\n"+codeEditor.getValue());
      // To mark warnings in the editor
    var x = (codeEditor.getValue()).split("\n");
    var b = []
    for(var i=0;i<x.length;i++){
      if((x[i]=="moveTo")||(x[i]=="attack")){
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
      console.log(map);
      console.log(a)

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
          // Movement of the warrior according to movements given by user
          $("#warrior").animate({top:points[new_pos][1] + "%",left:points[new_pos][0] + "%"},{duration:1000,complete: function(){check(new_pos,i,map)}});
          let text2 = "p";
          let name2 = text2.concat(String(new_pos));
          const id2 = document.getElementById(name2);
          if (new_pos==0)
          {
            document.getElementById("goal3").style.color="green";
          }
          position = new_pos;
          if(id2 && window.getComputedStyle(id2).visibility === "visible"){
            await new Promise(r=>setTimeout(r,3000));
          }
          else{
            await new Promise(r=>setTimeout(r,1000));
          }
        }

        else{
          $("#warrior").animate({top:points[position][1] + "%"},{duration:0,complete: function(){moving_out()}});
        }
      }
    }
	} catch (err) {
    var error = err.toString().split("\n");
    //Prints into output if any print is called
    addToOutput(err);
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
