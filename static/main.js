const socket = io();
//const MainScope = function()
//{

var gfocus = -1;
var camDir = 0;
var mapKnowledgeData = {};

function gp(id)
{
  return document.getElementById(id);
}
function rad(deg){
  return deg!=null?deg*(Math.PI/180):0;
}

// Initialize Firebase
var config = {
  apiKey: "AIzaSyDfIFP4ZgQct3tg3jtvKqCaRR8V8kbVmTw",
  authDomain: "lgcp-9bb89.firebaseapp.com",
  databaseURL: "https://lgcp-9bb89.firebaseio.com",
  projectId: "lgcp-9bb89",
  storageBucket: "lgcp-9bb89.appspot.com",
  messagingSenderId: "192476211570"
};
firebase.initializeApp(config);
var database = firebase.database();

var user;
var provider = new firebase.auth.GoogleAuthProvider();
provider.setCustomParameters({
'login_hint': 'user@example.com'
});
function LogIn()
{
  firebase.auth().signInWithPopup(provider).then(function(result) {
	  // This gives you a Google Access Token. You can use it to access the Google API.
	  var token = result.credential.accessToken;
	  // The signed-in user info.
	}).catch(function(error) {
	  // Handle Errors here.
    console.warn("ERROR: There was an error logging you in",error.code);
	});
}

function LogOut()
{
	if(!user) return;
	firebase.auth().signOut().then(function(){
	// Sign-out successful.
	console.log("SignOut was successful");
  window.location.reload();
	}).catch(function(error) {
	// An error happened.
	console.warn("ERROR: There was an error signing out");
	});
}
function LoadAuth()
{
	firebase.auth().onAuthStateChanged(function(user1) {
    if (user1) {
      // User is signed in.
      //gp("p_Username").innerHTML = user1.displayName;
      gp("p_Photo").src = user1.photoURL;
      user = user1;

      DInit();
    } else {
    // No user is signed in.
    console.log("No user signed in");
    LoadInputMenu(4);
    //gp("p_Username").innerHTML = "No User";
    gp("p_Photo").src = null;
    }
  });
}
LoadAuth();

var fixOnline = false;
socket.on('connect_error', function(err) {
  online = false;
  gp("ServerError").className = "disconnected";
  gp("ServerError").innerHTML = "Server must be down for maintnence, or has crashed.";
});
socket.on('connect', function(err) {
  online = true;
  if(fixOnline === true)
  {
    window.location.reload(true);
  }
  fixOnline = true;
  gp("ServerError").className = "connected";
  gp("ServerError").innerHTML = "";
});

function CreateRoom()
{
  var name = gp("i_Game").value;
  var pass = gp("i_Pass").value;
  var passv = gp("i_PassView").value;
  if(name.length > 0)
  {
    console.log("Attempting to create game at: " + name);
    var data = {name: name};
    if(pass.length > 0 && pass != "") data.pass = pass;
    if(passv.length > 0 && passv != "") data.passv = passv;
    socket.emit('createRoom',data);
  }
}
socket.on('createRoom',function(data){
  if(data)
  {
    if(data.err) console.log("Error: " + data.err);
  }
  //else JoinRoom();
});

var label = gp("l_saveOutcome");
socket.on('labelOutput',function(id,data){
  if(id == null || !data) return;
  switch(id)
  {
    //update bottom label
    case 0:
      //Success
      if(data.colBack) label.style.backgroundColor = data.colBack;
      if(data.colBorder) label.style.border = "solid 1px " + data.colBorder;
      if(data.text) label.innerHTML = data.text;
      if(data.text.startsWith("Temp Kicked/Disabled") && data.text.includes(user.displayName)) alert("You've been Temporarily Kicked from the game. This means your turn will be skipped, but you data will still be there if you re-join. To re-join, refresh the page.");
      label.style.opacity = 1;
      setTimeout(function(lab){
        lab.style.opacity = 0;
      },3000,label);
    break;
  }
});

var ed = {
  //moveInc: 1
  path_helpers:true
};
var swatch = document.createElement("div");
swatch.id = "swatch";
var selObjs = [];
//var subSelObjs = [];
var usableColors = [];
function LoadBasicData()
{
  //LOAD BASIC DATA
  firebase.database().ref('colors/').once('value',function(snap){
    var oc = snap ? snap.val() : [ {
      "color" : "gray",
      "name" : "DarkGray",
      "op" : 1
    }, {
      "color" : "darkgray",
      "name" : "LightGray",
      "op" : 1
    }, {
      "color" : "0x157D26",
      "name" : "DarkGreen",
      "op" : 1
    }, {
      "color" : "0x1B9822",
      "name" : "BrightGreen",
      "op" : 1
    }, {
      "color" : "0xf8f8f8",
      "name" : "White",
      "op" : 1
    }, {
      "color" : "0x3C3C3C",
      "name" : "Black",
      "op" : 1
    }, {
      "color" : "0xD6001E",
      "name" : "BrightRed",
      "op" : 1
    }, {
      "color" : "0x2653A7",
      "name" : "Blue",
      "op" : 1
    }, {
      "color" : "0x581B0F",
      "name" : "Brown",
      "op" : 1
    }, {
      "color" : "0xF8C718",
      "name" : "BrightYellow",
      "op" : 1
    }, {
      "color" : "0xDBC181",
      "name" : "BrickYellow",
      "op" : 1
    }, {
      "color" : "0x8D7959",
      "name" : "SandYellow",
      "op" : 1
    }, {
      "color" : "limegreen",
      "name" : "BrightYellowGreen",
      "op" : 1
    }, {
      "color" : "0x7C021F",
      "name" : "NewDarkRed",
      "op" : 1
    }, {
      "color" : "0xA23D1D",
      "name" : "DarkOrange",
      "op" : 1
    }, {
      "color" : "0x558AC5",
      "name" : "MediumBlue",
      "op" : 1
    }, {
      "color" : "0xFFC03A",
      "name" : "Gold",
      "op" : 1,
      "reflect" : true
    }, {
      "color" : "0x5E2980",
      "name" : "MediumLilac",
      "op" : 1
    }, {
      "color" : "0xf8f8f8",
      "name" : "Transparent",
      "op" : 0.3
    }, {
      "color" : "0x9C0010",
      "name" : "Red_Trans",
      "op" : 0.5
    }, {
      "color" : "0x00296B",
      "name" : "Blue_Trans",
      "op" : 0.5
    }, {
      "color" : "0xE5771F",
      "name" : "BrightOrange_Trans",
      "op" : 0.5
    }, {
      "color" : "0xFF4231",
      "name" : "FloureReddishOrange_Trans",
      "op" : 0.5
    }, {
      "color" : "0xF7EB2D",
      "name" : "Yellow_Trans",
      "op" : 0.5
    }, {
      "color" : "0x217625",
      "name" : "Green_Trans",
      "op" : 0.5
    }, {
      "color" : "0x10CB31",
      "name" : "BrightGreen_Trans",
      "op" : 0.5
    }, {
      "color" : "0xC0F500",
      "name" : "FloureGreen_Trans",
      "op" : 0.5
    }, {
      "color" : "0x68BCC5",
      "name" : "LightBlue_Trans",
      "op" : 0.5
    }, {
      "color" : "0x7384A5",
      "name" : "FloureBlue_Trans",
      "op" : 0.5
    }, {
      "color" : "0x8320B7",
      "name" : "BrightBluishViolet_Trans",
      "op" : 0.5
    }, {
      "color" : "0xBD3E9C",
      "name" : "MediumReddishViolet_Trans",
      "op" : 0.5
    }, {
      "color" : "0x645A4C",
      "name" : "Brown_Trans",
      "op" : 0.5
    }, {
      "color" : "0x8E9496",
      "name" : "SilverMetalic",
      "op" : 1,
      "reflect" : true
    }, {
      "color" : "0x053515",
      "name" : "EarthGreen",
      "op" : 1
    }, {
      "color" : "0x0A2441",
      "name" : "EarthBlue",
      "op" : 1
    }, {
      "color" : "0x618365",
      "name" : "SandGreen",
      "op" : 1
    }, {
      "color" : "0x61738C",
      "name" : "SandBlue",
      "op" : 1
    }, {
      "color" : "0xF57D23",
      "name" : "BrightOrange",
      "op" : 1
    }, {
      "color" : "0xED9D19",
      "name" : "FlameYellowishOrange",
      "op" : 1
    }, {
      "color" : "0x2E0F06",
      "name" : "DarkBrown",
      "op" : 1
    }, {
      "color" : "0x069D9F",
      "name" : "BrightBluishGreen",
      "op" : 1
    }, {
      "color" : "0x808452",
      "name" : "OliveGreen",
      "op" : 1
    }, {
      "color" : "0x333639",
      "name" : "PearlDarkGray",
      "op" : 1
    } ];
    if(!snap) console.log("Using alternate color struct, you must be offline. Colors may not be updated to latest version.");
    for(var i = 0; i < oc.length; i++)
    {
      var co = oc[i];
      var col = (co.color.startsWith("0") ? "#" + co.color.substr(2,6) : co.color);
      usableColors.push({name:co.name,color: col, op: co.op + 0.25, reflect: (co.reflect)});

      //Init Swatch
      var s = document.createElement("div");
      var sel = document.createElement("div");
      var na = co.name;
      na = na.replace("_Trans","");
      sel.innerHTML = na + (co.reflect ? "_(Shiny)" : "") + (co.op < 1 ? "_(Translucent)" : "");
      sel.className = "lab";
      s.props = sel;
      s.onmouseover = function(){
        var t = this.props.style;
        t.visibility = "visible";
        //this.props.zIndex = 20;
        this.style.zIndex = 1;
        this.style.width = "25px";
        this.style.height = "25px";
        this.style.boxShadow = "0px 2px 2px rgba(0,0,0,0.5)";
      };
      s.onmouseleave = function(){
        this.props.style = "";
        this.style.zIndex = 0;
        this.style.width = "20px";
        this.style.height = "20px";
        this.style.boxShadow = "none";
      };
      s.style.backgroundColor = col;
      s.appendChild(sel);
      swatch.appendChild(s);

      /*var s = document.createElement("span");
      s.id = "cm_" + i;
      s.onclick = function(e){
        console.log("color: " + this.innerHTML + " : id - " + this.id);
        var tid = this.id.split("_")[1];
        if(selObjs.length > 0 || subSels.length > 0)
        {
          var sss = GetPiece("spawnsubs_name");
          if(editMode == 0)
          {
            selObjs.forEach(function(c){
              if(!gameData) return;
              if(editMode == 0) socket.emit('editPiece',0,{id: c.id,color: tid});
            });
          }
          else if(editMode == 1 && sss) socket.emit('cm_editSub',1,sss.innerHTML,{id:subSels[0].id,col:tid})
        }
      }
      s.innerHTML = co.name;
      var cshow = document.createElement("div");
      cshow.style = "right: 0; position: absolute; margin-top: -16px; z-index: -1";
      cshow.style.height = "20px";
      cshow.style.width = "60px";
      var ccoo = oc[i];
      cshow.style.backgroundColor = ccoo.color.replace("0x","#");
      s.appendChild(cshow);
      document.getElementById("colors_dd").appendChild(s);*/
    }
    console.log("LOAD COLORS COMPLETE");
  });
}
LoadBasicData();

//Init Path EDITOR
const pathEditor = gp("pathEditor");
pathEditor.style.width = window.innerWidth/2;
pathEditor.style.height = window.innerHeight - 58;
pathEditor.style.marginLeft = "80px";

function screenXY(obj){

  var vector = new THREE.Vector3();
  var canvas = renderer.domElement;

  vector.set(obj.position.x,obj.position.y,obj.position.z);

  // map to normalized device coordinate (NDC) space
  vector.project( camera );

  // map to 2D screen space
  vector.x = Math.round( (   vector.x + 1 ) * canvas.width  / 2 ),
  vector.y = Math.round( ( - vector.y + 1 ) * canvas.height / 2 );
  vector.z = 0;

  return vector;
};

function SpawnPlayer(uid,player,s,call){
  ImportPiece(0,0,function(child){
    var go = child.children[0];

    //go.position.set(0,0,12);
    //go.scale.set(1,1,1);

    //SetColor(child.children[0],Math.floor(Math.random() * usableColors.length));
    if(s){
      if(s.c != null) SetColor(child.children[0],s.c);
    }
    else{
      SetColor(child.children[0],6);
    }
    //go[tuser.uid] = go;
    go.name = uid;
    go.castShadow = true;
    go.receiveShadow = true;

    var tar = scene.getObjectByName("p_" + player);
    if(!tar) return;
    tar.children[0].add(go); //sub group

    players.push(go);

    go.userData = s;//{n:s.n};

    /*setTimeout(function(){
      var label = document.createElement("span");
      label.style = "position:absolute;padding:10px;border:solid 1px red;";
      label.innerHTML = s.n.n;
      var pos = screenXY(go);
      console.log(go,pos);
      label.style.marginLeft = pos.x;
      label.style.marginTop = pos.y;
      document.body.appendChild(label);
    },3000,go);*/

    //Stacking
    var i = go.parent.children.indexOf(go);
    go.position.y = 16*i+3;

    movePlayerTo(uid,player);

    if(call) call(go);
  },"14/Microfig");
}

var subStruct = {
  0:{
    0:{p:[[[14,30],[0,0,1],2]],name:"Goblin"},
    1:{p:[[[14,30],[0,0,1],0]],name:"Armored Goblin"}
  },
  1:{
    0:{
      p:[
        [[8,2],[0,0,1],19],
        [[8,0],[0,0,4],6]
      ],
      name:"Health Potion",
      m:[
        {id:[8,2],col:19,z:1},
        {id:[8,0],col:6,z:4}
      ]
    },
    1:{
      p:[
        [[3,0],[0,0,1],20],
        [[8,0],[0,0,4],7]
      ],
      name:"Speed Potion",
      m:[
        {id:[3,0],col:20,z:1},
        {id:[8,0],col:7,z:4}
      ]
    },
    2:{
      p:[
        [[3,0],[0,0,1],21],
        [[8,0],[0,0,4],37]
      ],
      name:"Luck Potion",
      m:[
        {id:[3,0],col:21,z:1},
        {id:[8,0],col:37,z:4}
      ]
    },
    3:{
      p:[
        [[8,1],[0,0,1],23],
        [[8,0],[0,0,4],9]
      ],
      name:"Strength Potion",
      m:[
        {id:[8,1],col:23,z:1},
        {id:[8,0],col:9,z:4}
      ]
    }
  },
  2:{
    0:{
      p:[
        [[8,2],[0,0,1],16]
      ],
      name:"Gold",
      m:[
        {id:[8,2],col:16,z:1},
      ]
    }
  },
  3:{
    0:{
      p:[
        [[14,46],[0,0,3],0]
      ],
      name:"Key",
      m:[
        {id:[14,46],col:0,z:3}
      ]
    },
    1:{
      p:[
        [[14,40],[0,0,1],8],
        [[10,1],[0,0,6.5],21]
      ],
      name:"Torch",
      m:[
        {id:[14,40],col:8,z:1},
        {id:[10,1],col:21,z:6.5}
      ]
    }
  },
  4:{
    0:{
      p:[
        [[3,0],[0,0,1],8],
        [[9,0],[0,0,4],8]
      ],
      name:"Chest",
      m:[ //Chest
        {id:[3,0],col:8,z:1},
        {id:[9,0],col:8,z:4}
      ]
    },
    1:{
      p:[
        [[1,1],[0,0,1],0],
        [[8,0],[4,0,2],0],
        [[8,0],[-4,0,2],0],
        [[8,0],[4,0,3],0]
      ],
      name:"Rocks",
      m:[ //Rocks
        {id:[1,1],col:0,z:1},
        {id:[8,0],col:0,z:2,x:4},
        {id:[8,0],col:0,z:2,x:-4},
        {id:[8,0],col:0,z:3,x:4}
      ]
    },
    2:{
      p:[
        [[8,3],[0,0,1],27]
      ],
      name:"Magic Space",
      m:[ //Magic Space
        {id:[8,3],col:27,z:1},
      ]
    },
    3:{
      p:[
        [[14,6],[0,0,4,0,180,-90],1],
        [[14,32],[0,0,6.25,0,0,90],27],
        [[14,32],[0,0,5.2,180,0,-90],27]
      ],
      name:"Magic Door",
      m:[ //Magic Door
        {id:[14,6],col:1,z:4,ry:180,rz:-90},
        {id:[14,32],col:27,z:6.25,rz:90},
        {id:[14,32],col:27,z:5.2,rx:180,rz:-90}
      ]
    }
  }
};

socket.on('createSub',function(id,data){
  if(id == null) return;
  let obj = scene.getObjectByName("p_" + id);
  if(!obj) return;
  //Spawn Obj
  if(data){
    SpawnSub(id,data,obj);
  } //Remove Obj
  else RemoveSub(id);
});

function RemoveSub(id){
  let obj = scene.getObjectByName("sub_" + id);
  if(!obj) return;
  obj.parent.remove(obj);
}

function SpawnSub(id,data,piecePar,monst)
{
  if(data == null){
    RemoveSub(id);
    return;
  }
  var mid;

  if(!data.id) return;

  //Remove current subitem if it already exists
  if(scene.getObjectByName("sub_" + id)) RemoveSub(id);

  //var arr = csd.monsters[mid[1]].p;
  var monstData = subStruct[data.id[0]][data.id[1]];
  var arr = monstData.p;
  var par = new THREE.Object3D();
  par.name = "sub_" + id;
  piecePar.children[0].add(par); //sub group
  //par = new THREE.Object3D();
  Object.keys(arr).forEach(function(c){
    let co = c;
    c = arr[c];
    ImportPiece(c[0][0],c[0][1],function(child){
      var go = child.children[0];
      go.position.set(c[1][0] != null ? c[1][0] : 0,3 * (c[1][2]),c[1][1] != null ? c[1][1] : 0);
      go.rotation.set(c[1][3] != null ? c[1][3] * (Math.PI/180) : 0,c[1][5] != null ? c[1][5] * (Math.PI/180) : 0,c[1][4] != null ? c[1][4] * (Math.PI/180) : 0);
      //if(!par) piecePar.add(go.parent);
      par.add(go.parent);
      //else par.add(go.parent);
      SetColor(go,c[2]);
      go.scale.set(1,1,1);
      {
        go.name = "sub_" + id + "_" + co;
      }
    });
  });
}

