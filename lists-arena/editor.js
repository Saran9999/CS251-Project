// Retrieve Elements
const output = document.getElementById("output");
// Setup Ace
let codeEditor = ace.edit("editorCode");
output.value = "Initializing...\n";
let defaultcode = "#Hero.moveTo(a): This function will move your Hero to the position a, He can move only to adjacent positions\n#Hero.ADD(): By using this function you can collect the gem at your position\n#Hero.DEL(): By using this function You can drop the gem you collected at that position\n#Your Aim is to collect all the green gems by leaving the red gems and reach the position number 9\n";
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
let num_gems = 0;
const no_of_points = 10;
let gem = new Array(no_of_points);
let points = new Array(no_of_points);
gem[0]=0;
gem[1]=0;
gem[2]=0;
gem[3]=0;
gem[4]=0;
gem[5]=0;
gem[6]=0;
gem[7]=0;
gem[8]=0;
gem[9]=0;
points[0] = [50,520,1,2];
points[1] = [50,320,0];
points[2] = [200,520,0,3];
points[3] = [240,300,2,4];
points[4] = [440,310,3,5,7];
points[5] = [540,180,4,6];
points[6] = [610,310,5,7,9];
points[7] = [540,380,4,6,8];
points[8] = [600,480,7];
points[9] = [760,310,6];

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

function check(s,j,m,n){
  if(s==9){
    if (gem[1] == 0 && gem[2] == 1 && gem[3] == 0 && gem[4] == 1 && gem[5] == 0 && gem[6] == 1 && gem[7] == 1)
    {
      if(confirm("You have successfully completed the tutorial, Click ok to proceed to the next one")){
        window.location.href="next.html"
      }
      else{
        window.location.reload()
      }
    }
    else
    {
      alert("You may not collect all the required gems or collected extra gems");
  window.location.reload();
    }
  }
  if (s==8)
  {
    alert("You went into fire");
  window.location.reload();
  }
  let text="g";
  let name = text.concat(String(s));
  var id= document.getElementById(name);
  if (id)
  {
    if (j == m)
    {
      if (s == n)
      {
        if (window.getComputedStyle(id).visibility === "visible")
        {
          num_gems++;
          gem[s]=1;
          id.style.visibility="hidden";
        }
      }
      else if (s == -n)
      {
          if (window.getComputedStyle(id).visibility === "hidden")
          {
            gem[s]=0;
            num_gems--;
            id.style.visibility="visible";
          }
      }
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
    for(let f=0;f<8;f++){
      let text="g";
      let name = text.concat(String(f));
      var id= document.getElementById(name);
      if (id){
        id.style.visibility="visible";
      }
    }
    $("#warrior").animate({left:points[position][0] + "px"},0,);
    $("#warrior").animate({top:points[position][1] + "px"},0,);
		console.log(codeEditor.getValue())
    var x = (codeEditor.getValue()).split("\n");
    var k = [];
    for(var i = 0;i<x.length;i++){
      if((x[i]=="Hero.moveTo")||(x[i]=="Hero.ADD")||(x[i]=="Hero.DEL")){
        k.push({
          row : i,
          column : 0,
          text: "function ",
          type: "warning"
        });
      }
    }
    codeEditor.getSession().setAnnotations(k);
    if(k.length==0){
      let put = pyodide.runPython("z = []\np=[]\nq=[]\nclass hero:\n def __init__(self,a):\n  self.position=a\n def moveTo(self,a):\n  z.append(a)\n  self.position=a\n def ADD(self):\n  p.append(len(z)-1)\n  q.append(self.position)\n def DEL(self):\n  p.append(len(z)-1)\n  q.append(-(self.position))\nHero=hero(0)\n"+codeEditor.getValue());
      
      let a = pyodide.globals.get("z").toJs();
      let b = pyodide.globals.get("p").toJs();
      let c = pyodide.globals.get("q").toJs();

      for(var i=0;i<a.length;i++){
        if(points[position].includes(a[i])){
          let new_pos = a[i];
          let k1 = b[0];
          let k2 = c[0];
          let k3 = i;
          if(i==b[0]){
            b.shift();
            c.shift();
          }
          position = new_pos;

          $("#warrior").animate({top:(points[new_pos][1] + "px"),left:(points[new_pos][0] + "px") },{duration:1000,complete:function(){check(new_pos,k3,k1,k2)}});
        }
        else{
          $("#warrior").animate({top:points[position][1] + "px",left:points[position][0]},{duration:0,complete: function(){moving_out()}});
        }
      }
      addToOutput(put);
    }
	} catch (err) {
    var error = err.toString().split("\n");		
        var str = err.toString().match(/\d+/g);
        codeEditor.getSession().setAnnotations([{
            row: str[str.length-1]-17,
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
