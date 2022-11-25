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
let defaultcode = "#move_top(a): moves the warrior 'a' times upwards\n#move_down(a): moves the warrior 'a' times downwards\n#move_left(a): moves the warrior 'a' times towards his left\n#move_right(a): moves the warrior 'a' times towards his right\n#Initialize variables 'a' and 'b' and complete the code to reach the key\n#Hint: a>1\na = \nb = \nmove_right(a)\nmove_left(a-1)\nmove_top(b)\n";

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
            fontSize: '15pt',
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
 * Direction in which warrior is facing
 * @type {number}
 */
let left_right = 1;

/**
 * Count of number of points in arena
 * @type {number}
 */
const no_of_points = 9;

/**
 * Array to track each position and its neighbouring positions
 * @type {Array<number>}
 */
let points = new Array(no_of_points);

points[0] = [1,-1,-1,-1,75,1];
points[1] = [2,0,4,-1,75,13];
points[2] = [3,1,-1,-1,75,66];
points[3] = [-1,2,-1,-1,75,78];
points[4] = [5,-1,-1,1,49,13];
points[5] = [-1,4,6,-1,49,19];
points[6] = [7,-1,-1,5,22,19];
points[7] = [-1,6,8,-1,22,36];
points[8] = [-1,-1,-1,7,-4,36];

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
function check(s){
  if(s==8){
    if(confirm("You have successfully completed the tutorial, Click ok to proceed to the next one")){
      window.location.href="../tutorials/operator.html"
    }
    else{
      window.location.reload()
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
    $("#warrior").animate({left:points[position][5] + "%"},0,);
    $("#warrior").animate({top:points[position][4] + "%"},0,);
		console.log(codeEditor.getValue())
    let put = pyodide.runPython("printer=[]\ndef print(x):printer.append(x)\nz = []\ndef move_right(a=1):\n if(a>0):\n  for i in range(0,a):z.append(0)\n else:\n  for i in range(0,-a):z.append(1)\ndef move_left(a=1):\n if(a>0):\n  for i in range(0,a):z.append(1)\n else:\n  for i in range(0,-a):z.append(0)\ndef move_top(a=1):\n if(a>0):\n  for i in range(0,a):z.append(2)\n else:\n  for i in range(0,-a):z.append(3)\ndef move_down(a=1):\n if(a>0):\n  for i in range(0,a):z.append(3)\n else:\n  for i in range(0,-a): z.append(2)\n"+codeEditor.getValue());
    // To mark warnings in the editor 
    var x = (codeEditor.getValue()).split("\n");
    var b = []
    for(var i=0;i<x.length;i++){
      if((x[i]=="move_right")||(x[i]=="move_left")||(x[i]=="move_top")||(x[i]=="move_bottom")){
        b.push({
          row: i,
          column: 0,
          text: "function calling without parameter",
          type: "warning",
        });
      }
    }
    codeEditor.getSession().setAnnotations(b);
    let p = pyodide.globals.get("printer").toJs();
    for(var i=0;i<p.length;i++){
      addToOutput(p[i]);
    }

    // If no warnings and errors then animate the warrior according to code written by user
    if(b.length==0){
      let a = pyodide.globals.get("z").toJs();
      for(var i=0;i<a.length;i++){
        if(points[position][a[i]]!=-1){
          let new_pos = points[position][a[i]];
          //Turns the warrior to particular direction
          if(left_right==1 && points[new_pos][5] < points[position][5]){
            document.getElementById("warrior").style.transform = "scaleX(-1)";
            left_right = -1;
          }
          else if(left_right==-1 && points[new_pos][5] > points[position][5]){
            document.getElementById("warrior").style.transform = "scaleX(+1)";
            left_right = 1;
          }
          if (new_pos == 8)
          {
            document.getElementById("goal1").style.color="green";
          }
          if(points[position][5]!=points[new_pos][5]){
            $("#warrior").animate({left:points[new_pos][5] + "%"},1000,);
          }
          if(points[position][4]!=points[new_pos][4]){
            $("#warrior").animate({top:points[new_pos][4] + "%"},{duration:1000,complete: function(){check(new_pos)}});
          }
          position = new_pos;
          await new Promise(r=>setTimeout(r,1000));
        }
        else{
          $("#warrior").animate({top:points[position][4] + "%"},{duration:0,complete: function(){moving_out()}});
          break;
        }
      }
    }
	} catch (err) {
    var error = err.toString().split("\n");
    let p = pyodide.globals.get("printer").toJs();
    for(var i=0;i<p.length;i++){
      addToOutput(p[i]);
    }
		addToOutput(err);
        var str = err.toString().match(/\d+/g);
        codeEditor.getSession().setAnnotations([{
            row: str[str.length-1]-24,
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