var c_count = 0;
var c_total;
var tempSels = [];
function SpawnPiece(alts,i,atr,mode1,call,calliflast=false)
{
	var ar = [];
  var res2;
  if(!atr) atr = {prev:0};
  var prop = alts;//ver 0.3 syntax: alts.split(",");
  //var i = prop.props[5];//Object.keys(mainDOMs).length;//prop[10];
  if(!prop) return;
  if(!prop.props)
  {
    console.log("No props detected");
    return;
  }
  var mid = prop.props[0];//.split(".");
  if(!mode1)
  {
    //var o;
    //var mode3 = uo.child(mid[0]).child(mid[1]).exists();
    //o = uo.child(mid[0]).child(mid[1]).val();
    //if(!o) o = uo.child(1).child(0).val();
    var colObj = usableColors[parseInt(prop.props[2])];
    var childway = 0;

  ImportPiece(mid[0],(mid[1] ? mid[1] : 0),function(child){
    var go = child.children[0];
    if(!path_helperObj) if(mid[0] == 0 && mid[1] == 0){
      path_helperObj = child.children[0].clone();
      path_helperObj.material = new THREE.MeshBasicMaterial({transparent:true,opacity:0.5,color:0x00fa00});
    }
    //Set Data on Object
    go.userData = cloneS(prop);//{props:prop.props};
    if(prop.d){
      Object.keys(prop.d).forEach(function(key){
        go.userData[key] = prop.d[key];
      });
    }
    //Setup children containers
    var subCont = new THREE.Group();
    subCont.name = "subCont";
    go.add(subCont);
    var childCont = new THREE.Group();
    childCont.name = "childCont";
    go.add(childCont);

    var sc = 8;//0.75
    go.position.set(parseFloat(-prop.props[1][0]) * sc,parseFloat(prop.props[1][2])*3,parseFloat(prop.props[1][1])*sc);
    //var rot = {x: prop.props[1][4]?parseFloat(prop.props[1][4]):0, y: prop.props[1][3]?parseFloat(prop.props[1][3]):0, z: prop.props[1][5]?parseFloat(prop.props[1][5]):0};
    //var erot = [rad(rot.x),rad(rot.y),rad(rot.z)];
    //go.rotation.set(-erot[0]?erot[0]:0,-erot[1]?erot[1]:0,-erot[2]?erot[2]:0);
    go.rotation.set(-rad(prop.props[1][4]||0),-rad(prop.props[1][3]||0),-rad(prop.props[1][5]||0));

    //EXTRA DATA TEST
    if(prop.d){
      let d = prop.d;
      //Scaling Test
      if(d.s != null){
        go.scale.set(d.s,d.s,d.s);
      }
      //Spawning Subitems
      if(d.sub){
        SpawnSub(i,d.sub,go);
      }
    }

    /*if(alts.rot && false)
    {
      //go.rotation.set(0,-parseFloat(alts.rot.z) * Math.PI/180,0);
      go.rotation.set(0,0,0);
      if(prop.props[1][4]) go.rotation.x = -parseFloat(prop.props[1][4]) * Math.PI/180; //go.rotateAroundWorldAxis(new THREE.Vector3(1,0,0), -parseFloat(alts.rot.x) * Math.PI/180);
      if(prop.props[1][3]) go.rotation.y = -parseFloat(prop.props[1][3]) * Math.PI/180; //go.rotateAroundWorldAxis(new THREE.Vector3(0,1,0), -parseFloat(alts.rot.z) * Math.PI/180);
      if(prop.props[1][5]) go.rotation.z = -parseFloat(prop.props[1][5]) * Math.PI/180; //go.rotateAroundWorldAxis(new THREE.Vector3(0,0,1), -parseFloat(alts.rot.y) * Math.PI/180);
    }
    else go.rotation.set(0,0,0);*/
    if(childway == 2)
    {
      scene.remove(go.parent);
      scene.getObjectByName("p_" + selObjs[0].id).add(go.parent);
    }
    else if(childway == 1)
    {
    scene.remove(go.parent);
    go.scale.set(1,1,1);
    if(isAlt) socket.emit('editPiece',2,{id: i,inc: 1});
    else socket.emit('editPiece',2,{id: i,inc: 0});
    isAlt = false;
    if(scene.getObjectByName("p_" + prop.par))
    {
      scene.getObjectByName("p_" + prop.par).add(go.parent);
      go.position.set(0,0,0);
    }
    }
    SetColor(go,prop.props[2]);
    pieces.push(go);
    go.name = "p_" + i;
    /*if(prop.sub)//if(atr)
    {
      console.log("Spawning sub item");
      SpawnSub(i,prop.sub,go);
    }*/

    //END USER STUFF
    c_count++;
    //console.log("COUNT: ",c_count >= c_total);
    if(c_count >= c_total && calliflast){
      console.log("Finished loading all pieces.");
      if(call) call(go);
    }
    else if(!calliflast && call) call(go);
  });

  //Spaced STUFF
  if(alts.spaced && atr.isMe === true)
  {
    ConnectSurroundingTiles();
    socket.emit('editPiece',6,{id: i});
  }

  if(tempSels.includes(i) && atr.isMe === true)
  {
    if(selObjs.length == tempSels.length)
    {
      selObjs = [];
    }
    selObjs.push(gom);
    if(selObjs.length == tempSels.length)
    {
      selObjs = [];
      for(var ii = 0; ii < tempSels.length; ii++)
      {
        selObjs[ii] = scene.getObjectByName("p_" + tempSels[ii]);
      }
      //alert("deleting tempsels");
      tempSels = [];
    }
  }
}

//
  var c = i;
  var p = prop;
  var d = document.createElement("div");
  d.id = "hobj_" + c;
  var cd = document.createElement("span");
  cd.innerHTML = uo2.val()[p.props[0][0]][p.props[0][1]];
  var ii = document.createElement("span");
  ii.innerHTML = c;
  ii.style = "float:right";
  cd.appendChild(ii);
  var cdM = document.createElement("div");
  cdM.appendChild(cd);
  cdM.className = "cdM";
  d.appendChild(cdM);
  mapH.appendChild(d);
  d.addEventListener("mouseenter",function(){
    //var obj = scene.getObjectByName("p_" + this.parentNode.id.split("_")[1]);
    let id = this.id.split("_")[1];
    if(!hovers[id]) hovers[id] = [null,"#ff5555",2,-1,0];
  });
  d.addEventListener("mouseleave",function(){
    let id = this.id.split("_")[1];
    if(hovers[id]) hovers[id][3] = 0;
  });
  cdM.onmouseenter = function(){
    //var t = this.parentNode;
    //let id = t.childNodes[0].childNodes[0].childNodes[1].innerHTML;
    hHover = this;
  };
  cdM.onmouseleave = function(){
    hHover = null;
  };
  /*cdM.onclick = function(){
    var t = this.parentNode;
    if(t.childNodes[1]){
      t.removeChild(t.childNodes[1]);
      return;
    }
    let id = t.childNodes[0].childNodes[0].childNodes[1].innerHTML;
    var ob = scene.getObjectByName("p_" + id);
    var dat = ob.userData.props;
    //load
    var dd = document.createElement("div");
    dd.style.marginLeft = "10px";
    //Pos
    var posl = document.createElement("span");
    posl.innerHTML = "pos: ";
    for(let xyi = 0; xyi < 3; xyi++){
      var inp = document.createElement("input");
      inp.type = "number";
      inp.value = dat[1][xyi];
      inp.props = id;
      inp.style.width = "40px";
      inp.addEventListener('input',function(e){
        var val = parseFloat(this.value);
        if(val == null) return;
        if(typeof val != "number") return;
        //local
        var sobj = scene.getObjectByName("p_" + this.props);
        if(sobj){
          sobj.userData.props[1][xyi] = val;//sobj.position[xyi == 0 ? "x" : xyi == 1 ? "y" : "z"] = val * (xyi == 1 ? 4 : 10 * (xyi == 0 ? -1 : 1));
          updateObj(this.props,sobj.userData);
        }
        //server
        socket.emit('edit',1,this.props,[xyi,val]);
      });
      posl.appendChild(inp);
    }
    dd.appendChild(posl);
    //Rot
    var rotl = document.createElement("span");
    rotl.innerHTML = "rot: ";
    for(let roti = 0; roti < 3; roti++){
      //var inp =
    }
    //Remove
    var reml = document.createElement("button");
    reml.props = id;
    reml.innerHTML = "Remove";
    reml.className = "redB";
    reml.onclick = function(){
      removePiece(this.props);
      socket.emit('removePiece',this.props);
    };
    reml.style.transform = "scale(0.8)";
    dd.appendChild(reml);
    //Select
    var selb = document.createElement("button");
    selb.innerHTML = "Select";
    selb.onclick = function(){
      //alert(this.parentNode.childNodes[1].props);
      let obj = scene.getObjectByName("p_" + this.parentNode.childNodes[1].props);
      if(!selObjs.includes(obj)) SelectObj(obj,true,false);
      else{
        Actions(1,obj);
      }
    };
    selb.style = "float:right;float:bottom;";
    selb.style.transform = "scale(0.8)";
    dd.appendChild(selb);
    //
    t.appendChild(dd);
  };*/
}

