// Retrieve Elements
const output = document.getElementById("output");
// Setup Ace
let codeEditor = ace.edit("editorCode");
output.value = "Initializing...\n";
let defaultcode = "#write your code here\n#move_right move_left move_top move_down";
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
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            highlightActiveLine: true,
            highlightSelectedWord: true,
            cursorStyle:"slim"
        });

        // Set Default Code
        //codeEditor.setValue(defaultcode);        
        //codeEditor.session.addFold("new text",new ace.Range(0, 0, 1, 1));        
    }
}

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

async function evaluatePython() {
    
	let pyodide = await pyodideReadyPromise;
    try {
		// await pyodide.loadPackagesFromImports(codeEditor.getValue()) 
        // const prevMarkers = codeEditor.session.getMarkers();
        // if(prevMarkers){
        //     const prevMarkersArr = Object.keys(prevMarkers);
        //     for(let item of prevMarkersArr){
        //         codeEditor.session.removeMarker(prevMarkers[item].id);
        //     }
        // }     
        codeEditor.session.clearAnnotations(); 
		let put = pyodide.runPython(codeEditor.getValue()); 
        //let a = pyodide.globals.get("z").toJs();       
		addToOutput(put);
	} catch (err) {
        var error = err.toString().split("\n");        
		addToOutput(err);        
        var str = err.toString().match(/\d+/g);                     
        codeEditor.getSession().setAnnotations([{
            row: str[str.length-1]-1,
            column: 0,
            text: error[error.length -2],
            type: "error" // also warning and information
        }]);        
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