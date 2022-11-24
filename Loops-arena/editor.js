// Retrieve Elements
const output = document.getElementById("output");
// Setup Ace
let codeEditor = ace.edit("editorCode");
output.value = "Initializing...\n";
let defaultcode = "#moveTo(a): Moves to the position 'a' only if 'a' is adjacent to the current position\nfor i in range(1,9,3):\n    moveTo(i)\n    #Complete the code here\n    #Use the for loops explained in the tutorial to collect all the gems and return home\n    \nmoveTo(0)\n";
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
let count_gems = 0;

const no_of_points = 10;

let points = new Array(no_of_points);

points[0] = [450,470,1,7];
points[1] = [370,390,0,2,4];
points[2] = [190,310,1,3];
points[3] = [30,230,2];
points[4] = [450,270,1,5,7];
points[5] = [500,150,4,6];
points[6] = [670,110,5];
points[7] = [540,390,0,4,8];
points[8] = [720,380,7,9];
points[9] = [810,230,8]

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
  if(s==0){
    if(count_gems==6){
      if(confirm("You have successfully completed the tutorial, Click ok to proceed to the next one")){
        window.location.href="next.html"
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

  if(id1){
    func(id1);
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
    $("#warrior").animate({left:points[position][0] + "px",top:points[position][1] + "px"},0,);
		console.log(codeEditor.getValue())
		let put = pyodide.runPython("sukuna = []\ndef moveTo(a): sukuna.append(a)\n"+codeEditor.getValue());
    var x = (codeEditor.getValue()).split("\n");
    var b = []
    for(var i=0;i<x.length;i++){
      if((x[i]=="moveTo")){
        b.push({
          row: i,
          column: 0,
          text: "function calling without parameter",
          type: "warning",
        });
      }
    }
    codeEditor.getSession().setAnnotations(b);
    if(b.length==0){
      let a = pyodide.globals.get("sukuna").toJs();
      console.log(a)

      for(var i=0;i<a.length;i++){
        if(points[position].includes(a[i])){
          let new_pos = a[i];

          $("#warrior").animate({top:points[new_pos][1] + "px",left:points[new_pos][0] + "px"},{duration:1000,complete: function(){check(new_pos)}});

          position = new_pos;
        }
        else{
          $("#warrior").animate({top:points[position][1] + "px"},{duration:0,complete: function(){moving_out()}});
        }
      }
  		addToOutput(put);
    }
	} catch (err) {
    var error = err.toString().split("\n");
        var str = err.toString().match(/\d+/g);
        codeEditor.getSession().setAnnotations([{
            row: str[str.length-1]-3,
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