function fixOverflow(el){
  var curOverflow = el.style.overflow;
  if (!curOverflow || curOverflow == "scroll") el.style.overflow = "hidden";
  var isOverflowingX = el.clientWidth < el.scrollWidth;
  var isOverflowingY = el.clientHeight < el.scrollHeight;
  el.style.overflowX = isOverflowingX?"scroll":"hidden";
  el.style.overflowY = isOverflowingY?"scroll":"hidden";
  //return [isOverflowingX,isOverflowingY];
}
const InputMenuData = [
  {},
  {
    data:"<h5>Import A Map</h5><hr><br><br><br><span>Map:</span><input><button onclick='LoadMap(this.parentNode.childNodes[6].value)'>Import</button>"
  }
];
var inputmenu = gp("inputmenu");
var subinputmenu = gp("sinputmenu");
function LoadInputMenu(id,u)
{
  //var data = InputMenuData[id];
  //if(!data) return;
  if(id == -1 || inputmenu.style.visibility == "visible") //Close menu
  {
    inputmenu.style.visibility = "hidden";
    inputmenu.innerHTML = "";
    renderer.domElement.style.pointerEvents = "";
    if(id == -1){
      gp("canvas_holder").style.filter = "none";
      return;
    }
  }
  inputmenu.style.visibility = "visible";
  gp("canvas_holder").style.filter = "grayscale(70%) blur(5px)";
  renderer.domElement.style.pointerEvents = "none";
  switch(id)
  {
    case 0:
      var end = function(u){
        user.serverdata = u;
        inputmenu.style.width = "75%";//800 + "px";
        inputmenu.style.height = "75%";//400 + "px";
        let h4 = document.createElement("h4");
        inputmenu.appendChild(h4);
        inputmenu.appendChild(document.createElement("hr"));

        let img = document.createElement("img");
        img.style = 'cursor:pointer;width: 20px; height: 20px; border-radius: 50%; transform: translate(0,22%); margin-right: 10px';
        img.src = u.photo;
        h4.appendChild(img);

        let name = document.createElement("span");
        name.innerHTML = u.name;
        h4.appendChild(name);

        let h4Div = document.createElement("div");
        h4Div.style = "float:right";
        h4.appendChild(h4Div);

        let createB = document.createElement("button");
        createB.onclick = function(){
          LoadInputMenu(1);
        };
        createB.className = "blueB";
        createB.style = "display:inline;margin-right:10px";
        createB.innerHTML = "Create";
        h4Div.appendChild(createB);
        let joinB = document.createElement("button");
        joinB.onclick = function(){
          LoadInputMenu(2);
        };
        joinB.className = "redB";
        joinB.style = "display:inline;margin-right:10px";
        joinB.innerHTML = "Join";
        h4Div.appendChild(joinB);

        if(u.s) inputmenu.childNodes[0].childNodes[0].style.border = (u.s.cu ? "dashed" : "solid") + " 2px " + (u.s.c != null ? usableColors[u.s.c].color : u.s.cu ? "gray" : "red");
        img.onclick = function(){
          LoadSubInputMenu(1);
        };
        if(u.mapIn){
          let div = document.createElement("div");
          let mapInD = u.mapIn.includes(";") ? u.mapIn.split(";") : [u.mapIn];
          mapKnowledgeData.resume = mapInD[0];
          div.innerHTML = "<button style='margin-right: 10px' onclick='if(pieces.length==0){socket.emit(`resume`,(data,sd)=>{loader(data,sd)});}else{LoadInputMenu(-1);LoadSubInputMenu(-1)}'>Resume</button>You were last in " + mapInD[0];
          inputmenu.appendChild(div);
          inputmenu.appendChild(document.createElement("br"));
        }
        else{
          let span = document.createElement("p");
          span.innerHTML = "Why don't you check out some cool maps? Create or Join below!";
          inputmenu.appendChild(span);
          inputmenu.appendChild(document.createElement("br"));
        }
        if(u.myMaps){
          let div = document.createElement("div");
          div.style = "overflow-x: hidden; overflow-y: scroll; height: 80px";
          var span = document.createElement("p");
          span.innerHTML = "Your Maps: " + "(" + u.myMaps.length + ")";
          inputmenu.appendChild(span);
          u.myMaps.forEach(c=>{
            var sec = document.createElement("button");
            sec.className = "grayB";
            sec.style = "margin: 5px;";
            sec.innerHTML = c;
            sec.onclick = function(e){
              //alert("Attemping to join: " + this.innerHTML);
            }
            div.appendChild(sec);
          });
          inputmenu.appendChild(div);
          inputmenu.appendChild(document.createElement("br"));
        }
        else{
          let span = document.createElement("p");
          span.innerHTML = "It seems you haven't made any maps. Why not start now? Click the Create button.<br>"
          inputmenu.appendChild(span);
          inputmenu.appendChild(document.createElement("br"));
        }
        if(u.mapHistory){
          let div = document.createElement("div");
          div.style = "overflow-x: hidden; overflow-y: scroll; height: 80px";
          var span = document.createElement("p");
          span.innerHTML = "Your Map History: " + "(" + Object.keys(u.mapHistory).length + ")";
          inputmenu.appendChild(span);
          Object.keys(u.mapHistory).forEach(c=>{
            var sec = document.createElement("button");
            sec.className = "grayB";
            sec.style = "margin: 5px;";
            sec.innerHTML = c;
            sec.onclick = function(e){
              socket.emit('joinMap',this.innerHTML,"",(data,sd)=>{
                if(data.er){
                  console.log("An error occured while trying to join.");
                  if(data.er.t == 0) LoadSubInputMenu(0,data.er.d);
                }
                else loader(data,sd);
              });
            }
            div.appendChild(sec);
          });
          inputmenu.appendChild(div);
          inputmenu.appendChild(document.createElement("br"));
        }
        else{
          let span = document.createElement("p");
          span.innerHTML = "You haven't joined any maps, why not? Click the Join button.";
          inputmenu.appendChild(span);
          inputmenu.appendChild(document.createElement("br"));
        }
      }
      if(!u){
        socket.emit('getData',0,function(d){
          if(id == 0){
            u = d;
            end(u);
          }
        });
      }
      else end(u);
    break;
    /*case -900: //Import a local map
      inputmenu.style.width = 300 + "px";
      inputmenu.style.height = 200 + "px";
      inputmenu.innerHTML = data.data;
    break;*/
    case 1: //Create menu
      inputmenu.style.width = "75%";//800 + "px";
      inputmenu.style.height = "75%";//400 + "px";
      var dhead = "<h4>Create A Map<div style='float: right'><button class='blueB' style='display: inline; margin-right: 10px'>Create</button></div></h4><hr><div><div style='display:inline-block;width:50%;height:75%'><div id='createMenu_left' style='position:absolute'><span>Name: <input></span><br><br><span>Edit Password: <input></span><br><br><span>View Password: <input></span></div></div><button style='float:bottom;margin-left:50%;transform:translate(-50%,0)' onclick='LoadInputMenu(0)'>Back</button>";
      inputmenu.innerHTML = dhead;
      let bu = inputmenu.childNodes[2].childNodes[0].childNodes[0];
      let namei = bu.childNodes[0].childNodes[1];
      let epassi = bu.childNodes[3].childNodes[1];
      let vpassi = bu.childNodes[6].childNodes[1];
      //namei.value = "test";
      //epassi.value = "test1";
      //vpassi.value = "test2";
      let button = inputmenu.childNodes[0].childNodes[1].childNodes[0];

      button.onclick = function(){
        //alert("Creating map with name: " + namei + " and editPass: " + epassi + " and viewPass: " + vpassi);
        socket.emit('createMap',{n:namei.value,ep:epassi.value,vp:vpassi.value},function(out,data){
          if(typeof out == "string"){
            alert("ERR: " + out);
            return;
          }
          if(out === true){
            socket.emit('joinMap',data.n,data.ep,(data,sd)=>{
              //alert(`hi there`);
              if(data.er){
                alert("Incorrect Password!");
                //console.log("An error occured while trying to join.");
                if(data.er.t == 0) LoadSubInputMenu(0,data.er.d);
              }
              else loader(data,sd);
            });
          }
        });
      };
      ////
    break;
    case 2: //Join menu
      inputmenu.style.width = "75%";//800 + "px";
      inputmenu.style.height = "75%";//400 + "px";
      var dhead = "<h4>Join A Map<div style='float: right'></div></h4><hr><div></div><div style='display:inline-block;width:50%;height:75%'><div id='joinMenu_left' style='position:absolute'></div></div><div style='display:inline-block;width:50%;height:75%'><div style='position:absolute' id='joinMenu_right'></div></div><button style='float:bottom;margin-left:50%;transform:translate(-50%,0)' onclick='LoadInputMenu(0)'>Back</button>";
      inputmenu.innerHTML = dhead;
      var joinMenuL = gp("joinMenu_left");
      var joinMenuR = gp("joinMenu_right");
      //Setup menu left : Search/Data
      var p = document.createElement("p");
      p.innerHTML = "Search Maps";
      joinMenuL.appendChild(p);
      var joinName = document.createElement("div");
      joinName.innerHTML = "Name: <input id='joinName'><button style='margin-left:10px' onclick='searchMaps(0,this.parentNode.childNodes[1].value)'>Search</button>";
      joinMenuL.appendChild(joinName);

      //Setup menu right : Result/Input
    break;
    case 3: //Welcome new user
      user.serverdata = u;
      inputmenu.style.width = 800 + "px";
      inputmenu.style.height = 400 + "px";
      var dhead = "<h4>Welcome <span>" + u.name + "</span> to LGCP Online EDITION 6!</h4><hr><div></div><button style='float:bottom;margin-left:50%;transform:translate(-50%,0)' onclick='LoadInputMenu(0)'>Continue</button>";
      inputmenu.innerHTML = dhead;
    break;
    case 4: //Non-Logged in screen
      inputmenu.style.width = 300 + "px";
      inputmenu.style.height = 150 + "px";
      var dhead = "<div style='text-align:center'><h4>Welcome to LGCP Online EDITION 6!</h4><br><span>Please Log In</span></div><br><div></div><button style='float:bottom;margin-left:50%;transform:translate(-50%,0)' onclick='LogIn()'>Log In</button>";
      inputmenu.innerHTML = dhead;
    break;
    case 5: //Map Settings
      inputmenu.style.width = "80%";
      inputmenu.style.height = "80%";

      var head = document.createElement("div");
      inputmenu.appendChild(head);
      head.style = "margin:5px;";
      var title = document.createElement("h4");
      title.innerHTML = "Map Settings<hr>";
      head.appendChild(title);

      var right = document.createElement("div");
      right.style = "width:40%;float:right";
      right.className = "settingsList";
      //right.style.height = "90%";//(inputmenu.clientHeight-130) + "px"
      head.appendChild(right);
      var left = document.createElement("div");
      left.style = "width:40%";
      left.className = "settingsList";
      //left.style.height = "90%";//(inputmenu.clientHeight-130) + "px";
      head.appendChild(left);
      //var dhead = "<div style='text-align:center'><h4>Welcome to LGCP Online EDITION 6!</h4><br><span>Please Log In</span></div><br><div></div><button style='float:bottom;margin-left:50%;transform:translate(-50%,0)' onclick='LogIn()'>Log In</button>";

      //if(u == null) u = {name:mapKnowledgeData.resume};

      //left settings
      let settingsLeft = [ //title:,desc:,onload
        {t:"Map Password",d:"<br><input id='set_mapPass_i'>",l:function(){
          socket.emit('getter2',1,[0],function(pass){
            var input = document.getElementById("set_mapPass_i");
            if(pass === false || pass == null){
              var span = document.createElement("span");
              span.innerHTML = "NO PERMISSION";
              input.parentNode.appendChild(span);
              input.parentNode.removeChild(input);
            }
            else{
              input.value = pass;
              input.addEventListener('input',function(){
                socket.emit('setter',0,[this.value]);
              });
            }
          });
        }},
        {t:"Map Description",d:"<br><span id='mapDesc_l'></span><br><br><button onclick='LoadSubInputMenu(6,document.getElementById(`mapDesc_l`).innerHTML)'>Change Description</button>",l:function(){
          socket.emit('getter2',1,[1],function(desc){
            var area = document.getElementById("mapDesc_l");
            area.innerHTML = desc;
          });
        }}
      ];
      settingsLeft.forEach(function(set){
        var div = document.createElement("div");
        var h4 = document.createElement("span");
        h4.style = "font-weight:bold";
        h4.innerHTML = set.t;
        div.appendChild(h4);
        div.appendChild(document.createElement("br"));
        var desc = document.createElement("div");
        desc.innerHTML = set.d;
        div.appendChild(desc);
        if(set.l) set.l();
        left.appendChild(div);
      });
      //right settings
      var userDiv = document.createElement("div");
      right.appendChild(userDiv);
      userDiv.innerHTML = "<h4>Players</h4><br><br>";
      socket.emit('getter2',1,[2],function(data){ //Get all users in Map
        Object.keys(data).forEach(uid=>{
          var user = data[uid];
          var d = document.createElement("div");
          d.style = "background-color:white;width:auto;height:20px;padding:5px;border:solid 1px lightgray;border-radius:3px;margin:5px;box-shadow:0px 2px 2px rgba(0,0,0,0.2);cursor:pointer";
          d.style.borderBottom = "solid 4px " + usableColors[user.s.c].color;
          var img = document.createElement("img");
          img.style = "position:absolute;width:20px;height:20px;margin:5px;margin-top:-2px;border-radius:50%;border:solid 2px " + usableColors[user.s.c].color;
          img.src = user.p;
          d.appendChild(img);
          var status = document.createElement("span");
          status.style = "float:right;margin-right:5px";
          status.innerHTML = (user.off?"":"Online");
          status.id = "settings_status_" + uid;
          d.appendChild(status);
          var name = document.createElement("span");
          name.style = "margin-left:40px";
          name.innerHTML = user.name;
          d.appendChild(name);
          d.props = uid;
          d.onmouseenter = function(){
            d.style.backgroundColor = "gainsboro";
          };
          d.onmouseleave = function(){
            d.style.backgroundColor = "white";
          };
          d.onclick = function(){
            alert("profiles coming soon...");
          };
          userDiv.appendChild(d);
        });
      });
    break;
  }
  fixOverflow(inputmenu);
}
socket.on('setter',function(id,data){
  console.log("status change: ",data);
  switch(id){
    case 0:
      var inp = document.getElementById("set_mapPass_i");
      if(!inp) return;
      inp.value = data;
    break;
    case 1:
      var area = document.getElementById("mapDesc_l");
      if(area) area.innerHTML = data;
      var areaI = document.getElementById("mapDesc_i");
      if(areaI) areaI.innerHTML = data;
    break;
    case 2: //User became online
      var settingsStat = document.getElementById("settings_status_" + data[0]);
      if(settingsStat) settingsStat.innerHTML = data[1] != null ? data[1] : "";
    break;
  }
});
function LoadSubInputMenu(id,u){
  if(id == -1 || subinputmenu.parentNode.style.visibility == "visible") //Close menu
  {
    subinputmenu.parentNode.style.visibility = "hidden";
    if(id == -1) return;
  }
  subinputmenu.innerHTML = "";
  subinputmenu.parentNode.style.visibility = "visible";
  subinputmenu.style.width = "200px";
  subinputmenu.style.width = "200px";
  subinputmenu.style.marginTop = "";
  subinputmenu.style.transform = "translate(-50%,-50%)";
  switch(id){
    case 0: //Update Password
      var d = document.createElement("div");
      d.innerHTML = "<h4>Update Password</h4><hr><br><input style='margin-left:50%;transform:translate(-50%,0)'><br><br>";
      var b = document.createElement("button");
      b.props = u;
      b.onclick = function(){
        socket.emit('joinMap',this.props,this.parentNode.childNodes[3].value,(data,sd)=>{
          //alert(`hi there`);
          if(data.er){
            alert("Incorrect Password!");
            //console.log("An error occured while trying to join.");
            if(data.er.t == 0) LoadSubInputMenu(0,data.er.d);
          }
          else loader(data,sd);
        })
      }
      b.className = "redB";
      b.style = "width:100px;margin-left:50%;transform:translate(-50%,0)";
      b.innerHTML = "Join";
      d.appendChild(b);
      d.appendChild(document.createElement("br"));
      d.appendChild(document.createElement("br"));
      var bb = document.createElement("button");
      bb.innerHTML = "Back";
      bb.style = "margin-left:50%;transform:translate(-50%,0)";
      bb.onclick = function(){
        LoadSubInputMenu(-1);
      }
      d.appendChild(bb);
      subinputmenu.appendChild(d);
    break;
    case 1: //Change player - colors and all that
      subinputmenu.style.width = "300px";
      subinputmenu.style.height = "auto";
      var d = document.createElement("div");
      d.innerHTML = "<h4>Player Settings</h4><hr><br><button>Set Player Color</button><br><br><div></div><br><br><span>Custom: <i>COMMING SOON</i></span><br>";
      var b = d.childNodes[3];
      //b.props = u;
      b.onclick = function(){
        var d = this.parentNode.childNodes[6];
        console.log(d);
        if(d.childNodes[0]){
          d.innerHTML = "";
          d.id = "";
          return;
        }
        d.id = "swatch";
        d.style.position = "static";
        let ind = 0;

        swatch.childNodes.forEach(function(ch){
          var child = ch.cloneNode(true);
          d.appendChild(child);
          child.props = ind;
          //Outline color square if it's selected
          //if(scene.getObjectByName(user.uid).userData.c == child.props){
          if(false){
            child.style.border = "dashed 1px orange";
            child.style.borderRadius = "50%";
            //child.style.border = "inset 2px orange";
            //var star = document.createElement("div");
            //<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/></svg>
            //alert("LOGGER");
            //console.log(star);
            //star.innerHTML = '<svg><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/></svg>';
            //star.style = "position:absolute;transform:scale(0.5,0.5)";
            //child.appendChild(star);
          }
          //Select new player color
          child.onclick = function(){
            var p = scene.getObjectByName(user.uid);
            if(p){
              SetColor(p,this.props);
              p.userData.c = this.props;
            }
            inputmenu.childNodes[0].childNodes[0].style.borderColor = (this.props != null ? usableColors[this.props].color : "red");

            this.parentNode.childNodes.forEach(boxChild=>{
              boxChild.style.borderRadius = "unset";
            });
            this.style.borderRadius = "50%";

            socket.emit('editUser',0,this.props);
          };
          child.onmouseover = function(){
            var t = this.childNodes[0].style;
            t.visibility = "visible";
            //this.props.zIndex = 20;
            this.style.zIndex = 1;
            this.style.width = "25px";
            this.style.height = "25px";
            this.style.boxShadow = "0px 2px 2px rgba(0,0,0,0.5)";
          };
          child.onmouseleave = function(){
            this.childNodes[0].style = "";
            this.style.zIndex = 0;
            this.style.width = "20px";
            this.style.height = "20px";
            this.style.boxShadow = "none";
          };
          ind++;
        });
        //Quickly get player color id
        /*socket.emit('getter',[{i:0},{i:0}],function(i,data){
          switch(i){
            case 0:
              console.log("YE: ",data);
            break;
          }
        });*/
        socket.emit('getter2',0,null,function(id){
          if(id == null) return;
          if(!d.childNodes[id]) return;
          d.childNodes[id].style.borderRadius = "50%";
        }); //id,callback,data(optional)
        //
      }
      b.className = "blueB";
      b.style = "width:150px;margin-left:50%;transform:translate(-50%,0)";
      d.appendChild(document.createElement("br"));
      d.appendChild(document.createElement("br"));
      var bb = document.createElement("button");
      bb.innerHTML = "Back";
      bb.style = "margin-left:50%;transform:translate(-50%,0)";
      bb.onclick = function(e){
        LoadSubInputMenu(-1);
      }
      d.appendChild(bb);
      subinputmenu.appendChild(d);
    break;
    case 2: //Advanced Piece Settings
      subinputmenu.style.width = "500px";
      subinputmenu.style.height = "auto";
      var d = document.createElement("div");
      d.innerHTML = "<h4 style='margin:5px'>Advanced Piece Settings</h4><div></div><hr><div></div><br><br><span><i>COMMING SOON</i></span><br>";

      let menub = d.childNodes[1];
      let pathOptions = document.createElement("button");
      pathOptions.innerHTML = "Path Options";
      pathOptions.onclick = function(){
        let head = this.parentNode.parentNode.childNodes[3];
        head.innerHTML = "";
        //Create Left and Right divs
        let left = document.createElement("div");
        left.style = "width:250px;height:100px;position:absolute;";
        //left.style.backgroundColor = "dodgerblue";
        let rightd = document.createElement("div");
        rightd.style = "width:250px;height:100px;margin-left:250px";
        //rightd.style.backgroundColor = "tomato";
        head.appendChild(left);
        head.appendChild(rightd);
        //Is this piece part of the path?
        var lab = document.createElement("span");
        lab.innerHTML = "Is this piece part of the path?";
        var inp = document.createElement("input");
        inp.type = "checkbox";
        inp.style = "float:right;display:inline-block;width:auto;box-shadow:none;border:none;backgroundcolor:none";
        inp.props = false;
        //inp.value = false; //will load from data later
        inp.addEventListener('click',function(){
          this.props = !this.props;
          let id = selObjs[0].name.split("_")[1];
          if(this.props){
            //Position labels and input
            let labPos = document.createElement("div");
            labPos.innerHTML = "<br>Origin Position <span style='cursor:pointer' onclick='alert('')'>(?)</span>: ";
            if(!selObjs[0].userData.ori){
              updateObj(id);
              socket.emit('edit',2,id,["origin",[0,0,2]]);
              selObjs[0].userData.ori = [0,0,2];
            }
            var xpos = document.createElement("input");
            xpos.type = "number";
            xpos.style.width = "35px";
            xpos.value = selObjs[0].userData.ori[0]; //temp
            xpos.props = selObjs[0];//selObjs[0].name;
            xpos.addEventListener('input',function(){
              if(parseFloat(this.value) != this.value) return;
              this.props.userData.ori[0] = this.value;
              updateObj(id);
              socket.emit('edit',2,id,["origin",0,parseFloat(this.value)]);
            });
            //y
            var ypos = xpos.cloneNode();
            ypos.value = selObjs[0].userData.ori[1];
            ypos.props = selObjs[0];
            ypos.addEventListener('input',function(){
              if(parseFloat(this.value) != this.value) return;
              this.props.userData.ori[1] = this.value;
              updateObj(id);
              socket.emit('edit',2,id,["origin",1,parseFloat(this.value)]);
            });
            //z
            var zpos = ypos.cloneNode();
            zpos.value = selObjs[0].userData.ori[2];
            zpos.props = selObjs[0];
            zpos.addEventListener('input',function(){
              if(parseFloat(this.value) != this.value) return;
              this.props.userData.ori[2] = this.value;
              updateObj(id);
              socket.emit('edit',2,id,["origin",2,parseFloat(this.value)]);
            });
            labPos.appendChild(xpos);
            labPos.appendChild(ypos);
            labPos.appendChild(zpos);
            lab.appendChild(labPos);
          }
          else{
            this.parentNode.removeChild(this.parentNode.childNodes[2]);
            //Delete all data for custom origin
            updateObj(id);
            socket.emit('edit',2,id,["origin",null]);
            delete selObjs[0].userData.ori; //[0,0,1];
            //alert(Object.keys(selObjs[0].userData));
          }
        });
        lab.appendChild(inp);
        left.appendChild(lab);

        if(selObjs[0].userData.ori){
          inp.click();
        }
      };
      menub.appendChild(pathOptions);
      //<button>Path Options</button>

      var bb = document.createElement("button");
      bb.innerHTML = "Back";
      bb.style = "margin-left:50%;transform:translate(-50%,0)";
      bb.onclick = function(e){
        LoadSubInputMenu(-1);
      }
      d.appendChild(bb);
      subinputmenu.appendChild(d);
    break;
    case 3: //Are you sure? To remove this piece
      //removePiece(this.props);
      //socket.emit('removePiece',this.props);
      subinputmenu.style.width = "200px";
      subinputmenu.style.height = "auto";
      var d = document.createElement("div");
      d.innerHTML = "<h4>Are you sure you want to remove " + (selObjs.length == 1 ? "this piece?" : "these pieces?<br><br><small><i>All selected pieces will be removed.</i></small>") + "</h4>";
      //d.childNodes[0].style.marginTop = "0px";

      var by = document.createElement("button");
      by.innerHTML = "Yes (Shift+X)";
      //by.style = "display:inline-block";
      //by.style = "margin-left:50%;transform:translate(-75%,0)";
      by.onclick = function(){
        let ar = [];
        selObjs.forEach(function(c){
          ar.push(c.name.split("_")[1]);
        });
        ar.forEach(function(c){
          let id = c;//c.name.split("_")[1];
          removePiece(id,true);
          socket.emit('removePiece',id);
        });
        LoadSubInputMenu(-1);
      };
      d.appendChild(by);

      var bb = document.createElement("button");
      bb.innerHTML = "Back";
      bb.style = "float:right";//"margin-left:50%;transform:translate(-25%,0)";
      bb.onclick = function(e){
        LoadSubInputMenu(-1);
      }
      d.appendChild(bb);
      subinputmenu.appendChild(d);
    break;
    case 4: //Path Edit Menu
      subinputmenu.style.width = "100%";
      //subinputmenu.style.marginTop = "40px";
      subinputmenu.style.right = 0;
      subinputmenu.style.left = 0;
      subinputmenu.style.top = 0;
      subinputmenu.style.bottom = 0;
      //subinputmenu.style.display = "block";
      subinputmenu.style.margin = "0px 20px -20px 0px";
      subinputmenu.style.height = "auto";
      var exitB = document.createElement("button");
      exitB.innerHTML = "Exit";
      exitB.style = "position:absolute;right:0;bottom:0;";
      exitB.onclick = function(){
        LoadSubInputMenu(-1);
      };
      subinputmenu.appendChild(exitB);
    break;
    case 5: //Are you sure? To add green highlighted piece to blue highlighted piece
      if(selObjs.length <= 1) return;
      for(let i = 0; i < selObjs.length-1; i++){
        var add = true;

        if(checkIfChildOf(selObjs[0],selObjs[1])){
          var d = document.createElement("div");
          d.innerHTML = "<h4>You cannot add a parent to one of its children.</h4>";

          var bb = document.createElement("button");
          bb.innerHTML = "Back";
          bb.style = "margin-left:50%;transform:translate(-50%,0)";
          bb.onclick = function(){
            LoadSubInputMenu(-1);
          }
          d.appendChild(bb);
          subinputmenu.appendChild(d);
          return;
        }
        /*if(selObjs[0].parent.parent?selObjs[1].userData.c:false){
          if(selObjs[0].parent.parent.name == selObjs[1]){
            if(selObjs[1].parent.name == "") add = false;
          }
        }
        else if(selObjs[1].parent.parent?selObjs[0].userData.c:false){
          let sel0Name = selObjs[0].name;
          selObjs[0] = scene.getObjectByName(selObjs[1].name);
          selObjs[1] = scene.getObjectByName(sel0Name);
          if(selObjs[0].parent.parent) if(selObjs[0].parent.parent.name == selObjs[1]){
            if(selObjs[1].parent.name == "") add = false;
          }
        }*/
        if(selObjs[1].userData.c) if(selObjs[1].userData.c.includes(parseInt(selObjs[0].name.split("_")[1]))) add = false;
        /*else if(selObjs[0].userData.c){
          let sel0Name = selObjs[0].name;
          selObjs[0] = scene.getObjectByName(selObjs[1].name);
          selObjs[1] = scene.getObjectByName(sel0Name);
          if(selObjs[1].userData.c.includes(parseInt(selObjs[0].name.split("_")[1]))) add = false;
        }*/
        //if(selObjs[0].userData.c) if(selObjs[0].userData.c.includes(parseInt(selObjs[1].name.split("_")[1]))) add = false;
        //set ups hovers
        hovers[parseInt(selObjs[0].name.split("_")[1])] = [null,"#55ff55",2,-1,0];
        hovers[parseInt(selObjs[1].name.split("_")[1])] = [null,"#5555ff",2,-1,0];

        subinputmenu.style.width = "200px";
        subinputmenu.style.height = "auto";
        subinputmenu.style.marginTop = window.innerHeight*0.5;
        subinputmenu.style.transform = "translate(-50%,-100%)";
        var d = document.createElement("div");
        if(add) d.innerHTML = "<h4>Are you sure you want to pair these objects?<br><br><i>The </i><span style='color:green'>GREEN</span><i> highlighted piece will be added to the </i><span style='color:#5555ff'>BLUE</span><i> highlighted piece.</i></h4>";
        else d.innerHTML = "<h4>Are you sure you want to <span style='color:red'>remove</span> the pairing between these objects?<br><br><i>The </i><span style='color:green'>GREEN</span><i> highlighted piece will be removed from the </i><span style='color:#5555ff'>BLUE</span><i> highlighted piece.</i></h4>";

        var by = document.createElement("button");
        by.innerHTML = "Yes";
        //by.style = "display:inline-block";
        //by.style = "margin-left:50%;transform:translate(-75%,0)";
        by.onclick = function(){
          Actions(2);
          hovers[parseInt(selObjs[0].name.split("_")[1])][3] = 0;
          hovers[parseInt(selObjs[1].name.split("_")[1])][3] = 0;
          LoadSubInputMenu(-1);
        };
        d.appendChild(by);

        var bb = document.createElement("button");
        bb.innerHTML = "Back";
        bb.style = "float:right";//"margin-left:50%;transform:translate(-25%,0)";
        bb.onclick = function(e){
          hovers[parseInt(selObjs[0].name.split("_")[1])][3] = 0;
          hovers[parseInt(selObjs[1].name.split("_")[1])][3] = 0;
          LoadSubInputMenu(-1);
        }
        d.appendChild(bb);
        subinputmenu.appendChild(d);
      }
    break;
    case 6: //Edit Map Desc
      subinputmenu.style.width = "auto";
      subinputmenu.style.height = "auto";
      subinputmenu.style.maxWidth = window.innerWidth-40;
      subinputmenu.style.maxHeight = window.innerHeight-40;

      var h4 = document.createElement("h4");
      h4.innerHTML = "Edit Map Description";
      subinputmenu.appendChild(h4);

      var area = document.createElement("textarea");
      area.id = "mapDesc_i";
      area.style.maxWidth = window.innerWidth*0.8;
      area.style.maxHeight = window.innerHeight*0.8;
      if(u) area.value = u;
      subinputmenu.appendChild(area);

      subinputmenu.appendChild(document.createElement("br"));

      var bb = document.createElement("button"); //back button
      bb.innerHTML = "Back";
      bb.style = "float:right";
      bb.onclick = function(){
        LoadSubInputMenu(-1);
      };
      subinputmenu.appendChild(bb);
      var cb = document.createElement("button"); //confirm button
      cb.innerHTML = "Confirm";
      cb.onclick = function(){
        var value = document.getElementById("mapDesc_i").value;
        socket.emit('setter',1,[value]);
        var area = document.getElementById("mapDesc_l");
        if(area) area.innerHTML = value;
        LoadSubInputMenu(-1);
      };
      subinputmenu.appendChild(cb);
    break;
  }
}
socket.on('updateUser',function(who,s){
  var p = scene.getObjectByName(who);
  if(!p) return;
  if(s){
    p.userData = s;
    if(s.c != null) SetColor(p,s.c);
  }
});
var reMain;
var reObj = new THREE.Object3D();
var reRen;
var reScene;
var reCam;
function reSpawn(data){
  reScene.remove(reObj);
  reObj = new THREE.Object3D();
  reScene.add(reObj);
  var r = 1;//1.25;
  reObj.scale.set(r,r,r);
  reObj.position.y -= 10;
  reObj.rotation.y += 45*(Math.PI/180);
  data.forEach(function(da){
    ImportPiece(da[0][0],da[0][1],function(obj){
      obj.castShadow = true;
        obj.receiveShadow = true;
        obj.position.set(da[1][0] != null ? da[1][0] : 0,3 * (da[1][2]),da[1][1] != null ? da[1][1] : 0);
        obj.rotation.set(da[1][3] != null ? da[1][3] * (Math.PI/180) : 0,da[1][5] != null ? da[1][5] * (Math.PI/180) : 0,da[1][4] != null ? da[1][4] * (Math.PI/180) : 0);
        //if(link != "14/Hologram") obj.scale.set(r,r,r);
        //else obj.position.set(0,3,0);
        reObj.add(obj.parent);
        if(da[2] == null) obj.material = material;
        else SetColor(obj,da[2]);

        reRen.render(reScene,reCam);
    },null,true);
  });
}
function fakeInit(){
  user = {};
  user.displayName = "Cody"
  user.uid = "cody";
  user.photoURL = "https://lh6.googleusercontent.com/-8TTM-kvuDUY/AAAAAAAAAAI/AAAAAAAADmQ/SLN2QHdo9v0/photo.jpg";
  Init();
}
function Init()
{
  //Test Spawn Piece
  //SpawnPiece({props:[[0,0],20,-20,0,6,12],dirs:[9,11,-1,10]}); //Edition 5 syntax
  //SpawnPiece({props:[[0,0],[2,-2,0],6]}); //Edition 6 syntax
  //Init
  socket.emit('initUser',user,(data,newuser)=>{
    if(newuser) LoadInputMenu(3,data);
    else{
      console.log("INIT USER",data);
      LoadInputMenu(0,data);
      animate();
    }
  });

  //Load Import map test menu
  //LoadInputMenu(1);

  //V0.2 -- Reusable Scene
  reMain = document.createElement("div");
  reMain.style = "position:absolute;z-index:99;visibility:hidden;";
  //reMain.style = "z-index:99;width:10px;height:10px;position:absolute";
  document.body.appendChild(reMain);
  reScene = new THREE.Scene();
  reCam = new THREE.PerspectiveCamera( 75, 1, 0.1, 1000 );

  reScene.add(reObj);

  reRen = new THREE.WebGLRenderer();
  reRen.setSize(100,100);
  reMain.appendChild( reRen.domElement );
  //reRen.setClearColor(0xffffff, 1);
  reRen.domElement.className = "reRen";//style = "z-index:999;width:200px;height:200px;position:absolute";
  //reRen.domElement.style = "opacity:0.5";

  var light = new THREE.AmbientLight(0xffffff,0.7);
  reScene.add(light);
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.65);
  directionalLight.castShadow = true;
  directionalLight.target = targ;
  directionalLight.shadow.camera.left = -450.5; //default is 450.5
  directionalLight.shadow.camera.right = 450.5;
  directionalLight.shadow.camera.top = 450.5;
  directionalLight.shadow.camera.bottom = -450.5;
  directionalLight.shadow.mapSize.width = 4096;
  directionalLight.shadow.mapSize.height = 4096;
  directionalLight.shadow.camera.far = 2000;
  directionalLight.shadow.camera.near = -1000;

  reScene.add(directionalLight);

  var geometry = new THREE.BoxGeometry();
  var material = new THREE.MeshStandardMaterial( { color: 0x00ff00 } );
  //var cube = new THREE.Mesh( geometry, material );
  //cube.rotation.set(25,25,25);
  //reScene.add( cube );

  reCam.position.z = 30;
  reCam.position.y = 20;
  //reCam.position.x = 30;
  //reCam.rotation.x = Math.PI/6;
  //var deg = 45*(Math.PI/180);
  //reCam.rotation.set(0,deg,0.5);//-Math.PI/10;
  reCam.rotation.set(-0.5,0,0);

  reRen.render(reScene,reCam);

  //reSpawn(0,0);
}

