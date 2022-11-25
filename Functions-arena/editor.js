// Retrieve Elements
const output = document.getElementById("output");
// Setup Ace
let codeEditor = ace.edit("editorCode");
output.value = "Initializing...\n";
let defaultcode = "#move_top(a): moves the warrior to the 'a' times nearest top position\n#move_down(a): moves the warrior to the 'a' times nearest bottom position\n#move_left(a): moves the warrior to the 'a' times nearest left position\n#move_right(a): moves the warrior to the 'a' times nearest right position\n#Initialize variables 'a' and 'b' and complete the code to reach the key\n#Hint: a>1\na = \nb = \nmove_right(a)\nmove_left(a-1)\nmove_top(b)\n";
let editorLib = {
    init() {
        // Configure Ace

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
        //codeEditor.session.addFold("new text",new ace.Range(0, 0, 1, 1));
    }
}
let position = 0;

const no_of_points = 9;

let points = new Array(no_of_points);

points[0] = [1,-1,-1,-1,450,22];
points[1] = [2,0,4,-1,450,122];
points[2] = [3,1,-1,-1,450,617];
points[3] = [-1,2,-1,-1,450,727];
points[4] = [5,-1,-1,1,285,122];
points[5] = [-1,4,6,-1,285,177];
points[6] = [7,-1,-1,5,120,177];
points[7] = [-1,6,8,-1,120,342];
points[8] = [-1,-1,-1,7,-45,342];

// Events
async function main() {
	let pyodide = await loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.21.0/full/" });
	// Pyodide ready
    output.value += "Ready!\n";
	return pyodide;
};

let pyodideReadyPromise = main();

function addToOutput(s) {
	output.value += ">>>" + s + "\n";
}

function check(s){
  if(s==8){
    if(confirm("You have successfully completed the tutorial, Click ok to proceed to the next one")){
      window.location.href="next.html"
    }
    else{
      window.location.reload()
    }
  }
}

function moving_out(){
  alert("Movement not possible");
  window.location.reload();
}

async function evaluatePython() {

	let pyodide = await pyodideReadyPromise;
	try {
    codeEditor.session.clearAnnotations();
    position = 0;
    $("#warrior").animate({left:points[position][5] + "px"},0,);
    $("#warrior").animate({top:points[position][4] + "px"},0,);
		console.log(codeEditor.getValue())
		let put = pyodide.runPython("z = []\ndef move_right(a=1):\n if(a>0):\n  for i in range(0,a):z.append(0)\n else:\n  for i in range(0,-a):z.append(1)\ndef move_left(a=1):\n if(a>0):\n  for i in range(0,a):z.append(1)\n else:\n  for i in range(0,-a):z.append(0)\ndef move_top(a=1):\n if(a>0):\n  for i in range(0,a):z.append(2)\n else:\n  for i in range(0,-a):z.append(3)\ndef move_down(a=1):\n if(a>0):\n  for i in range(0,a):z.append(3)\n else:\n  for i in range(0,-a): z.append(2)\n"+codeEditor.getValue());
    let a = pyodide.globals.get("z").toJs();
    console.log(a)

    for(var i=0;i<a.length;i++){
      if(points[position][a[i]]!=-1){
        let new_pos = points[position][a[i]];

        if(points[position][5]!=points[new_pos][5]){
          $("#warrior").animate({left:points[new_pos][5] + "px"},1000,);
        }
        if(points[position][4]!=points[new_pos][4]){
          $("#warrior").animate({top:points[new_pos][4] + "px"},{duration:1000,complete: function(){check(new_pos)}});
        }

        position = new_pos;
      }
      else{
        $("#warrior").animate({top:points[position][4] + "px"},{duration:0,complete: function(){moving_out()}});
      }
    }
		addToOutput(put);
	} catch (err) {
    var error = err.toString().split("\n");
		addToOutput(err);
        var str = err.toString().match(/\d+/g);
        codeEditor.getSession().setAnnotations([{
            row: str[str.length-1]-22,
            column: 0,
            text: error[error.length -2],
            type: "error" // also warning and information
            }]);
		addToOutput(err);
	}
}

editorLib.init();

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
