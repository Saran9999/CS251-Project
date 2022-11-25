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
 let defaultcode = "#Hero.moveTo(a): This function will move your Hero to the position a, He can move only to adjacent positions\n#Hero.ADD(): By using this function you can collect the gem at your position\n#Hero.DEL(): By using this function You can drop the gem you collected at that position\n#Your Aim is to collect all the green gems by leaving the red gems and reach the position number 9\n";
 
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
  * Counts number of gems collected by warrior in arena
  * @type {number}
  */
 let num_gems = 0;
 
 /**
  * Direction in which warrior is facing
  * @type {number}
  */
 let left_right= 1;
 
 /**
  * Count of number of points in arena
  * @type {number}
  */
 const no_of_points = 10;
 
 /**
  * Positions of the gems
  * @type {Array<number>}
  */
 let gem = [0,0,0,0,0,0,0,0,0,0];
 
 /**
  * Array to track each position and its neighbouring positions
  * @type {Array<number>}
  */
 let points = new Array(no_of_points);
 // points[0] = [50,520,1,2];
 // points[1] = [50,320,0];
 // points[2] = [200,520,0,3];
 // points[3] = [240,300,2,4];
 // points[4] = [440,310,3,5,7];
 // points[5] = [540,180,4,6];
 // points[6] = [610,310,5,7,9];
 // points[7] = [540,380,4,6,8];
 // points[8] = [600,480,7];
 // points[9] = [760,310,6];
 points[0] = [5,83,1,2];
 points[1] = [5,51.07,0];
 points[2] = [20,83,0,3];
 points[3] = [24,47.88,2,4];
 points[4] = [44,49.48,3,5,7];
 points[5] = [54,28.73,4,6];
 points[6] = [61,49.48,5,7,9];
 points[7] = [54,60.65,4,6,8];
 points[8] = [60,76.61,7];
 points[9] = [76,49.48,6];
 
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
  * @param {number} j 
  * @param {number} m 
  * @param {number} n
  */
 function check(s,j,m,n){
   if (s==9)
   {
     document.getElementById("goal3").style.color="green";
   }
   if(s==9){
     // Won or lost the game
     if (gem[1] == 0 && gem[2] == 1 && gem[3] == 0 && gem[4] == 1 && gem[5] == 0 && gem[6] == 1 && gem[7] == 1)
     {
       if(confirm("You have successfully completed the tutorial, Click ok to proceed to the next one")){
         window.location.href="../tutorials/loops.html"
       }
       else{
         window.location.reload()
       }
     }
     else
     {
       document.getElementById("w2").style.display="block";
     }
   }
   if (s==8)
   {
     document.getElementById("w3").style.display="block";  
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
   if ( gem[2] == 1 && gem[4] == 1 && gem[6] == 1 && gem[7] == 1)
   {
     document.getElementById("goal1").style.color="green";
   }
   else
   {
     document.getElementById("goal1").style.color=" rgb(238, 131, 37)";
   }
   if (gem[1] == 1 || gem[3] == 1 || gem[5]==1)
   {
     document.getElementById("goal2").style.color=" rgb(238, 131, 37)";
   }
   else
   {
     document.getElementById("goal2").style.color="green";
   }
 }
 
 /**
  * Function to handle exception whether the night is out of arena or not
  */
 function moving_out(){
   document.getElementById("w1").style.display="block";  
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
     for(let f=0;f<8;f++){
       let text="g";
       let name = text.concat(String(f));
       var id= document.getElementById(name);
       if (id){
         id.style.visibility="visible";
       }
     }
     $("#warrior").animate({left:points[position][0] + "%"},0,);
     $("#warrior").animate({top:points[position][1] + "%"},0,);
     if (left_right == -1)
     {
       document.getElementById("warrior").style.transform = "scaleX(+1)";
       left_right=1;
     }
     let put = pyodide.runPython("printer=[]\ndef print(x):printer.append(x)\nz = []\np=[]\nq=[]\nclass hero:\n def __init__(self,a):\n  self.position=a\n def moveTo(self,a):\n  z.append(a)\n  self.position=a\n def ADD(self):\n  p.append(len(z)-1)\n  q.append(self.position)\n def DEL(self):\n  p.append(len(z)-1)\n  q.append(-(self.position))\nHero=hero(0)\n"+codeEditor.getValue());
     // To mark warnings in the editor 
     var x = (codeEditor.getValue()).split("\n");
     var k = [];
     for(var i = 0;i<x.length;i++){
       if((x[i]=="Hero.moveTo")||(x[i]=="Hero.ADD")||(x[i]=="Hero.DEL") || (x[i] == "Hero")){
         k.push({
           row : i,
           column : 0,
           text: "function ",
           type: "warning"
         });
       }
     }
     codeEditor.getSession().setAnnotations(k);
     //Prints into output if any print is called
     let p = pyodide.globals.get("printer").toJs();
     for(var i=0;i<p.length;i++){
       addToOutput(p[i]);
     } 
     // If no warnings and errors then animate the warrior according to code written by user
     if(k.length==0){     
       let a = pyodide.globals.get("z").toJs();
       let b = pyodide.globals.get("p").toJs();
       let c = pyodide.globals.get("q").toJs();
       console.log(a);
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
             left_right = 1;
           }
           let k1 = b[0];
           let k2 = c[0];
           let k3 = i;
           if(i==b[0]){
             b.shift();
             c.shift();
           }
           position = new_pos;
           if (new_pos==9)
           {
             document.getElementById("goal3").style.color="green";
           }
           //Movement of warrior according to mowement written by user
           $("#warrior").animate({top:(points[new_pos][1] + "%"),left:(points[new_pos][0] + "%") },{duration:1000,complete:function(){check(new_pos,k3,k1,k2)}});
           await new Promise(r=>setTimeout(r,1000));
         }
         else{
           $("#warrior").animate({top:points[position][1] + "%",left:points[position][0]+"%"},{duration:0,complete: function(){moving_out()}});
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
             row: str[str.length-1]-19,
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
         };
         reader.onerror = function (evt) {
             alert("An error ocurred reading the file",evt);
         };
         reader.readAsText(file, "UTF-8");
     }
 },false);
 