/*socket.on('userData',function(data,newuser){
  if(newuser) LoadInputMenu(3,data);
  else LoadInputMenu(0,data);
});*/
function searchMaps(id,name)
{
  socket.emit('searchMaps',id,name,(id,result,alt)=>{
    if(id == null) return;
      switch(id)
      {
        case 0: //join menu search results
          var left = gp("joinMenu_left");
          var right = gp("joinMenu_right");
          if(!left || !right) return;
          right.innerHTML = "";
          var p = document.createElement("p");
          p.innerHTML = !result ? "No Results" : "We found it!";
          right.appendChild(p);
          if(result && result.des){
            var p = document.createElement("p");
            p.innerHTML = "Description:<br>" + result.des;
            right.appendChild(p);
          }
          if(result.pass && (alt ? !alt.o : true)){
            var pa = document.createElement("div");
            pa.innerHTML = "<br>Password: <input id='pass_i'>";
            right.appendChild(pa);
            if(alt ? alt.p : false) gp('pass_i').value = alt.p;
          }
          var b = document.createElement("button");
          b.innerHTML = "Join!";
          b.className = "redB";
          b.style.width = "100px";
          b.style.margin = "10px";
          b.style.marginLeft = "50%";
          b.style.transform = "translate(-50%,0)";
          b.onclick = function(){
            socket.emit('joinMap',gp('joinName').value,gp('pass_i').value,(data,sd)=>{
              if(data.er){
                console.log("An error occured while trying to join.");
                if(data.er.t == 0) LoadSubInputMenu(0,data.er.d);
              }
              else loader(data,sd);
            });
          }
          right.appendChild(document.createElement("br"));
          right.appendChild(b);
        break;
      }
    })
  }
    /*socket.on('searchResult',function(id,result,alt){

    });*/
    /*socket.on('joinMap',function(outcome,er){
      var name = gp('joinName');
      var pass = gp('pass_i');
      if(!name) return;
      //if(outcome) alert("Joined " + name.value + " successfully with/without password: " + pass.value);
      if(er) er.forEach(r=>{console.log(r);});
});*/
socket.on('loadMap',function(data){ //depricated
  alert("We recieved a disconnected load Map request by the server. Note this is depricated and will be removed in later releases. IT HAS BEEN REMOVED AS OF 12/20/19");
  return;
  console.log("LOADED MAP DATA:",data);
  LoadInputMenu(-1);
  Object.keys(data.p).forEach(c=>{
    var p = data.p[c];
    SpawnPiece(p);
  });
});

function LoadMap(map) //depricated
{
  console.log("Attemping to Load: " + map);
  var res = JSON.parse(map);
  if(!res) return false;
  else LoadInputMenu(-1);
  res.forEach(function(c){
    var prop = c.props;
    SpawnPiece(c);
  });
  return true;
}

function loader(data,sdata={}){
  console.log("LOADING MAP");
  if(pieces.length > 0){ //A map has already been loaded
    for(let i = 0; i < pieces.length; i++){
      scene.remove(pieces[i].parent);
    }
    pieces = [];
  }
  if(path_helpers){
    path_helpers.forEach(function(c){
      scene.remove(c);
    });
    path_helpers = [];
  }
  players.forEach(function(c){
    scene.remove(c);
  });
  players = [];
  mapH.innerHTML = "";
  LoadSubInputMenu(-1);
  LoadInputMenu(-1);
  c_count = 0;
  c_total = Object.keys(data.p).length;
  Object.keys(data.p).forEach(c=>{
    var p = data.p[c];
    var ccall;
    //console.log("SOMETHING: ",c == Object.keys(data.p)[Object.keys(data.p).length-1]);
    //if(c == Object.keys(data.p)[Object.keys(data.p).length-1])
    ccall = function(){
      Object.keys(data.u).forEach(c=>{
        if(sdata[c]){
          SpawnPlayer(c,data.u[c].l,sdata[c]);
        }
      });
      pieces.forEach(function(obj){
        let id = obj.name.split("_")[1];
        updateObj(id,obj.userData);
      });
    };
    SpawnPiece(p,c,null,null,ccall,true);
    //
  });
}

//[{props:[[0,0],0,0,0,16,0]}]

//}
//MainScope();

//[{"props":[[0,0],0,0,0,16,0],"dirs":[-1,"1",-1,-1]},{"props":[[0,0],0,-20,0,0,1],"dirs":["0","2",-1,-1]},{"props":[[0,0],0,-40,0,0,2],"dirs":["1","3",-1,-1]},{"props":[[0,0],0,-60,0,0,3],"dirs":["2","4",-1,-1]},{"props":[[0,0],0,-80,0,0,4],"dirs":["3","5",-1,-1]},{"props":[[0,0],0,-100,0,0,5],"dirs":["4","6",-1,-1]},{"props":[[0,0],0,-120,0,0,6],"dirs":["5",-1,"39","7"]},{"props":[[0,0],20,-120,0,0,7],"dirs":[-1,-1,"6","8"]},{"props":[[0,0],40,-120,0,0,8],"dirs":["9","40","7",-1]},{"props":[[0,0],40,-100,0,0,9],"dirs":["10","8",-1,-1]},{"props":[[0,0],40,-80,0,0,10],"dirs":["11","9",-1,-1]},{"props":[[0,0],40,-60,0,0,11],"dirs":[-1,"10",-1,"12"]},{"props":[[0,0],60,-60,0,0,12],"dirs":[-1,-1,"11","13"]},{"props":[[0,0],80,-60,0,0,13],"dirs":[-1,-1,"12","14"]},{"props":[[0,0],100,-60,0,0,14],"dirs":[-1,"15","13",-1]},{"props":[[0,0],100,-80,0,0,15],"dirs":["14","16",-1,-1]},{"props":[[0,0],100,-100,0,0,16],"dirs":["15","17",-1,-1]},{"props":[[0,0],100,-120,0,0,17],"dirs":["16","18",-1,-1],"rot":{}},{"props":[[0,0],100,-140,0,0,18],"dirs":["17","19",-1,-1],"rot":{}},{"props":[[0,0],100,-160,0,0,19],"dirs":["18","20",-1,-1],"rot":{}},{"props":[[0,0],100,-180,0,0,20],"dirs":["19",-1,"21",-1],"rot":{}},{"props":[[0,0],80,-180,0,0,21],"dirs":[-1,-1,"22","20"]},{"props":[[0,0],60,-180,0,0,22],"dirs":[-1,-1,"23","21"]},{"props":[[0,0],40,-180,0,0,23],"dirs":["41","24","43","22"]},{"props":[[0,0],40,-200,0,0,24],"dirs":["23","25",-1,-1]},{"props":[[0,0],40,-220,0,0,25],"dirs":["24","26",-1,-1]},{"props":[[0,0],40,-240,0,0,26],"dirs":["25",-1,"27",-1]},{"props":[[0,0],20,-240,0,0,27],"dirs":[-1,-1,"28","26"]},{"props":[[0,0],0,-240,0,0,28],"dirs":[-1,-1,"29","27"]},{"props":[[0,0],-20,-240,0,0,29],"dirs":["30",-1,-1,"28"]},{"props":[[0,0],-20,-220,0,0,30],"dirs":["31","29",-1,-1]},{"props":[[0,0],-20,-200,0,0,31],"dirs":["32","30",-1,-1]},{"props":[[0,0],-20,-180,0,0,32],"dirs":["44","31","33","42"]},{"props":[[0,0],-40,-180,0,0,33],"dirs":[-1,-1,"34","32"]},{"props":[[0,0],-60,-180,0,0,34],"dirs":["35",-1,-1,"33"]},{"props":[[0,0],-60,-160,0,0,35],"dirs":["36","34",-1,-1]},{"props":[[0,0],-60,-140,0,0,36],"dirs":["37","35",-1,-1]},{"props":[[0,0],-60,-120,0,0,37],"dirs":[-1,"36",-1,"38"]},{"props":[[0,0],-40,-120,0,0,38],"dirs":[-1,-1,"37","39"]},{"props":[[0,0],-20,-120,0,0,39],"dirs":[-1,"45","38","6"]},{"props":[[0,0],40,-140,0,0,40],"dirs":["8","41",-1,-1]},{"props":[[0,0],40,-160,0,0,41],"dirs":["40","23",-1,-1]},{"props":[[0,0],0,-180,0,0,42],"dirs":[-1,-1,"32","43"]},{"props":[[0,0],20,-180,0,0,43],"dirs":[-1,-1,"42","23"]},{"props":[[0,0],-20,-160,0,0,44],"dirs":["45","32",-1,-1]},{"props":[[0,0],-20,-140,0,0,45],"dirs":["39","44",-1,-1]}]

//Dropdowns

var data1 = [function(){
  let choice = this.props;
  //alert("changing color: " + choice);
  selObjs.forEach(c=>{
    if(selObjs[c]){
      selObjs[c].userData.props[2] = choice;
      updateObj(selObjs[c].name.split("_")[1],selObjs[c].userData);
    }
    socket.emit('edit',0,c.name.split("_")[1],choice);
  });
  //ChangeColor(choice,selObjs);
},usableColors,0];

var data2 = {
  Op1:function(){
    //alert(user);
    //socket.emit('edit',0,0,7);
    //alert("Clicked op 1");
  },
  Op2:function(){
    alert('CLicked op 2');
  },
  Op3:function(){
    alert('cliked 3')//dd.createDD(this,[function(ans){alert(ans)},["nice","cool","good"]]);
  }
};
var dataSettings = {
  "EXE--Animate Player":function(e,read=false){
    if(!read) animMovement = !animMovement;
    let text = "Animate Player: " + animMovement;
    if(!read) this.innerHTML = text;
    return text;
  },
  "EXE--Path Helpers":function(e,read=false){
    if(!read) ed.path_helpers = !ed.path_helpers;
    let text = "Path Helpers: " + ed.path_helpers;
    if(!read) this.innerHTML = text;
    return text;
  }
      //alert("clicked on op 111 : " + this.innerHTML);
}

var openmenus;
var menubar = document.getElementById("menubar");
const dd = {
  init:function(where = "menubar",label,arr){
    if(!label) return;
    var div = document.createElement("div");
    div.innerHTML = label;
    div.props = {data:arr};
    div.onclick = function(){
      OpenMenu(this,this,this.props.data);
    };
    menubar.appendChild(div);
  }
};

dd.init("menubar","Settings",dataSettings);
dd.init("menubar","Sub Items",[function(){
  let props = this.props;
  selObjs.forEach(function(c){
    let id = c.name.split("_")[1];
    let endDat = props != null ? {id:props} : null;
    //console.log("LOGGG",endDat,props);

    //Check
    if(c.userData.props[0][0] != 0) return;


    socket.emit('createSub',id,endDat);
    SpawnSub(id,endDat,scene.getObjectByName("p_" + id));
  });
  //alert("changing color: " + choice);
  //ChangeColor(choice,selObjs);
},subStruct,1,{
  mouseenter:function(){
    //alert(this.props);
    if(!this.props) return;
    //alert(subStruct[this.props[0]][this.props[1]].p);
    reMain.style.visibility = "visible";
    reSpawn(subStruct[this.props[0]][this.props[1]].p);
  },
  mouseleave:function(){
    reMain.style.visibility = "hidden";
  }
}]);
dd.init("menubar","Color",data1);
//dd.init("menubar","Objects",data2);

//Parallel Menu (From test but works nice)

var menu = document.getElementById("menubody");
function OpenMenu(obj,o,arr,too)
{
  menu.innerHTML = "";
  var rect = obj.getBoundingClientRect();
  if(menu.style.visibility == "hidden" || menu.props != obj)
  {
    menu.style.visibility = "visible";
    menu.props = obj;
    menu.style.marginLeft = rect.left + "px";
    menu.style.marginTop = rect.top + 30 + "px";
    //ADV LOADING
    var way = -1;
    if(typeof arr[0] == "function"){
      var data = arr[1];
      way = 0;
    }
    else{
      data = arr;
      way = 1;
    }
    if(way == -1) return;
    var temp = (JSON.stringify(data).startsWith("[") ? data : Object.keys(data));//(way == 0 ? data : Object.keys(data));
    let i = 0;
    menu.id = "menubody";
    if(arr[2] == null){
      temp.forEach(c=>{
        var div = document.createElement("div");
        div.innerHTML = (c.startsWith("EXE--") ? data[c](null,true) : c);
        div.className = "ml";
        if(c.name) div.innerHTML = c.name;
        div.props = i;
        div.onclick = (way == 0 ? arr[0] : data[c]);
        if(arr[3]){ //Custom Events
          if(typeof arr[3] == "object"){
            Object.keys(arr[3]).forEach(function(eName){
              let func = arr[3][eName];
              div.addEventListener(eName,func);
            });
          }
        }
        menu.appendChild(div);
        i++;
      });
    }
    else if(arr[2] == 0){
      switch(arr[2]){
        case 0: //Color Swatches
          menu.innerHTML = "";
          //var sw = swatch.cloneNode(true);
          //var di = document.createElement("div");
          menu.id = "swatch";
          //di.style = "width:300px;height:200px;background-color:red;overflow:hidden";
          //di.appendChild(swatch);
          //menu.appendChild(di);
          let ind = 0;
          swatch.childNodes.forEach(ch=>{
            var child = ch.cloneNode(true);
            menu.appendChild(child);
            child.props = ind;
            child.onclick = arr[0];
            child.onmouseover = function(){
              var t = this.childNodes[0].style;
              t.visibility = "visible";
              //this.props.zIndex = 20;
              this.style.zIndex = 1;
              this.style.width = "25px";
              this.style.height = "25px";
              this.style.boxShadow = "0px 2px 2px rgba(0,0,0,0.5)";
            };
            child.onmouseleave = function(){
              this.childNodes[0].style = "";
              this.style.zIndex = 0;
              this.style.width = "20px";
              this.style.height = "20px";
              this.style.boxShadow = "none";
            };
            ind++;
          });
          //menu.appendChild(di);
        break;
      }
    }
    else if(arr[2] == 1){ //Loading specifically the sub items str
      //alert("laoding.");
      if(data[0][0].name == "Goblin"){ //We know we are Loading Subitems
        let remove = document.createElement("div");
        remove.innerHTML = "Remove";
        remove.props = null;
        remove.onclick = arr[0];
        remove.className = "ml";
        menu.appendChild(remove);
      }
      for(let i = 0; i < Object.keys(data).length; i++){
        for(let ii = 0; ii < Object.keys(data[i]).length; ii++){
          var div = document.createElement("div");
          let dat = data[i][ii];
          div.innerHTML = (dat.name ? dat.name : i);
          div.className = "ml";
          div.props = [i,ii];
          div.onclick = arr[0];
          if(arr[3]){ //Custom Events
            if(typeof arr[3] == "object"){
              Object.keys(arr[3]).forEach(function(eName){
                let func = arr[3][eName];
                div.addEventListener(eName,func);
              });
            }
          }
          menu.appendChild(div);
        }
      }
    }
  }
  else
  {
    menu.style.visibility = "hidden";
    menu.props = null;
    menu.innerHTML = "";
  }
}

function replaceFloor(url="wood3"){
  if(scene.children.indexOf(water) != -1) scene.remove(water);
  var baset = tloader.load("floors/" + url + "/base.png");
  var normt = tloader.load("floors/" + url + "/norm.png");
  var heightt = tloader.load("floors/" + url + "/height.png");
  var rought = tloader.load("floors/" + url + "/rough.png");
  var floorGeo = new THREE.PlaneBufferGeometry();
  var floorMat = new THREE.MeshStandardMaterial({color:0xffffff,map:baset,normalMap:normt,roughnessMap:rought});
  var floor = new THREE.Mesh(floorGeo,floorMat);
  floor.name = "floor";
  floor.rotation.x = -Math.PI/2
  floor.position.y = 1;
  floor.scale.set(5000,5000,1);
  scene.add(floor);
}
/*setTimeout(function(){
  replaceFloor();
},500);*/

//Editor Events
function updateObj(id,datw,ser=false){
  var obj;
  if(typeof id != "object") obj = scene.getObjectByName("p_" + id);
  else{
    obj = id.clone();
    id = obj.name.split("_")[1];
  }
  if(obj == null) return;
  if(datw == null) datw = obj.userData;
  if(datw == null) return;
  if(datw.d){
    Object.keys(datw.d).forEach(function(key){
      datw[key] = datw.d[key];
    });
    delete datw.d;
  }
  obj.userData = datw;
  var data = datw.props;
  //Color
  SetColor(obj,data[2]);
  //Position/rotation

  var offset = [0,0,0];
  var findOffset = function(ob){
    offset[0] += ob.userData.props[1][0];
    offset[1] += ob.userData.props[1][1];
    offset[2] += ob.userData.props[1][2];
    if(ob.parent.name != "") findOffset(ob.parent.parent);
  };
  if(obj.parent.name != "") findOffset(obj.parent.parent);

  obj.position.set((-data[1][0]*8),(data[1][2]*3),(data[1][1]*8));
  obj.rotation.set(-rad(data[1][4]||0),-rad(data[1][3]||0),-rad(data[1][5]||0));
  //-(obj.parent.name!=""?obj.parent.position.x:0)
  //-(obj.parent.name!=""?obj.parent.position.y:0)
  //-(obj.parent.name!=""?obj.parent.position.z:0)
  //YXZ

  /*//Update set menu
  var obl = gp("hobj_" + id);
  if(obl && ser){
    if(obl.childNodes[0]){
      obl.childNodes[0].click();
      obl.childNodes[0].click();
    }
  }*/
  //Update NEW SET MENU
  if(selObjs[0]) if(selObjs[0].name == obj.name) peCont.props.update(obj,id);

  //Update path_helpers
  if(path_helpers.length > 0) if(path_helpers[0].name.split("_")[1] == selObjs[0].name.split("_")[1]){
    path_helpers.forEach(function(c){
      pieces.splice(pieces.indexOf(c),1);
      scene.remove(c);
      path_helpers = [];
    });
    /*path_helpers.forEach(function(c){

      //let dir = path_helpers[0].name.split("_")[2];
      //let dir = 0;
      //c.position.set(obj.position.x + dir == 2 ? 20 : dir == 3 ? -20 : 0,obj.position.y,obj.position.z + dir == 0 ? 20 : dir == 1 ? -20 : 0);
    });*/
  }

  if(obj.children[1].children.length > 0){
    obj.children[1].children.forEach(function(child){
      let idC = child.name.split("_")[1];
      idC = parseInt(idC);
      if(!datw.c){
        console.log("THERE WAS NO DATW.c!!!!!!!",datw);
        scene.add(child);
      }
      else if(!datw.c.includes(idC)){
        console.log("DIDNT FIND IN ARRAY: ",datw.c,idC);
        scene.add(child);
      }
      updateObj(child.name.split("_")[1],child.userData);
    });
  }
  if(datw.c){
    datw.c.forEach(function(idC){
      let child = scene.getObjectByName("p_" + idC);
      if(!child) return;
      obj.children[1].add(child); //child group
      updateObj(idC);
    });
  }
  //parent-child system
  if(obj.parent.name != ""){//if is child
    let pId = obj.parent.parent.name.split("_")[1];
    let hParent = document.getElementById("hobj_" + pId);
    if(!hParent) return;
    let hChild = document.getElementById("hobj_" + id);
    if(!hChild) return;
    if(hChild.parentNode != hParent){
      hParent.appendChild(hChild);
      hChild.style = "margin-left:20px;border-top:dashed 1px gray";
    }
  }
  else{ //reset
    let hChild = document.getElementById("hobj_" + id);
    if(!hChild) return;

    if(obj.parent.name == "" && hChild.parentNode != mapH){
      mapH.appendChild(hChild);
      hChild.style = "";
    }
  }

  //Update Player with obj
  obj.children[0].children.forEach(function(sub){
    if(!sub.name.startsWith("sub_")){
      movePlayerTo(sub.name,id,true);
    }
  });
}
socket.on('updateObj',(id,data)=>{
  updateObj(id,data,true);
}); //update obj


//////////////////////////////////////////////////////////////////////////////////////////

//Init Basic DATA
var draggingSpawnObj = false;

var mapH = document.getElementById("mapHierarchy");
mapH.style.maxHeight = window.innerHeight*0.75 - 50 + "px";
var absoluteUO = [];
function DInit()
{
  firebase.database().ref('objLocs/').once('value',function(snap){
    uo2 = snap;

    //Load DROPDOWN MENU
    let list = [];
    let da = uo2.val();
    Object.keys(da).forEach(function(l){
      Object.keys(da[l]).forEach(function(ll){
        let d = da[l][ll];
        list.push(d);
        absoluteUO.push([l,ll]);
      });
    });

    var dataObjects = [function(){

    },list,null,{
      mouseenter:function(){
        //alert(absoluteUO[this.props]);
        reMain.style.visibility = "visible";
        var mid = absoluteUO[this.props];
        reSpawn([[[mid[0],mid[1]],[0,0,0]]]);
      },
      mouseleave:function(){
        reMain.style.visibility = "hidden";
      },
      mousedown:function(){
        let choice = this.props;
        console.log("Spawning obj... " + this.props);
        let id = absoluteUO[this.props];
        if(typeof id != "object") return;
        if(id[0] == null || id[1] == null) return;
        let pos = selObjs[0] ? JSON.parse(JSON.stringify(selObjs[0].userData.props[1])) : [0,0,0];
        pos[2] += 1;
        let color = selObjs[0]?selObjs[0].userData.props[2]:0;
        socket.emit('createPiece',id,pos,color);
        SpawnPiece({props:[id,pos,color]},GetMaxPieceId()+1,null,null,function(go){
          SelectObj(go,true);
        });
        //Dragging
        draggingSpawnObj = true;
      }
    }];

    dd.init("menubar","Pieces",dataObjects);

    /*var ddd = document.getElementById("objs_dd");
    snap.forEach(c=>{
      c.forEach(c2=>{
        var cd = document.createElement("span");
        var nu = c.key + "." + c2.key;
        cd.id = "obj_" + nu;
        cd.onclick = function(e){
          AddPiece(this.id.split("_")[1],null,true);
        } //'AddPiece("' + nu + '")';
        var st = c2.val();
        st = st.replace("by","x");
        st = st.replace("_"," ");
        cd.innerHTML = st;
        mapH.appendChild(cd);
      });
    });/*
    /*snap.forEach(function(c){
      c.forEach(function(c2){
        console.log("spawning piece: " + c.key + "." + c2.key);
        var cd = document.createElement("span");
        var nu = c.key + "." + c2.key;
        cd.id = "obj_" + nu;
        cd.onclick = function(e){
          AddPiece(this.id.split("_")[1],null,true);
        } //'AddPiece("' + nu + '")';
        var st = c2.val();
        st = st.replace("by","x");
        st = st.replace("_"," ");
        cd.innerHTML = st;
        ddd.appendChild(cd);
      });
    });*/
    Init();
    //socket.emit('getUserData',user);
  });
}

var water,light;

function ImportPiece(path,path2,callback,link,custom=false)
{
  var loader = new THREE.OBJLoader();
  if(!uo2.child(path).exists()) return;
  if(!uo2.child(path).child(path2).exists()) return;
  var tempMat = [new THREE.MeshBasicMaterial({color:0xff0000})];
  if(path == "15" && path2 == "8")
  {
    new THREE.MTLLoader().load("https://claeb008.github.io/objs/15/untitled.mtl", function ( materials ) {
      tempMat = materials;
      loader.setMaterials( tempMat )
    });
  }
  loader.load(
    ("https://claeb008.github.io/objs/" + (!link ? path + "/" + uo2.val()[path][path2] : link) + ".obj"),
    // called when resource is loaded
    function ( object ) {
      var obj = object.children[0];
      if(custom){
        callback(obj);
        return;
      }
      obj.castShadow = true;
      obj.receiveShadow = true;
      var r = 1;//1.25;
      if(link != "14/Hologram" && link != "14/Microfig") obj.scale.set(r,r,r);
      else obj.position.set(0,3,0);
      scene.add(object);
      if(callback) callback(object);
    },
    // called when loading is in progresses
    function ( xhr ) {
      console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    // called when loading has errors
    function ( error ) {
      console.log("ERROR with piece id: ",path,path2,link);
      console.warn('An error happened loading a piece',error);
    }
  );
}

const tloadManager = new THREE.LoadingManager();
const tloader = new THREE.TextureLoader(tloadManager);
var cubeMap = loadCubemap();
var light;
function SetColor(who,id,subid)
{
  var colObj = usableColors[id];
  if(!usableColors[id]) colObj = usableColors[0];
  if(!subid)
  {
    who.material = new THREE.MeshPhongMaterial({side:colObj.op < 1?THREE.DoubleSide:THREE.FrontSide,flatShading:true,envMap: colObj.reflect ? cubeMap : null/*cubeMap*/,color: colObj.color,transparent: (colObj.op < 1),opacity: colObj.op,reflectivity: (colObj.reflect ? 0.75 : 0.55),specular: 0x202020/*0xaaaaaa*/,shininess: 10 * (colObj.reflect ? 100 : 10),wireframe: who.material.wireframe});
  }
  else
  {
    switch(subid)
    {
      case 0:
        who.material.color = colObj.color;
      break;
    }
  }
}

function loadCubemap() {
  var path = "https://threejs.org/examples/textures/cube/SwedishRoyalCastle/";
  var format = '.png';
  var urls = [
    "https://Claeb008.github.io/cubemaps/0/Right.png",
    "https://Claeb008.github.io/cubemaps/0/Left.png",
    "https://Claeb008.github.io/cubemaps/0/Top.png",
    "https://Claeb008.github.io/cubemaps/0/Bottom.png",
    "https://Claeb008.github.io/cubemaps/0/Front.png",
    "https://Claeb008.github.io/cubemaps/0/Back.png"
  ];
  var loader = new THREE.CubeTextureLoader();
  loader.setCrossOrigin ('');
  var cubeMap = loader.load(urls);
  cubeMap.format = THREE.RGBFormat;
  return cubeMap;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  mapH.style.maxHeight = window.innerHeight*0.75-100 + "px";
}

function onDocumentMouseMove( event ) {
  if(renderer.domElement.style.pointerEvents == "none") return;
  event.preventDefault();
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  client.x = event.clientX;
  client.y = event.clientY;
  //ReDir(); //WIP

  //dragging Spawned Piece
  if(draggingSpawnObj){
    selObjs[0].position.x = mouse.x*10;
    selObjs[0].position.y = 5;
  }

  //rearranging hierarchy
  /*if(hSel){
    hSel.style.marginTop = (event.clientY-(Array.prototype.indexOf.call(hSel.parentNode.children,hSel)*28.67)) + "px";
  }*/
}

scene = new THREE.Scene();
//var pscene = new THREE.Group();
//scene.add(pscene);
camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);

raycaster = new THREE.Raycaster();
mouse = new THREE.Vector2(), INTERSECTED, client = new THREE.Vector2();
radius = 100, theta = 0;

renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.soft = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowCameraNear = 3;
renderer.shadowCameraFar = camera.far;
renderer.shadowCameraFov = 50;
renderer.shadowMap.bias = 0.0039;
renderer.shadowMap.darkness = 0.3;
renderer.shadowMapWidth = 2048;
renderer.shadowMapHeight = 2048;
renderer.setClearColor(0xffffff, 1);

//

//light

  light = new THREE.DirectionalLight( 0xffffff, 0.1 );
  scene.add( light );

  // Water
  var waterGeometry = new THREE.PlaneBufferGeometry( 10000, 10000 );
  water = new Water(
    waterGeometry,
    {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load( '/waternormals.jpg', function ( texture ) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      } ),
      alpha: 1.0,
      sunDirection: light.position.clone().normalize(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: scene.fog !== undefined
    }
  );
  water.rotation.x = - Math.PI / 2;
  water.position.y -= 1;
  water.receiveShadow = true;
  scene.add( water );
  // Skybox
  var sky = new Sky();
  var uniforms = sky.material.uniforms;
  uniforms[ 'turbidity' ].value = 10;
  uniforms[ 'rayleigh' ].value = 2;
  uniforms[ 'luminance' ].value = 1;
  uniforms[ 'mieCoefficient' ].value = 0.005;
  uniforms[ 'mieDirectionalG' ].value = 0.8;
  var parameters = {
    distance: 400,
    inclination: 10.00,
    azimuth: 0.205
  };
  var cubeCamera = new THREE.CubeCamera(0.1,1,new THREE.WebGLCubeRenderTarget(512));
  cubeCamera.renderTarget.texture.generateMipmaps = true;
  cubeCamera.renderTarget.texture.minFilter = THREE.LinearMipmapLinearFilter;
  scene.background = cubeCamera.renderTarget;
  function updateSun() {
    var theta = Math.PI * ( parameters.inclination - 0.5 );
    var phi = 2 * Math.PI * ( parameters.azimuth - 0.5 );
    light.position.x = parameters.distance * Math.cos( phi );
    light.position.y = parameters.distance * Math.sin( phi ) * Math.sin( theta );
    light.position.z = parameters.distance * Math.sin( phi ) * Math.cos( theta );
    sky.material.uniforms[ 'sunPosition' ].value = light.position.copy( light.position );
    water.material.uniforms[ 'sunDirection' ].value.copy( light.position ).normalize();
    cubeCamera.update( renderer, sky );
  }
  updateSun();

//

gp("canvas_holder").appendChild(renderer.domElement);
renderer.domElement.onmouseover = function(){
  overMenu = false;
};
renderer.domElement.onclick = function(e){
  console.log("clicked on canvas");
  menu.style.visibility = "hidden";
  menu.props = null;
  menu.innerHTML = "";
  //typing = false;
  //GetPiece("m").blur();
}

var geometry = new THREE.BoxGeometry( 1, 1, 1 );
var material = new THREE.MeshStandardMaterial( { color: 0x00ff00} );
var player = new THREE.Mesh( geometry, material );
player.position.set(3,3,0);
camera.position.set(105,92,-28);

function animate()
{
  requestAnimationFrame( animate );
  render();
  update();
}

function render()
{
  renderer.render( scene, camera );
}

function Actions(id,data){
  switch(id){
    case 0: //Deselect All
      //Undo
      //let undolist = [];

      selObjs.forEach(c=>{
        c.material.wireframe = false;
        hoSel(c,"initial");
        //undolist.push(c.name.split("_")[1]);
      });
      //undo.add(1,{d:undolist});

      selObjs = [];
      path_helpers.forEach(function(c){
        pieces.splice(pieces.indexOf(c),1);
        scene.remove(c);
        path_helpers = [];
      });

      //Clear New Edit Menu
      peCont.props.clear();
    break;
    case 1: //Deselect OBJ
      let obj = data;
      obj.material.wireframe = false;
      selObjs.splice(selObjs.indexOf(obj),1);
      hoSel(obj,"initial");

      let id = obj.name.split("_")[1];
      if(hovers[id]) hovers[id][3] = 0;

      path_helpers.forEach(function(c){
        pieces.splice(pieces.indexOf(c),1);
        scene.remove(c);
        path_helpers = [];
      });

      //Clear New Edit Menu
      peCont.props.clear();
    break;
    case 2: //Pair sel0 to sel1 - pcSys
      if(selObjs.length != 2) return;
      if(selObjs[0].name != selObjs[1].name){  
        var idP = parseInt(selObjs[1].name.split("_")[1]);
        var idC = parseInt(selObjs[0].name.split("_")[1]);

        if(checkIfChildOf(idC,idP)){
          alert("CANT ADD PARENT TO CHILD");
          return;
        }

        var parent = selObjs[1];//scene.getObjectByName("p_" + idP);
        if(!parent){
          alert("failed finding parent");
          return;
        }
        var child = selObjs[0];//scene.getObjectByName("p_" + idC);
        if(!child){
          alert("failed finding child");
          return;
        }

        var realParPos = [0,0,0];
        var tempPos = calcPos(parent);
        realParPos[0] = parseFloat(-tempPos.x/8);
        realParPos[1] = parseFloat(tempPos.z/8);
        realParPos[2] = parseFloat(tempPos.y/4);

        var realChiPos = [0,0,0];
        var tempPosC = calcPos(child);
        realChiPos[0] = parseFloat(-tempPosC.x/8);
        realChiPos[1] = parseFloat(tempPosC.z/8);
        realChiPos[2] = parseFloat(tempPosC.y/4);

        /*if(parent.userData.c){
          if(child.parent.parent){
            if((child.parent.parent.name == parent.name && parent.parent.name == "")){ //Remove child from parent
              var index = parent.userData.c.indexOf(idC);
              parent.userData.c.splice(index,1);
              //child.position.set(child.position.x+parent.position.x,child.position.y+parent.position.y,child.position.z+parent.position.z);
              child.userData.props[1] = [child.userData.props[1][0]+parent.userData.props[1][0],child.userData.props[1][1]+parent.userData.props[1][1],child.userData.props[1][2]+parent.userData.props[1][2]];
              scene.add(child);
              //child.scale.set(1.25,1.25,1.25);
              updateObj(idC,child.userData);
              socket.emit('edit',2,idP,['pcSys',idC,false]);
              return;
            }
          }
          else if(parent.parent.parent){
            if((parent.parent.parent.name == child.name && child.parent.name == "")){ //Remove child from parent
              var childName = child.name;
              child = scene.getObjectByName(parent.name);
              parent = scene.getObjectByName(childName);
              var index = parent.userData.c.indexOf(idC);
              parent.userData.c.splice(index,1);
              //child.position.set(child.position.x+parent.position.x,child.position.y+parent.position.y,child.position.z+parent.position.z);
              child.userData.props[1] = [child.userData.props[1][0]+parent.userData.props[1][0],child.userData.props[1][1]+parent.userData.props[1][1],child.userData.props[1][2]+parent.userData.props[1][2]];
              scene.add(child);
              //child.scale.set(1.25,1.25,1.25);
              updateObj(idC,child.userData);
              socket.emit('edit',2,idP,['pcSys',idC,false]);
              return;
            }
          }
          else if(parent.userData.c.includes(idC)){
            var index = parent.userData.c.indexOf(idC);
            parent.userData.c.splice(index,1);
            //child.position.set(child.position.x+parent.position.x,child.position.y+parent.position.y,child.position.z+parent.position.z);
            child.userData.props[1] = [child.userData.props[1][0]+parent.userData.props[1][0],child.userData.props[1][1]+parent.userData.props[1][1],child.userData.props[1][2]+parent.userData.props[1][2]];
            scene.add(child);
            //child.scale.set(1.25,1.25,1.25);
            updateObj(idC,child.userData);
            socket.emit('edit',2,idP,['pcSys',idC,false]);
            return;
          }
          else if(child.userData.c.includes(idC) && false){
            var childName = child.name;
            child = scene.getObjectByName(parent.name);
            parent = scene.getObjectByName(childName);
            var index = parent.userData.c.indexOf(idC);
            parent.userData.c.splice(index,1);
            //child.position.set(child.position.x+parent.position.x,child.position.y+parent.position.y,child.position.z+parent.position.z);
            child.userData.props[1] = [child.userData.props[1][0]+parent.userData.props[1][0],child.userData.props[1][1]+parent.userData.props[1][1],child.userData.props[1][2]+parent.userData.props[1][2]];
            scene.add(child);
            //child.scale.set(1.25,1.25,1.25);
            updateObj(idC,child.userData);
            socket.emit('edit',2,idP,['pcSys',idC,false]);
            return;
          }
        }*/

        var realParent = child.parent.parent;
        if(realParent){
          if(realParent.name != parent.name){
            if(realParent.userData.c){
              var index = realParent.userData.c.indexOf(idC);
              realParent.userData.c.splice(index,1);
              updateObj(idC,child.userData);
              socket.emit('edit',2,realParent.name.split("_")[1],['pcSys',idC,false]);
            }
          }
        }

        if(parent.userData.c){
          if(parent.userData.c.includes(idC)){ //Remove child from parent
            var index = parent.userData.c.indexOf(idC);
            parent.userData.c.splice(index,1);
            //child.position.set(child.position.x+parent.position.x,child.position.y+parent.position.y,child.position.z+parent.position.z);
            child.userData.props[1] = [child.userData.props[1][0]+realParPos[0],child.userData.props[1][1]+realParPos[1],child.userData.props[1][2]+realParPos[2]];
            scene.add(child);
            //child.scale.set(1.25,1.25,1.25);
            updateObj(idC,child.userData);
            socket.emit('edit',2,idP,['pcSys',idC,false,child.userData.props[1]]);
            return;
          }
        }

        if(parent.userData.c == null) parent.userData.c = [];
        parent.userData.c.push(parseInt(idC));

        //child.position.set(child.position.x-parent.position.x,child.position.y-parent.position.y,child.position.z-parent.position.z);
        child.userData.props[1] = [realChiPos[0]-realParPos[0],realChiPos[1]-realParPos[1],realChiPos[2]-realParPos[2]];
        parent.children[1].add(child); //child group
        //child.scale.set(1,1,1);

        updateObj(idC,child.userData);
        socket.emit('edit',2,idP,['pcSys',idC,true,child.userData.props[1]]);
      }
    break;
  }
}
var overMenu = false;
var mousestore;
var ub = []; //UNDO BUFFER (WIP)
var uind = -1;
const undo = {
  add:function(id,data){
    if(uind != ub.length - 1) ub.length = uind+1;
    ub.push([id,data]);
    uind++;
  },
  undo:function(){
    /*
      SpawnPiece({props:[[0,0],[200,200,60],6]},GetMaxPieceId()+1,null,null,function(go){
        SelectObj(go,true);
      });
    */
    if(uind > -1){
      let da = ub[uind];
      switch(da[0]){
        case 0: //Deleted OBJ
          let loc = da[1].p[1];
          let fail = false;
          pieces.forEach(function(c){
            if(fail) return;
            if(!c.userData) return;
            if(!c.userData.props) return;
            let ll = c.userData.props[1];
            if(ll[0] == loc[0] && ll[1] == loc[1] && ll[2] == loc[2]){
              fail = true;
              return;
            }
          });
          if(fail) return;
          socket.emit('createPiece',da[1].p[0],da[1].p[1],da[1].p[2]);
          let index = uind;
          SpawnPiece({props:da[1].p},GetMaxPieceId()+1,null,null,function(go){
            SelectObj(go,true);
            ub[index][2] = go;
          });
        break;
        case 1: //Actions 0 Deselect
          let list = da[1].d;
          if(!list) return;
          list.forEach(function(c){
            let obj = scene.getObjectByName("p_" + c);
            if(obj) SelectObj(obj,false);
          });
        break;
      }
      uind--;
    }
    else uind = -1;
  },
  redo:function(){
    if(ub[uind+1]){
      let da = ub[uind+1];
      switch(da[0]){
        case 0: //Deleted OBJ
          if(!da[2]) return;
          if(!da[2].name) return;
          let id = da[2].name.split("_")[1];
          socket.emit('removePiece',id);
          removePiece(id);
        break;
        case 1:
          let list = da[1].d;
          if(!list) return;
          list.forEach(function(c){
            let obj = scene.getObjectByName("p_" + c);
            if(obj) Actions(1,obj);
          });
        break;
      }
      uind++;
    }
  }
};
//ubRefs:
// 0 - Recover OBJ Deletion - data: {o:OBJECTID (PREVIOUS WILL BE NEW ID),p:PROPS}
var ubRef = [
  [] //Event 0 (Deselect All) :
];
var path_helperObj;
var path_helpers = [];
var intObjs = [];
function addv(v1,v2){
  var end = new THREE.Vector3();
  end.x = v1.x + v2.x;
  end.y = v1.y + v2.y;
  end.z = v1.z + v2.z;
  return end;
}

var pe = document.getElementById("pieceEdit");
var peCont = pe.childNodes[1];
peCont.props = {
  clear:function(){
    peCont.innerHTML = "";
  },
  update:function(obj,id){
    if(!obj) return;
    if(id == null) id = obj.name.split("_")[1];

    let dat = obj.userData.props;

    //Update, not reload
    if(peCont.innerHTML != ""){
      let dd = peCont.childNodes[0];
      let posl = dd.childNodes[0];
      let x = posl.childNodes[1];
      x.props = id;//{xyz:0,id:id};
      x.value = dat[1][0];
      let y = posl.childNodes[2];
      y.props = id;//{xyz:1,id:id};;
      y.value = dat[1][1];
      let z = posl.childNodes[3];
      z.props = id;//{xyz:2,id:id};;
      z.value = dat[1][2];

      let rotl = dd.childNodes[1];
      let rx = rotl.childNodes[1];
      rx.props = id;
      rx.value = parseFloat(dat[1].length > 3 ? dat[1][3] : 0);
      let ry = rotl.childNodes[2];
      ry.props = id;
      ry.value = parseFloat(dat[1].length > 4 ? dat[1][4] : 0);
      let rz = rotl.childNodes[3];
      rz.props = id;
      rz.value = parseFloat(dat[1].length > 5 ? dat[1][5] : 0);

      //let remove = dd.childNodes[2];
      //remove.props = id;

      return;
    }

    peCont.innerHTML = "";
    //load
    var dd = document.createElement("div");
    dd.style.marginLeft = "10px";
    //Pos
    var posl = document.createElement("span");
    posl.innerHTML = "pos: ";
    for(let xyi = 0; xyi < 3; xyi++){
      var inp = document.createElement("input");
      inp.type = "number";
      inp.value = dat[1][xyi];
      inp.props = id;
      //inp.altprops = {xyz:xyz};
      inp.style.width = "40px";
      inp.addEventListener('input',function(e){
        var val = parseFloat(this.value);
        if(val == null) return;
        if(typeof val != "number") return;
        //local
        var sobj = scene.getObjectByName("p_" + this.props);
        if(sobj){
          sobj.userData.props[1][xyi] = val;//sobj.position[xyi == 0 ? "x" : xyi == 1 ? "y" : "z"] = val * (xyi == 1 ? 4 : 10 * (xyi == 0 ? -1 : 1));
          updateObj(this.props,sobj.userData);
        }
        //server
        socket.emit('edit',1,this.props,[xyi,val]);
      });
      posl.appendChild(inp);
    }
    dd.appendChild(posl);
    //Rot
    var rotl = document.createElement("span");
    rotl.innerHTML = "\nrot: ";
    for(let xyi = 3; xyi < 6; xyi++){
      var inp = document.createElement("input");
      inp.type = "number";
      inp.value = dat[1][xyi];
      inp.props = id;//{xyz:xyz+3,id:id};
      inp.style.width = "40px";
      inp.addEventListener('input',function(e){
        var val = parseFloat(this.value);
        if(val == null) return;
        if(typeof val != "number") return;
        //local
        var sobj = scene.getObjectByName("p_" + this.props);
        if(sobj){
          sobj.userData.props[1][xyi] = val;//sobj.position[xyi == 0 ? "x" : xyi == 1 ? "y" : "z"] = val * (xyi == 1 ? 4 : 10 * (xyi == 0 ? -1 : 1));
          updateObj(this.props,sobj.userData);
        }
        //server
        socket.emit('edit',1,this.props,[xyi,val]);
      });
      rotl.appendChild(inp);
    }
    dd.appendChild(rotl);
    //Remove
    var reml = document.createElement("button");
    reml.props = id;
    reml.innerHTML = "Remove";
    reml.className = "redB";
    reml.onclick = function(){
      LoadSubInputMenu(3);
    };
    reml.style.transform = "scale(0.8)";
    dd.appendChild(reml);
    //Select
    /*var selb = document.createElement("button");
    selb.innerHTML = "Select";
    selb.onclick = function(){
      //alert(this.parentNode.childNodes[1].props);
      let obj = scene.getObjectByName("p_" + this.parentNode.childNodes[2].props);
      if(!selObjs.includes(obj)) SelectObj(obj,true,false);
      else{
        Actions(1,obj);
      }
    };
    selb.style = "float:right;float:bottom;";
    selb.style.transform = "scale(0.8)";
    dd.appendChild(selb);*/
    //Advanced Settings
    var advb = document.createElement("button");
    advb.innerHTML = "Adv";
    advb.onclick = function(){
      LoadSubInputMenu(2,{id:this.parentNode.childNodes[2].props});
    };
    advb.style = "float:right;float:bottom;";
    advb.style.transform = "scale(0.8)";
    dd.appendChild(advb);

    //
    peCont.appendChild(dd);
  }
};
function SelectObj(Obj,one=true,scroll=true){
  if(one) Actions(0);

  //alert(Object.keys(Obj.userData));

  path_helpers.forEach(function(c){
    pieces.splice(pieces.indexOf(c),1);
    scene.remove(c);
    path_helpers = [];
  });

  if(one) selObjs[0] = Obj;
  else selObjs.push(Obj);
  //var pos = selObjs.length-1;
  Obj.material.wireframe = true;
  let id = Obj.name.split("_")[1];
  let ho = document.getElementById("hobj_" + id);
  if(ho) ho.style.backgroundColor = "lightgreen";

  //NEW PIECE EDIT MENU
  //alert();
  /*let posl = document.createElement("div");
  posl.innerHTML = "Position:<br>";
  let poslx = document.createElement("input");
  poslx.value = Obj.userData.props[1][0];
  posl.appendChild(poslx);*/

  //peCont.appendChild(posl);
  //alert(peCont.innerHTML);

  peCont.props.update(Obj,id);

  ///////////////////////////////

  let label = document.getElementById("hobj_" + Obj.name.split("_")[1]);
  if(label && scroll){
    if(one){

    }
    label.scrollIntoView();
    //if(label.childNodes.length <= 1) label.childNodes[0].click();
  }

  //Path Helpers
  if(ed.path_helpers && selObjs.length == 1){
    var base = Obj;
    var basePos = calcPos(Obj);
    if(base.userData.props[0][0] == 0){
      var r = [true,true,true,true];//restricted
      pieces.forEach(function(c){
        if(c.userData.props[0][0] != 0) return;
        //console.log(c.position,base.position,base.position.add(new THREE.Vector3(0,0,20)));
        if(c.position.equals(addv(basePos,new THREE.Vector3(0,0,16)))) r[0] = false;//alert("BLOCKED AT FRONT");
        if(c.position.equals(addv(basePos,new THREE.Vector3(0,0,-16)))) r[1] = false;//alert("BLOCKED AT BACK");
        if(c.position.equals(addv(basePos,new THREE.Vector3(-16,0,0)))) r[2] = false;//alert("BLOCKED AT RIGHT");
        if(c.position.equals(addv(basePos,new THREE.Vector3(16,0,0)))) r[3] = false;//alert("BLOCKED AT LEFT");
      });
      var bid = base.name.split("_")[1];
      if(r[0]){
        let front = path_helperObj.clone();
        let pos = addv(basePos,new THREE.Vector3(0,0,16));
        front.position.set(pos.x,pos.y,pos.z);
        scene.add(front);
        path_helpers.push(front);
        front.name = "pathhelper_" + bid + "_0";
        pieces.push(front);
      }
      if(r[1]){
        let front = path_helperObj.clone();
        let pos = addv(basePos,new THREE.Vector3(0,0,-16));
        front.position.set(pos.x,pos.y,pos.z);
        scene.add(front);
        path_helpers.push(front);
        front.name = "pathhelper_" + bid + "_1";
        pieces.push(front);
      }
      if(r[2]){
        let front = path_helperObj.clone();
        let pos = addv(basePos,new THREE.Vector3(-16,0,0));
        front.position.set(pos.x,pos.y,pos.z);
        scene.add(front);
        path_helpers.push(front);
        front.name = "pathhelper_" + bid + "_2";
        pieces.push(front);
      }
      if(r[3]){
        let front = path_helperObj.clone();
        let pos = addv(basePos,new THREE.Vector3(16,0,0));
        front.position.set(pos.x,pos.y,pos.z);
        scene.add(front);
        path_helpers.push(front);
        front.name = "pathhelper_" + bid + "_3";
        pieces.push(front);
      }
    }
  }
}

function hoSel(Obj,col,click=true){
  let ho = document.getElementById("hobj_" + Obj.name.split("_")[1]);
  if(ho){
    ho.style.backgroundColor = col;
    if(click){
      //if(col != "initial") if(!ho.childNodes[0]) ho.click();
      if(col == "initial"){
        if(ho.childNodes[1]?ho.childNodes[1].childNodes.length>0:false) ho.childNodes[0].click();
      }
    }
  }
}

renderer.domElement.addEventListener('mouseup',event=>{
  var button = event.button;
  /*if(button == 0){
    //Hierarchy Stuff
      if(hSel){
      //reorder stuff
      hSel.style.position = "initial";
      hSel.style.marginLeft = 0;
      hSel.style.marginTop = 0;
      hSel = null;
    }
  }*/

  if(overMenu || inputmenu.innerHTML != "") return;
  if(!INTERSECTED && mousestore.x == mouse.x && mousestore.y == mouse.y){
    Actions(0);
    return;
  }
  if(mousestore.x != mouse.x || mousestore.y != mouse.y) return;
  mousestore = null;
    if(button == 0)
    {
      draggingSpawnObj = false;

      if(!INTERSECTED) return;
      //var name = INTERSECTED.name.split("_")[1];
      var Obj = INTERSECTED;

      if(Obj.name.startsWith("pathhelper_")){
        //alert("clicked on pathhelper.." + Obj.name.split("_")[1]);
        let dir = Obj.name.split("_")[2];
        //Obj.name.split("_")[1]
        createPiece(scene.getObjectByName("p_" + selObjs[0].name.split("_")[1]),[dir == 2 ? 2 : dir == 3 ? -2 : 0,dir == 0 ? 2 : dir == 1 ? -2 : 0,0],[0,0],true)
        return;
      }
      //if(!name) return;
      if(intersects.length == 0 || Obj != selObjs[0] || isShift)  //if(selObjs[0] && !overMenu && (INTERSECTED || isShift)) // ||  // && (INTERSECTED != selObjs[0])
      {
        //EditMaterial(selObj, [{id: 0, way: false}], 0xff0000);
        //if(!INTERSECTED) return;
        if(isShift && Obj)
        {
          path_helpers.forEach(function(c){
            pieces.splice(pieces.indexOf(c),1);
            scene.remove(c);
            path_helpers = [];
          });
          var a = selObjs.indexOf(Obj);
          if(a == -1)
          {
            Obj.material.wireframe = true;
            selObjs.push(Obj);
            hoSel(Obj,"lightgreen");
            return;
          }
          else
          {
            Obj.material.wireframe = false;
            selObjs.splice(a,1);
            hoSel(Obj,"initial");
            return;
          }
        }
        else// if(isShift || (!isShift && INTERSECTED))
        //if(isShift)
        {
          if(!Obj) return;
          //if(INTERSECTED) alert("desel");
          selObjs.forEach(function(c){
            c.material.wireframe = false;
            hoSel(c,"initial");
          });
            selObjs = [];
            Actions(0);
            if(intersects.length > 0)
            {
              //Update interact label
              if(Obj.userData.props.int)
              {
                var ar = [
                  [ // use whenever, shops
                    "Weapon Shop",
                    "Potion Shop",
                    "Armor Shop",
                  ],
                  [ // roll outcomes
                    "Chest",
                    "Rocks",
                    "Coffin"
                  ],
                  [ // required items
                    "Door"
                  ]
                ];
                var idd = Obj.userData.props.int[0];
                //gp("int_l").innerHTML = ar[idd[0]][idd[1]];
              }
              //Path Helpers (Optional)
              SelectObj(Obj,false);
              //else gp("int_l").innerHTML = "No Interact";
            //EditMaterial(selObj, [{id: 0, way: true}], 0x0000ff);
            }
        }


      }
      else if(!overMenu)
      {
        selObjs[0] = Obj;
        if(selObjs[0]){
          selObjs[0].material.wireframe = true;//EditMaterial(selObj, [{id: 0, way: true}], 0x0000ff);
          hoSel(selObjs[0],"lightgreen");
        }
        //Update interact label
        if(Obj.userData.props.int)
        {
          var ar = [
            [ // use whenever, shops
              "Weapon Shop",
              "Potion Shop",
              "Armor Shop",
            ],
            [ // roll outcomes
              "Chest",
              "Rocks",
              "Coffin"
            ],
            [ // required items
              "Door"
            ]
          ];
          var idd = Obj.userData.props.int[0];
          //gp("int_l").innerHTML = ar[idd[0]][idd[1]];
        }
        //else gp("int_l").innerHTML = "No Interact";
      }
      else{
        INTERSECTED.material.wireframe = true;
        hoSel(INTERSECTED,"lightgreen");
      }
    }
});
function checkIfChildOf(p,c){
  if(typeof p == "number") p = scene.getObjectByName("p_" + p);
  if(typeof c == "number") c = scene.getObjectByName("p_" + c);
  var output = false;
  var i = 0;
  var loop = function(cur){
    if((cur ? !cur.userData.c : false) && !output && i == 0){
      output = false;
      return;
    }
    if(!cur.userData.c) return;
    if(cur.userData.c.includes(parseInt(c.name.split("_")[1]))){
      output = true;
      return;
    }
    else{
      if(output) return;
      i++;
      cur.userData.c.forEach(sub=>{
        if(!output) loop(scene.getObjectByName("p_" + sub));
      });
    }
  };
  loop(p)
  return output;
}
document.addEventListener('mousedown',(event)=>{
  console.log("CLICK!");
  var button = event.button;
  if(button == 2){ //Right mouse button
    /*if(hHover && !hSel){
      hSel = hHover;
      hHover = null;
      mapH.className = "sel";
      //hSel.preIndex = Array.prototype.indexOf.call(parent.children, child);
      //hSel.style.position = "absolute"; 
      //document.body.appendChild(hSel);
    }*/
    if(hHover && !hSel){
      hSel = hHover;
      hSel.style.backgroundColor = "rgba(255,120,120,0.5)";
      mapH.className = "sel";
    }
    else if(hHover){
      hSel.style.backgroundColor = "";
      hSel = null;
      mapH.className = "";
    }
  }
  if(button == 0){ //Left mouse button
    if(hSel && hHover) if(hSel.parentNode.id != hHover.parentNode.id){  
      var idP = parseInt(hHover.parentNode.id.split("_")[1]);
      var idC = parseInt(hSel.parentNode.id.split("_")[1]);

      if(checkIfChildOf(idC,idP)){
        alert("CANT ADD PARENT TO CHILD");
        return;
      }

      var parent = scene.getObjectByName("p_" + idP);
      if(!parent){
        alert("failed finding parent");
        return;
      }
      var child = scene.getObjectByName("p_" + idC);
      if(!child){
        alert("failed finding child");
        return;
      }

      var realParPos = [0,0,0];
      var tempPos = calcPos(parent);
      realParPos[0] = parseFloat(-tempPos.x/8);
      realParPos[1] = parseFloat(tempPos.z/8);
      realParPos[2] = parseFloat(tempPos.y/4);

      var realChiPos = [0,0,0];
      var tempPosC = calcPos(child);
      realChiPos[0] = parseFloat(-tempPosC.x/8);
      realChiPos[1] = parseFloat(tempPosC.z/8);
      realChiPos[2] = parseFloat(tempPosC.y/4);

      var realParent = child.parent.parent;
      if(realParent){
        if(realParent.name != parent.name){
          if(realParent.userData.c){
            var index = realParent.userData.c.indexOf(idC);
            realParent.userData.c.splice(index,1);
            updateObj(idC,child.userData);
            socket.emit('edit',2,realParent.name.split("_")[1],['pcSys',idC,false]);
          }
        }
      }

      if(parent.userData.c){
        if(parent.userData.c.includes(idC)){ //Remove child from parent
          var index = parent.userData.c.indexOf(idC);
          parent.userData.c.splice(index,1);
          
          //child.position.set(child.position.x+parent.position.x,child.position.y+parent.position.y,child.position.z+parent.position.z);
          child.userData.props[1] = [child.userData.props[1][0]+realParPos[0],child.userData.props[1][1]+realParPos[1],child.userData.props[1][2]+realParPos[2]];
          scene.add(child);
          //child.scale.set(1.25,1.25,1.25);
          updateObj(idC,child.userData);
          socket.emit('edit',2,idP,['pcSys',idC,false,child.userData.props[1]]);

          //reset
          hSel.style.backgroundColor = "";
          hSel = null;
          mapH.className = "";
          return;
        }
      }

      if(parent.userData.c == null) parent.userData.c = [];
      parent.userData.c.push(parseInt(idC));

      //child.position.set(child.position.x-parent.position.x,child.position.y-parent.position.y,child.position.z-parent.position.z);
      child.userData.props[1] = [realChiPos[0]-realParPos[0],realChiPos[1]-realParPos[1],realChiPos[2]-realParPos[2]];
      parent.children[1].add(child); //child group
      //child.scale.set(1,1,1);

      updateObj(idC,child.userData);
      socket.emit('edit',2,idP,['pcSys',idC,true,child.userData.props[1]]);

      //reset
      hSel.style.backgroundColor = "";
      hSel = null;
      mapH.className = "";
    }
  }

  mousestore = mouse.clone();
});


//

/*function dtr(deg){
  return Math.PI/180*90;
}

//Setup Moving CrossHair Things
var ch = new THREE.Group();
scene.add(ch);
var scale = 0.5;
var ch_x_geo = new THREE.CylinderGeometry( scale, scale, 30, 16 );
var ch_x_mat = new THREE.MeshBasicMaterial( {color: 0xff0000} );
var ch_x = new THREE.Mesh( ch_x_geo, ch_x_mat );
ch_x.rotation.z = dtr(90);
ch.add(ch_x);
var ch_y_geo = new THREE.CylinderGeometry( scale, scale, 30, 16 );
var ch_y_mat = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
var ch_y = new THREE.Mesh( ch_y_geo, ch_y_mat );
ch_y.rotation.x = dtr(90);
ch.add(ch_y);
var ch_z_geo = new THREE.CylinderGeometry( scale, scale, 30, 16 );
var ch_z_mat = new THREE.MeshBasicMaterial( {color: 0x0000ff} );
var ch_z = new THREE.Mesh( ch_z_geo, ch_z_mat );
ch.add(ch_z);

//*/

var editMode = 0;
var INTERSECTED;
var pieces = [];
var players = [];
var empty = new THREE.Group();
var pInt;
var label;
label = document.createElement("span");
label.className = "label";
document.body.appendChild(label);
var anim = {};
var hovers = {}; //[obj,col,inc,times,i,hobj,itimes]
var playerObj;
function update()
{
  //calculate camDir
  var camAngle = camera.rotation.z*(180/Math.PI);
  if((camAngle <= 180 && camAngle >= 135) || (camAngle <= -135 && camAngle >= -180)) camDir = 0;
  else if(camAngle < -45 && camAngle > -135) camDir = 3;
  else if((camAngle <= 0 && camAngle >= -45) || (camAngle <= 45 && camAngle >= 0)) camDir = 1;
  else if(camAngle < 135 && camAngle > 45) camDir = 2;
  if(playerObj){
    playerObj.rotation.y = (camDir == 1 ? Math.PI : camDir == 2 ? -Math.PI/2 : camDir == 3 ? Math.PI/2 : 0);//(camDir*Math.PI/2);
  }
  else playerObj = scene.getObjectByName(user.uid);

  if(directionalLight) //lights for shadows follows camera
  {
    directionalLight.target.position.x = camera.position.x+3;
    directionalLight.target.position.y = camera.position.y+3;
    directionalLight.target.position.z = camera.position.z;
    directionalLight.position.set( camera.position.x + 15,camera.position.y + 20, camera.position.z - 20 );
  }

  //hovers
  if(hovers) Object.keys(hovers).forEach(function(cc){
    let c = hovers[cc];
    if(!c[0]) c[0] = scene.getObjectByName("p_" + cc);
    if(!c[0]) return;
    let col = c[1];

    if(!c[5]){
      c[5] = new THREE.Mesh(c[0].geometry,new THREE.MeshStandardMaterial({color:col,transparent:true}));
      c[5].scale.set(1.05,1.05,1.05);
      c[5].name = "hover_" + cc;
      scene.add(c[5]);
    }

    var realPos = calcPos(c[0]);
    c[5].position.set(realPos.x,realPos.y,realPos.z);//.set(c[0].position.x,c[0].position.y,c[0].position.z);
    //c[5].rotation.set(c[0].rotation.x,c[0].rotation.y,c[0].rotation.z);
    var realRot = new THREE.Quaternion();
    c[0].getWorldQuaternion(realRot);
    c[5].rotation.set(realRot.x,realRot.y,realRot.z);

    c[5].material.opacity = c[4]/100;
    c[4] += c[2];
    if(c[4] >= 80 || c[4] <= 0){
      c[2] = -c[2];
      if(c[3] != -1){
        if(!c[6]) c[6] = 0;
        c[6]++;
        if(c[6] >= c[3]){
          scene.remove(c[5]);
          delete hovers[cc];
        }
      }
    }
  });

  var time = performance.now() * 0.001;
  water.material.uniforms['time'].value += 1.0 / 60.0;

  var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
  vector.unproject(camera);
  var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
  // create an array containing all objects in the scene with which the ray intersects
  intersects = ray.intersectObjects(pieces); //inputmenu.style.visibility == "hidden" ? pscene.children : empty
  //editMode != 0 ? editPieces[editMode] : pieces
  // if there is one (or more) intersections
  if (intersects.length > 0) {
    // if the closest object intersected is not the currently stored intersection object
    if (intersects[0].object != INTERSECTED) {
      INTERSECTED = intersects[0].object;
    }
  } else // there are no intersections
  {
    INTERSECTED = null;
  }

  var pInts = ray.intersectObjects(players); //intersecting players
  if(pInts.length > 0){
    //if(pInts[0].object != pInt)
    {
      pInt = pInts[0].object;
      label.style.visibility = "visible";
      label.innerHTML = pInt.userData.n.n + (pInt.name == user.uid ? " (You)" : "");
      label.style.marginLeft = client.x + "px";
      label.style.marginTop = client.y - 60 + "px";
      /*setTimeout(function(ob){
        if(pInt == ob){
          label.style.visibility = "visible";
          label.innerHTML = pInt.userData.n.n + (pInt.name == user.uid ? " (You)" : "");
          label.style.marginLeft = client.x + "px";
          label.style.marginTop = client.y + "px";
          //alert(pInt.userData.n.n + (pInt.name == user.uid ? " (You)" : ""));
        }
        else return;
      },200,pInt);*/
    }
  }
  else{
    pInt = null;
    label.style.visibility = "hidden";
  }

  //animation
  /*if(!anim) anim = {};
  Object.keys(anim).forEach(function(c){
    let data = anim[c];
    switch(data.id){
      case 0:
        var p = data.d.p;
        var f = data.d.f;
        var t = data.d.t;

        if(data.i == 0){
          if(p.name == user.uid) canMove = false;
          p.parent.remove(p);
          t.add(p);
          if(p.rotation.z != 0 || p.rotation.x != 0){
            p.rotation.z = 0;
            p.rotation.x = 0;
          }
        }

        let r = Math.abs(t.position.z-f.position.z)/2;
        if(r == 0) r = Math.abs(t.position.x-f.position.x)/2;
        let aa = 0;
        //let hs = 0.75;
        let ans = 1; //angle scale
        let sf = 2; //speed factor
        var iamt2 = p.parent.children.indexOf(p)+1;
        var iamt = p.parent.children.indexOf(p)+1;

        if(data.i > 0){
          data.i += sf;
          if(data.i<180 && (data.i>90 ? p.position.y > 16*((iamt-1)) : true)) move();
          else{ //done
            p.position.set(0,3,0);
            p.rotation.x = 0;
            p.rotation.z = 0;
            //var i = p.parent.children.indexOf(p);
            p.position.y = 16*(iamt-1)+3;
            if(p.name == user.uid) canMove = true;
            delete anim[c];
          }
        }

        const move = function(){
          let a = data.i*(Math.PI/180);
          let y = Math.sin(a)*r;
          let x = Math.cos(a)*r;

          //look-rotation
          //if(t.position.x - f.position.x > 0) p.rotation.y = rad(90);
          //else if(t.position.x - f.position.x < 0) p.rotation.y = rad(-90);
          //if(t.position.z - f.position.z > 0) p.rotation.y = rad(0);
          //else if(t.position.z - f.position.z < 0) p.rotation.y = rad(180);

          aa += (data.i < 45 ? -ans : data.i < 90 ? ans : data.i < 135 ? ans : data.i <= 180 ? -ans : 0);
          //Plot(x,y*hs,aa); //(i < 45 ? -i*2 : i < 90 ? i*2 : i*2)
          //
          let za = (t.position.z < f.position.z ? 1 : -1);
          let xa = (t.position.x < f.position.x ? 1 : -1);

          if(t.position.z - f.position.z == 0){
            p.position.x = xa*x + xa*(r/2+5);
          }
          else{
            p.position.z = za*x + za*(r/2+5);// + f.position.z;
          }
          if(data.i < 90 ? p.position.y < y*(iamt > iamt2 ? iamt : iamt2)*2 + f.position.y + 3 : true) p.position.y = y*(iamt > iamt2 ? iamt : iamt2)*2 + f.position.y + 3;
          p.rotation[t.position.z - f.position.z == 0 ? "z" : "x"] = (t.position.z - f.position.z > 0 || t.position.x - f.position.x < 0 ? -1 : 1)*aa*(Math.PI/180);
          //
        };
        move();
      break;
    }
  });*/
}

var directionalLight;
var light2;
var dl2;
var targ = new THREE.Object3D();
targ.position.set(3,3,0);
scene.add(targ);
function SetUpLights()
{
  light2 = new THREE.AmbientLight( 0xffffff, 0.7 ); //0.7
  scene.add( light2 );

  directionalLight = new THREE.DirectionalLight( 0xffffff, 0.65);
  directionalLight.castShadow = true;
  directionalLight.target = targ;
  directionalLight.shadow.camera.left = -450.5; //default is 450.5
  directionalLight.shadow.camera.right = 450.5;
  directionalLight.shadow.camera.top = 450.5;
  directionalLight.shadow.camera.bottom = -450.5;
  directionalLight.shadow.mapSize.width = 4096;
  directionalLight.shadow.mapSize.height = 4096;
  directionalLight.shadow.camera.far = 2000;
  directionalLight.shadow.camera.near = -1000;

  scene.add(directionalLight);
  directionalLight.position.set( player.position.x - 1,player.position.y + 2, player.position.z - 2 );

  dl2 = new THREE.DirectionalLight(0xffffff, 0.4);
  dl2.target = player;
  dl2.position.set(4,-1,-0.5);
  scene.add(dl2);
}
SetUpLights();

document.addEventListener( 'mousemove', onDocumentMouseMove, false );
window.addEventListener( 'resize', onWindowResize, false );

var controls = new THREE.OrbitControls( camera, renderer.domElement );

THREE.Object3D.prototype.rotateAroundWorldAxis = function(axis, radians)
{
  rotWorldMatrix = new THREE.Matrix4();
  rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
  rotWorldMatrix.multiply(this.matrix);
  this.matrix = rotWorldMatrix;
  this.rotation.setFromRotationMatrix(this.matrix);
}

//Calculate Global/Absolute Position of object even when child //doesn't work with rotation
function calcPos_old(obj,pos){
  var func = function(obj){
    if(pos == null) pos = obj.position.clone();
    else{
      pos.add(obj.position.clone());
    }
    if(obj.parent.name != ""){
      func(obj.parent);
    }
  };
  func(obj);
  return pos;
};
function calcPos(obj){
  var pos = new THREE.Vector3();
  obj.getWorldPosition(pos);
  return pos;
}

function movePlayer(who,dir){
  var me = scene.getObjectByName(who);
  if(!me) return;
  //var loc = me.parent.position;
  //if(!loc) return;
  //var parD = me.parent.userData;

  //var to = new THREE.Vector3(loc.x + (dir == 2 ? -20 : dir == 3 ? 20 : 0),loc.y,loc.z + (dir == 0 ? 20 : dir == 1 ? -20 : 0));
  //var toO = new THREE.Vector3(loc.x,loc.y,loc.z);
  var toO = calcPos(me.parent.parent);//new THREE.Vector3(parseFloat(-parD.props[1][0])*8,parseFloat(parD.props[1][2])*3,parseFloat(parD.props[1][1])*8);
  if(me.parent.parent.userData.ori){
    toO.x -= me.parent.parent.userData.ori[0]*10*0.8;
    toO.y += me.parent.parent.userData.ori[2]*4*0.8;
    toO.z += me.parent.parent.userData.ori[1]*10*0.8;
  }
  //var max = [(dir == 2 ? -20 : dir == 3 ? 20 : 0),(dir == 0 ? 20 : dir == 1 ? -20 : 0)];

  var done = false;
  var dest = []; //List of possible destinations
  pieces.forEach(c=>{
    //var to = c.position.clone();//toO.clone();
    var to = calcPos(c);//new THREE.Vector3(parseFloat(-c.userData.props[1][0])*8,parseFloat(c.userData.props[1][2])*3,parseFloat(c.userData.props[1][1])*8);
    //var toC = c.position.clone();
    //c = c.children[0];
    //console.log("CHECKING...",c);
    if(done) return;
    if(!c.userData.props) return;
    if(c.userData.props[0][0] != 0 ? !c.userData.ori : false) return;
    if(c.userData.ori){
      to.x -= c.userData.ori[0]*10*0.8;
      to.y += c.userData.ori[2]*4*0.8;
      to.z += c.userData.ori[1]*10*0.8;
    }
    //console.log("FOUND TILE",c.position,to);
    var distX = (to.x)-toO.x;
    var distZ = (to.z)-toO.z;
    var jumpDist = Math.abs(to.y-toO.y);
    var moveDist = Math.sqrt(Math.pow(Math.abs(distX),2)+Math.pow(Math.abs(distZ),2));
    if(jumpDist > 16) return; //How high can he jump? 4 tiles
    if(moveDist > 22) return; //How far can he move? 2 studs, although there is tolorance anround diagonals
    //console.log(to,toO,distX,distZ);
    //console.log(max,dir);
    //if(c.position.x >= to.x+(max[0] < 0 ? max[0] : 0) && c.position.x <= to.x+(max[0] > 0 ? max[0] : 0) && c.position.z >= to.z+(max[1] < 0 ? max[1] : 0) && c.position.z <= to.z+(max[1] > 0 ? max[1] : 0)){
    //if((max[0] >= 0 ? distX >= 0 && distX <= 20 : max[0] <= 0 ? distX <= 0 && distX >= -20 : false) && (max[1] >= 0 ? distZ >= 0 && distZ <= 20 : max[1] <= 0 ? distZ <= 0 && distZ >= -20 : false)){
    if(dir == 0 ? Math.abs(distX) <= Math.abs(distZ) && distZ >= 0 : dir == 1 ? Math.abs(distX) <= Math.abs(distZ) && distZ <= 0 : dir == 2 ? Math.abs(distX) >= Math.abs(distZ) && distX <= 0 : dir == 3 ? Math.abs(distX) >= Math.abs(distZ) && distX >= 0 : false){
      //alert("ID: " + c.name.split("_")[1] + " -- Found! DIR: " + dir);
      if(toO.x == to.x && toO.z == to.z) return;
      if(me.parent.parent.name.split("_")[1] == c.name.split("_")[1]) return;
      jumpDist = parseFloat(jumpDist);
      moveDist = parseFloat(moveDist);
      dest.push([c,jumpDist+moveDist,jumpDist,moveDist]);
    }
  });
  var desI = 0;
  var smallest = null;
  //console.log(dest);
  dest.forEach(function(des){
    if(!smallest) smallest = des;
    else if(des[1]<smallest[1]){
      smallest = des;
    }
    if(dest.length == 1 || (desI == dest.length-1 && smallest)){
      var toLoc = smallest[0].name.split("_")[1];
      console.log("Dist: " + smallest[2],smallest[3]);
      toLoc = parseInt(toLoc);
      movePlayerTo(who,toLoc);
      socket.emit('movePlayer',who,toLoc);
      done = true;
    }
    desI++;
  });
}
socket.on('updatePlayer',function(who,data,s,ex){
  var p = scene.getObjectByName(who);
  const end = function(p){
    if(ex) p.userData = {n:ex};
    if(data == null){
      var par = p.parent;
      p.parent.remove(p);
      players.splice(players.indexOf(p),1);
      let id = par.name.split("_")[1];
      let subb = scene.getObjectByName("sub_" + id);
      let subtract = subb ? 1 : 0;
      par.children.forEach(function(c){
        var i = par.children.indexOf(c);
        c.position.y = 16*(i-subtract)+3;
      });
      return;
    }
    else{
      movePlayerTo(who,data.l);
      if(s){
        if(s.c != null) SetColor(p,s.c);
      }
    }
  };
  if(!p){
    if(!data) return;
    SpawnPlayer(who,data.l,s,function(pl){
      end(pl);
    });
  }
  else end(p);
});
//movement
var canMove = true;
var animMovement = false; //BETA
function movePlayerTo(who,loc,overrideSameLoc=false){
  var p = scene.getObjectByName(who);
  if(!p) return;
  var to = scene.getObjectByName("p_" + loc);
  if(!to) return;

  var par = p.parent;

  var sameloc = false;
  if(par == to) sameloc = true;

  if(!sameloc || overrideSameLoc){
    p.position.set(0,3,0);
    if(!animMovement) p.parent.remove(p); //
    else pMove(p,par,to);/*if(!anim[p.name]){
      anim[p.name] = {i:0,id:0,d:{
        p:p,
        f:p.parent,
        t:to
      }};//pMove(p,p.parent,to);
    }
    else{
      var i = p.parent.children.indexOf(p);
      p.position.x = p.parent.position.x;
      p.position.z = p.parent.position.z;
      p.position.y = 16*i+3;
      anim[p.name] = {i:0,id:0,d:{
        p:p,
        f:p.parent,
        t:to
      }};
    }*/

    let id = par.name.split("_")[1];
      let subb = scene.getObjectByName("sub_" + id);
      let subtract = subb ? 1 : 0;
    par.children.forEach(function(c){
      if(c.name.startsWith("sub")) return;
      var i = par.children.indexOf(c);
      c.position.y = 16*(i-subtract)+3;
    });

    if(!animMovement){
      to.children[0].add(p); //sub group
    }
  }

  if(!animMovement) {
    var i = p.parent.children.indexOf(p);
    p.position.y = 18*i+3;
    //Custom piece origin
    if(to.userData.ori){
      let ori = to.userData.ori;
      p.position.x -= ori[0]*10*0.8;
      p.position.y += ori[2]*4*0.8;
      p.position.z += ori[1]*10*0.8;
      //-data[1][0]*10,data[1][2]*4,data[1][1]*10
    }
  }
}
function pMove(p,f,t){
  if(p.name == user.uid) canMove = false;
  let i = 0;
  let r = Math.abs(t.position.z-f.position.z)/2;
  if(r == 0) r = Math.abs(t.position.x-f.position.x)/2;
  let aa = 0;
  //let hs = 0.75;
  let ans = 1; //angle scale
  let sf = 2; //speed factor
  var iamt2 = p.parent.children.indexOf(p)+1;
  p.parent.remove(p);
  t.children[0].add(p); //child group
  if(p.rotation.z != 0 || p.rotation.x != 0){
    p.rotation.z = 0;
    p.rotation.x = 0;
  }
  var iamt = p.parent.children.indexOf(p)+1;
  //p.position.x = f.position.x;
  //p.position.z = f.position.z;
  //p.position.y = 16*i+3;
  const move = function(){
    let a = i*(Math.PI/180);
    let y = Math.sin(a)*r;
    let x = Math.cos(a)*r;

    //look-rotation
    //if(t.position.x - f.position.x > 0) p.rotation.y = rad(90);
    //else if(t.position.x - f.position.x < 0) p.rotation.y = rad(-90);
    //if(t.position.z - f.position.z > 0) p.rotation.y = rad(0);
    //else if(t.position.z - f.position.z < 0) p.rotation.y = rad(180);

    aa += (i < 45 ? -ans : i < 90 ? ans : i < 135 ? ans : i <= 180 ? -ans : 0);
    //Plot(x,y*hs,aa); //(i < 45 ? -i*2 : i < 90 ? i*2 : i*2)
    //
    let za = (t.position.z < f.position.z ? 1 : -1);
    let xa = (t.position.x < f.position.x ? 1 : -1);

    if(t.position.z - f.position.z == 0){
      p.position.x = xa*x + xa*(r/2+5);
    }
    else{
      p.position.z = za*x + za*(r/2+5);// + f.position.z;
    }
    if(i < 90 ? p.position.y < y*(iamt > iamt2 ? iamt : iamt2)*2 + f.position.y + 3 : true) p.position.y = y*(iamt > iamt2 ? iamt : iamt2)*2 + f.position.y + 3;
    p.rotation[t.position.z - f.position.z == 0 ? "z" : "x"] = (t.position.z - f.position.z > 0 || t.position.x - f.position.x < 0 ? -1 : 1)*aa*(Math.PI/180);
    //
    setTimeout(function(){
      i += sf;
      if(i<180 && (i>90 ? p.position.y > 16*((iamt-1)) : true)) move();
      else{ //done
        p.position.set(0,3,0);
        p.rotation.x = 0;
        p.rotation.z = 0;
        //var i = p.parent.children.indexOf(p);
        p.position.y = 16*(iamt-1)+3;
        if(p.name == user.uid) canMove = true;
      }
    },1);
  };
  move();
}
var man = {}; //moveAnim vars
function moveAnim(uid,f,t){
  man[uid] = {
    i:0,
    f:f,
    t:t
  };
  const move = function(d){

  };
  move(man[uid]);
}

//Local/Server Simplifier
function lss(event,a){
  switch(event){
    case 'edit':
      let id = a.id;
      console.log("updating... " + id);
      if(!id) id = a.c.name.split("_")[1];
      //local
      if(a.i == null) a.c.userData.props[1][a.ddir] = a.val;
      else{
        if(a.c.userData.props[1][a.ddir] == null) a.c.userData.props[1][a.ddir] = 0;
        a.c.userData.props[1][a.ddir] += (a.val)*a.i;
        //if(a.c.userData.props[1][a.ddir] == 0) a.c.userData.props[1][a.ddir] = null;
      }
      updateObj(id,a.c.userData,true);
      //server
      socket.emit('edit',1,id,[a.ddir,a.c.userData.props[1][a.ddir]]);
    break;
    default:
      return null;
  }
}

//Clone Struct
function cloneS(s){
  var n = JSON.stringify(s).startsWith("[") ? [] : {};
  /*const layer = function(a,b){
    Object.keys(b).forEach(function(c){
      a[c] = b[c];
      if(typeof b[c] == "object") layer(a[c],b[c]);
    });
  }*/
  Object.keys(s).forEach(function(c){
    n[c] = typeof s[c] == "object" ? cloneS(s[c]) : s[c];
    //if(typeof s[c] == "object") layer(n[c],s[c]);
  });
  return n;
}

var isShift = false;
var isCtrl = false;
var isAlt = false;
document.addEventListener('keydown',e=>{
  var key = e.key;
  if(key == "[") fakeInit();
  if(isAlt || isCtrl) e.preventDefault();
  if(key == "Shift"){
    isShift = true;
  }
  if(key == "Control"){
    e.preventDefault();
    isCtrl = true;
  }
  if(key == "Alt"){
    e.preventDefault();
    isAlt = true;
  }

  if(canMove){ 
    if(key == "ArrowUp"){ //Move Forward
    movePlayer(user.uid,camDir);
    }
    if(key == "ArrowDown"){ //Move Back
      movePlayer(user.uid,camDir == 1 ? 0 : camDir == 2 ? 3 : camDir == 3 ? 2 : 1);
    }
    if(key == "ArrowRight"){ //Move Right
      movePlayer(user.uid,camDir == 1 ? 3 : camDir == 2 ? 1 : camDir == 3 ? 0 : 2);
    }
    if(key == "ArrowLeft"){ //Move Left
      movePlayer(user.uid,camDir == 1 ? 2 : camDir == 2 ? 0 : camDir == 3 ? 1 : 3);
    }
  }

  //In the future there will configurable keybinds
  if((isCtrl && key == "x") || key == "X"){ //Delete OBJ
    let ar = [];
    selObjs.forEach(function(c){
      let id = c.name.split("_")[1];
      ar.push(id);
    });
    ar.forEach(function(c){
      let id = c;
      removePiece(id,true);
      socket.emit('removePiece',id);
    });
    if(subinputmenu.childNodes[0]) if(subinputmenu.childNodes[0].childNodes[0]) if(subinputmenu.childNodes[0].childNodes[0].innerHTML.startsWith("Are you sure you want to remove")){
      LoadSubInputMenu(-1);
    }
  }
  //Undo/Redo
  if(isCtrl && key == "z") undo.undo();
  if(isCtrl && key == "Z") undo.redo();

  //Moving Pieces
  if((key == "w" || key == "s" || key == "d" || key == "a")&&!isShift&&!isAlt&&!isCtrl){
    let dir = key == "w" ? (camDir == 1 ? 1 : camDir == 2 ? 2 : camDir == 3 ? 3 : 0) : key == "s" ? (camDir == 1 ? 0 : camDir == 2 ? 3 : camDir == 3 ? 2 : 1) : key == "d" ? (camDir == 1 ? 3 : camDir == 2 ? 1 : camDir == 3 ? 0 : 2) : key == "a" ? (camDir == 1 ? 2 : camDir == 2 ? 0 : camDir == 3 ? 1 : 3) : -1;
    //cam rotation stuff
    if(dir > 3) dir %= 3;
    if(dir != -1){
      selObjs.forEach(function(c){
        let id = c.name.split("_")[1];
        //let hob = document.getElementById("hobj_" + id);

        let ddir = dir == 2 || dir == 3 ? 0 : 1;
        let val = (dir == 3 || dir == 1 ? -1 : 1);

        lss('edit',{c:c,id:id,ddir:ddir,val:val,i:1});

        
        /*var check = function(cc){ //depricated
          if(cc.userData.c){
            cc.userData.c.forEach(function(childId){
              let child = scene.getObjectByName("p_" + childId);
              if(!child) return;
              let cId = child.name.split("_")[1];
              lss('edit',{c:child,id:cId,ddir:ddir,val:val,i:1});
              check(child);
            });
          }
        };
        check(c);*/
        

        /*//local
        c.userData.props[1][ddir] += val;
        updateObj(id,c.userData.props);
        //server
        socket.emit('edit',1,id,[ddir,c.userData.props[1][ddir]]);*/
      });
    }
  }
  //Up and Down, Rot right and left
  if(key == "W" || key == "S"){
    selObjs.forEach(function(c){
      lss('edit',{c:c,ddir:2,val:1,i:key == "W" ? 1 : -1});
    });
  }
  if(key == "D" || key == "A"){
    selObjs.forEach(function(c){
      lss('edit',{c:c,ddir:3,val:22.5,i:key == "D" ? 1 : -1});
    });
  }
  if(isAlt){
    if(key == "w" || key == "s"){
      selObjs.forEach(function(c){
        lss('edit',{c:c,ddir:4,val:22.5,i:key == "s" ? 1 : -1});
      });
    }
    if(key == "d" || key == "a"){
      selObjs.forEach(function(c){
        lss('edit',{c:c,ddir:5,val:22.5,i:key == "a" ? 1 : -1});
      });
    }
  }

  //Duplicate selected pieces //WIP
  if(isCtrl && key == "d"){
    let startMax = GetMaxPieceId()+1;
    let i = 0;
    selObjs.forEach(function(c){
      createPieceS(c,cloneS(c.userData),startMax+i,true,false);
      i++;
    });
    Actions(0);
  }
  //Join objects
  if(isCtrl && key == "j"){
    if(selObjs.length != 2) return;
    LoadSubInputMenu(5);
  }
});
document.addEventListener('keyup',e=>{
  var key = e.key;
  if(key == "Shift"){
    isShift = false;
  }
  if(key == "Control") isCtrl = false;
  if(key == "Alt") isAlt = false;
});

if (document.addEventListener) {
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    /*if(!isShift)
    {
      e.preventDefault();
      return;
    }
  	if(cxMenu.visibility == "visible")
    {
    	cxMenu.opacity = "0";
    	//setTimeout(function() {
      cxMenu.visibility = "hidden";
    //}, 100001);
    }
    else
    {
    	var posX = e.clientX;
    	var posY = e.clientY;
    	menu(posX, posY);
    	//e.preventDefault();
    }
    e.preventDefault();
  }, false);*/
  /*document.addEventListener('click', function(e) {
    cxMenu.opacity = "0";
    setTimeout(function() {
      cxMenu.visibility = "hidden";
    }, 100001);
  }, false);*/
  });
}
function SideMenu(menu){
  if(menu.style.visibility == "visible"){
    menu.style.visibility = "hidden";
    menu.parentNode.childNodes[0].innerHTML = ">";
    return;
  }
  menu.style.visibility = "visible";
  menu.parentNode.childNodes[0].innerHTML = "<";
  /*switch(id){
    case 0:

    break;
  }*/
}

const alters = {
  0:1,
  1:0,
  2:3,
  3:2,
  10:11,
  11:10
};

function GetMaxPieceId(){
  var max = -1;
  pieces.forEach(function(c){
    var id = c.name.split("_")[1];
    id = parseInt(id);
    if(id > max) max = id;
  });
  return max;
}

//Function to create a piece from Raw Data (copying pieces)
function createPieceS(pre,data,id,sel=true,deSelOthers=true,off=[1,2,1]){ //data = obj.userData
  if(data == null) return;
  console.log("Creating new piece from SCRATCH: ",pre);

  data = cloneS(data);

  console.log(111);

  //validate data
  if(!data.props) return;
  console.log(1);
  if(data.props.length != 3){
    console.log(data.props);
    return;
  }
  console.log(2);
  if(data.props[0].length != 2) return;
  console.log(3);
  if(typeof data.props[0][0] != "number" || typeof data.props[0][1] != "number") return;
  console.log(4);
  if(typeof data.props[2] != "number") return;
  console.log(5);
  if(data.props[1].length < 3 || data.props[1].length > 6) return;

  console.log(222);

  /*if(!pre) pre = {position:new THREE.Vector3(0,8,0)};
  var loc = pre.position.clone();
  loc.x += off[0]*10;
  loc.y += off[1]*4;
  loc.z += off[2]*10;*/

  data.props[1][0] += off[0];
  data.props[1][1] += off[2];
  data.props[1][2] += off[1];

  console.log(333);
  console.log(data);

  socket.emit('createPieceS',data);
  var call = sel ? function(go){
    SelectObj(go,deSelOthers);
  } : null;

  console.log(444);

  SpawnPiece(data,id,null,null,call);

  console.log(555);
}

//Create pieces
function createPiece(pre,off=[0,0,0],id,sel=true,col){
  //if(!pre || id == null) return;
  //if(typeof id != "object") return;
  //if(!uo2.val()[id[0]]) return;
  //if(!uo2.val()[id[0]][id[1]]) return;

  //var loc = addv(pre.position,off);
  var loc = [pre.userData.props[1][0],pre.userData.props[1][1],pre.userData.props[1][2]];
  loc[0] += off[0];
  loc[1] += off[1];
  loc[2] += off[2];
  if(col == null){
    if(id[0] == 0 && id[1] == 0 && alters[pre.userData.props[2]] != null) col = alters[pre.userData.props[2]];
    else col = pre.userData.props[2];
  }
  if(col == null) col = 0;
  socket.emit('createPiece',id,loc,col);
  SpawnPiece({props:[id,loc,col]},GetMaxPieceId()+1,null,null,function(go){
    //alert("should be deslecting all objs and sel this");
    SelectObj(go,true);
  });
}
socket.on('create',function(i,data){
  if(i == null || data == null) return;
  SpawnPiece(data,i);
});
socket.on('remove',function(i){
  removePiece(i);
});
function removePiece(i,local){
  var p = scene.getObjectByName("p_" + i);
  if(!p) return;
  var removedPlayers = [];
  players.forEach(function(c){
    if(c.parent.parent == p){
      scene.add(c);
      c.position.set(0,9,0);
      removedPlayers.push(c);
      console.log("::: found player....");
      //movePlayerTo(c,pieces[0].userData);
    }
  });
  Object.keys(hovers).forEach(function(c){
    let hh = hovers[c];
    if(hh[0].name == "p_" + i){
      hovers[c][3] = 0;
    }
  });
  Actions(1,p);

  //undo
  if(local) undo.add(0,{p:p.userData.props});

  scene.remove(p.parent);
  pieces.splice(pieces.indexOf(p),1);
  var h = document.getElementById("hobj_" + i);
  if(!h) return;
  h.parentNode.removeChild(h);

  removedPlayers.forEach(function(c){
    console.log("::: moving player.....");
    //pieces[0].children[0].add(c);
    let loc = parseInt(pieces[0].name.split("_")[1]);
    var ob = scene.getObjectByName("p_" + loc);
    ob.children[0].add(c);
    movePlayerTo(c.name,loc);
    socket.emit('movePlayer',c.name,loc);
  });
}

//Click And Drag Hierarchy Functions
var hSel = null;
var hHover = null;