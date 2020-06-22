var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var fs = require('fs');

app.use(express.static(__dirname + "/static"));

io.on('connection', function(socket){
  console.log('a user connected');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

var admin = require("firebase-admin");
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');

var serviceAccount = JSON.parse(fs.readFileSync("private/allgamerpgfs-firebase-adminsdk-qjvkl-a397732cc1.json"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://allgamerpgfs.firebaseio.com",
  databaseAuthVariableOverride: {
    uid: "auth-allgame-server423"
  }
});

// The app only has access as defined in the Security Rules
var db = admin.database();

//VARIABLES
var userSock = {};
var userUid = {};
var userData = {};
var userRef = db.ref('users');
var hasLoaded = {};
var g = {};

/*db.collection('users').get()
  .then((snapshot) => {
    snapshot.forEach((doc) => {
      console.log(doc.id, '=>', doc.data());
    });
  })
  .catch((err) => {
    console.log('Error getting documents', err);
  });*/


/*var ref = db.ref("/some_resource");
ref.once("value", function(snapshot) {
  console.log(snapshot.val());
});*/

function gs(socket){
  var user = userSock[socket];
  if(!user) return null;
  if(!user.uid || !user.displayName || !user.photoURL) return null;
  return user;
}

function GetDate(id = 0){
  let today = new Date();
  let dd = String(today.getDate()).padStart(2, '0');
  let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  let yyyy = today.getFullYear();
  yyyy = yyyy.toString().substring(2,yyyy.length);
  let date = dd+"/"+mm+"/"+yyyy;

  if(id == 0) return date;
  if(id == 1) return [dd,mm,yyyy];
}

//Clone Struct
function cloneS(s){
  var n = JSON.stringify(s).startsWith("[") ? [] : {};
  Object.keys(s).forEach(function(c){
    n[c] = typeof s[c] == "object" ? cloneS(s[c]) : s[c];
  });
  return n;
}

io.on('connection', function(socket){
  socket.on('initUser',function(user,call){
    //Make sure user exists
    if(!user)
    {
      console.log("User didn't exist");
      if(call) call("Incorrect Login Format");
      return;
    }
    if(!user.uid)
    {
      console.log("User uid didn't exist");
      if(call) call("Incorrect Login Format");
      return;
    }
    //Create new user in UserSock only if he had not been there previously
    if(!userSock[socket.id])
    {
      userSock[socket.id] = user;
    }
    userUid[user.uid] = socket;
    //Check and Create new user doc if there is none previously
      let date = GetDate();
      let newuser = false;
      async function end(){
        await userRef.child(user.uid + "/lastLogIn").once('value',snap => {
          if(snap.val() == null) //Load new user info
          {
            newuser = true;
            userRef.child(user.uid).set({
              /*friends:{
                "RECTAGON Official":date //"FeldSpire","CallMire"
              },*/
              name: user.displayName,
              photo: user.photoURL,
              lastLogIn:date,
              joined:date,
              s:{
                c:6
              }
            });
          }
          else if(snap.val() != date)
          {
            userRef.child(user.uid + "/lastLogIn").set(date);
          }
        });
        userRef.child(user.uid).once('value',snap => {
          if(snap.val() == null) return;
          userData[user.uid] = snap.val();
          //socket.emit('userData',snap.val(),newuser);
          if(call) call(snap.val(),newuser);

          //socket.to(userData[user.uid].mapIn.split(";")[0]).emit('setter',2,[user.uid,"Online"]);
        });
      };
      end();
  });
  socket.on('searchMaps',function(id,name,call){
    var user = gs(socket.id);
    if(!user) return;
    if(!call) return;
    switch(id)
    {
      case 0:
        db.ref("LGCP/maps/" + name + "/auth").once('value',function(snap){
          let ud = userData[user.uid];
          var alt = {
            o:ud.myMaps ? ud.myMaps.includes(name) : false,
            p:ud.mapHistory ? ud.mapHistory[name] ? ud.mapHistory[name] : "" : ""
          }
          var results = null;
          if(snap.val() != null) results = snap.val();
          if(call) call(0,results,alt);
          //socket.emit('searchResult',0,results,alt);
        });
      break;
    }
  });
  socket.on('joinMap',function(name,pass,call){
    var user = gs(socket.id);
    if(!user) return;
    db.ref("LGCP/maps/" + name + "/auth").once('value',function(snap){
      if(snap.val() == null){
        console.log("Map: " + name + " doesn't exist!");
        return;
      }
      let ud = userData[user.uid];
      var alt = {
        o:ud.myMaps ? ud.myMaps.includes(name) : false,
        p:ud.mapHistory ? ud.mapHistory[name] ? ud.mapHistory[name] : "" : ""
      }
      var outcome = false;
      if(alt.o) outcome = true;
      else if(snap.val().pass == pass || snap.val().pass == alt.p) outcome = true;
      let er;
      if(!outcome) {
        er = {t:0,d:name};
      }
      //else console.log("CORRECT PASSWORD from " + user.displayName);
      if(outcome){ //Successfully joined map
        var res = name + (snap.val().pass ? ";" + snap.val().pass : "");
        userData[user.uid].mapIn = res;
        if(!ud.mapHistory) userData[user.uid].mapHistory = {};
        userData[user.uid].mapHistory[name] = (snap.val().pass ? snap.val().pass : "");
        userRef.child(user.uid + "/mapIn").set(res);
        userRef.child(user.uid + "/mapHistory/" + name).set(snap.val().pass ? snap.val().pass : "");
        joinMap(user,name,call);
      }
      else if(call) call({er:er});
      //socket.emit('joinMap',outcome,er);
    });
  });
  socket.on('resume',function(call){
    var user = gs(socket.id);
    if(!user) return;
    let ud = userData[user.uid];
    if(!ud) return;
    if(!ud.mapIn) return;
    joinMap(user,ud.mapIn.includes(";") ? ud.mapIn.split(";")[0] : ud.mapIn,call);
  });
  socket.on('getData',function(id,call){
    if(id == null) return;
    if(!call) return;
    var user = gs(socket.id);
    if(!user) return;
    switch(id){
      case 0:
        if(!userData[user.uid]){
          userRef.child(user.uid).once('value',snap => {
            if(snap.val() == null) return;
            userData[user.uid] = snap.val();
            call(snap.val());
          });
        }
        else call(userData[user.uid]);
      break;
    }
  });
  function MapDecoder(map){
    //console.log("Decoder initialized");
    var str = {
      p:{},
      u:map.users || {}
    };
    console.log("Decoder started");
    Object.keys(map.parts).forEach(function(c){ //Decode parts
      //console.log("decode progress...");
      var part1 = map.parts[c];
      var partData = map.partd ? map.partd[c] : null;
      var part2 = part1.split(";");
      var part = [];
      part2.forEach(function(cc){
        part.push(cc.includes(",") ? cc.split(",").map(Number) : parseFloat(cc));
      });
      str.p[c] = {
        props:part
        //sub
      };
      if(partData) str.p[c].d = partData;
    });
    console.log("decode finished"); //str = map data
    return str;
  }
  async function joinMap(user,name,call){
    if(!user || !name) return;
    console.log("started join");
    if(!g[name]){
      var getter = async function(){
        console.log("started download");
        await db.ref("LGCP/maps/" + name).once('value',function(snap){
          if(!snap.val()) return;
          g[name] = MapDecoder(snap.val());
          //reset players h from abrupt restart
          /*g[name].u.forEach(function(c){
            g[name].u[c].h = false;
          });*/
        });
      }
      await getter();
    }
    console.log("finished downloading");
    if(!g[name]) return;
    //console.log("Promise",g[name].p);
    //console.log("Joining... " + name);
    //console.log(userUid[user.uid].id);
    //Setup
    if(!g[name].u) g[name].u = {};
    if(!g[name].u[user.uid]){
      g[name].u[user.uid] = {l:0};//g[name].p[Object.keys(g[name].p)[0]];
    }
    if(!g[name].p[g[name].u[user.uid].l]) g[name].u[user.uid].l = 0;
    //g[name].u[user.uid].h = true;
    db.ref("LGCP/maps/" + name + "/users/" + user.uid).set(g[name].u[user.uid]);
    //
    hasLoaded[user.uid] = name;
    userUid[user.uid].join(name);
    var sd = {};
    Object.keys(g[name].u).forEach(function(c){
      if(userData) if(userData[c]) if(userData[c].mapIn){
        var n = userData[c].mapIn;
        if(!n) return;
        if(n.includes(";")) n = n.split(";")[0];
        if(n == name) if(userData[c].s) if(hasLoaded[c] == name){
          sd[c] = userData[c].s;
          sd[c].n = {
            n:userData[c].name
          }
        }
      }
    });
    if(call) call(g[name],sd);
    userUid[user.uid].to(name).emit('updatePlayer',user.uid,g[name].u[user.uid],userData[user.uid].s,{n:userData[user.uid].name});
    //else io.to(userUid[user.uid]).emit('loadMap',g[name]); //pieces, players, piece data
  }

  //Editor Events

  function sj(a,m){
    var out = "";
    let i = 0;
    a.forEach(c=>{
      out += c.toString();
      if(i+1<a.length) out += m;
      i++;
    });
    return out;
  } //Custom String Joiner
  //console.log("JOINER: [345,[345,435],[213,321890],4823sad9m,438290]",sj([345,[345,435],[213,321890],"4823sad9m",438290],";"));
  socket.on('edit',(sid,id,data)=>{
    if(id == null) return;
    var user = gs(socket.id);
    if(!user) return;
    if(id == null || data == null) return;
    edit(user,sid,id,data);
  });
  function edit(user,sid,id,data){
    if(sid == null) return;
    if(id == null) return;
    if(!user) return;
    if(id == null || data == null) return;

    var ud = userData[user.uid];
    if(!ud.mapIn) return;
    if(ud.mapIn == "") return;
    var r = (ud.mapIn.includes(";") ? ud.mapIn.split(";")[0] : ud.mapIn);
    if(!r) return;
    //

    //Gain Map Access
    var rr = g[r];
    if(!rr) return;

    //Gain Obj Access
    var o = rr.p[id];
    if(!o) return; //obj doesn't exist

    switch(sid){
      case 0: //Change Color
        if(typeof data != "number") return;
        if(o.props[2] != data){
          o.props[2] = data;
          db.ref("LGCP/maps/" + r + "/parts/" + id).set(sj(o.props,";"));
        }
        io.to(r).emit('updateObj',id,o);
        //console.log("changing color...",o);
      break;
      case 1: //Change Position/Rotation
        if(typeof data != "object") return;
        if(typeof data[0] != "number") return;
        if(typeof data[1] != "number") return;
        if(data[0] > 5) return;
        if(o.props[1][data[0]] == data[1]) return;

        if(data[2] == null) o.props[1][data[0]] = data[1];
        if(data[2] === true) o.props[1][data[0]] += data[1];

        //Save space for rots
        if(data[3] == 0) data[3] = null;
        if(data[4] == 0) data[4] = null;
        if(data[5] == 0) data[5] = null;

        db.ref("LGCP/maps/" + r + "/parts/" + id).set(sj(o.props,";"));
        userUid[user.uid].to(r).emit('updateObj',id,o);
      break;
      case 2: //Advanced Data, custom origin etc
        console.log("editing adv data...");
        if(!data){
          console.log("exit 111");
          return;
        }
        if(typeof data != "object"){
          console.log("exit 111");
          return;
        }
        switch(data[0]){
          case "origin":
            if(!rr.p[id].d) rr.p[id].d = {};
            if(data[1] == null){
              delete rr.p[id].d.ori;
            }
            else{
              if(typeof data[1] == "object"){
                if(rr.p[id].d.ori == null) rr.p[id].d.ori = [0,0,2];
                rr.p[id].d.ori = data[1];
              }
              else if(typeof data[1] == "number"){
                if(rr.p[id].d.ori == null) rr.p[id].d.ori = [0,0,2];
                rr.p[id].d.ori[data[1]] = data[2];
              }
            }
            //console.log("setting on..." + id);
            db.ref("LGCP/maps/" + r + "/parts/" + id).set(sj(rr.p[id].props,";"));
            if(rr.p[id].d.ori) db.ref("LGCP/maps/" + r + "/partd/" + id + "/ori").set(rr.p[id].d.ori);
            else db.ref("LGCP/maps/" + r + "/partd/" + id + "/ori").set(null);
            userUid[user.uid].to(r).emit('updateObj',id,rr.p[id]);
          break;
          case 'pcSys':
            if(!rr.p[id].d) rr.p[id].d = {};
            if(data[1] == null){ //clear children
              delete rr.p[id].d.c;
              db.ref("LGCP/maps/" + r + "/partd/" + id + "/c").set(null);
              userUid[user.uid].to(r).emit('updateObj',id,rr.p[id]);
              return;
            }
            if(data[2] == null) data[2] = true; //default: add child
            if(!rr.p[data[1]]) return; //child didn't exist
            if(rr.p[id].d.c == null) rr.p[id].d.c = [];
            if(data[2]){
              rr.p[id].d.c.push(data[1]);
              if(data[3]){
                rr.p[data[1]].props[1][0] = parseFloat(data[3][0]) || 0;
                rr.p[data[1]].props[1][1] = parseFloat(data[3][1]) || 0;
                rr.p[data[1]].props[1][2] = parseFloat(data[3][2]) || 0;
              }
              //rr.p[data[1]].props[1][0] -= rr.p[id].props[1][0];
              //rr.p[data[1]].props[1][1] -= rr.p[id].props[1][1];
              //rr.p[data[1]].props[1][2] -= rr.p[id].props[1][2];
              db.ref("LGCP/maps/" + r + "/parts/" + data[1]).set(sj(rr.p[data[1]].props,";"));
            }
            else{
              let ind = rr.p[id].d.c.indexOf(data[1]);
              if(ind == null) return;
              rr.p[id].d.c.splice(ind,1);
              if(data[3]){
                rr.p[data[1]].props[1][0] = parseFloat(data[3][0]) || 0;
                rr.p[data[1]].props[1][1] = parseFloat(data[3][1]) || 0;
                rr.p[data[1]].props[1][2] = parseFloat(data[3][2]) || 0;
              }
              db.ref("LGCP/maps/" + r + "/parts/" + data[1]).set(sj(rr.p[data[1]].props,";"));
              userUid[user.uid].to(r).emit('updateObj',data[1],rr.p[data[1]]);
            }
            db.ref("LGCP/maps/" + r + "/partd/" + id + "/c").set(rr.p[id].d.c);
            userUid[user.uid].to(r).emit('updateObj',id,rr.p[id]);
            rr.p[id].d.c.forEach(function(cc){
              if(rr.p[cc]) userUid[user.uid].to(r).emit('updateObj',cc,rr.p[cc]);
            });
          break;
        };
      break;
    };
  }
  socket.on('editUser',function(id,data){
    if(id == null) return;

    var user = gs(socket.id);
    if(!user) return;

    var ud = userData[user.uid];

    var r = null;
    if(ud.mapIn != null && ud.mapIn != "") r = (ud.mapIn.includes(";") ? ud.mapIn.split(";")[0] : ud.mapIn);

    switch(id){
      case 0: //Set Player Color
        //Verification
        if(typeof data != "number") return;
        //
        if(!ud.s) ud.s = {};
        ud.s.c = data;
        userRef.child(user.uid + "/s/c").set(data);
        if(r) socket.to(r).emit('updateUser',user.uid,ud.s);
      break;
    }
  });
  socket.on('movePlayer',function(who,loc){
    if(loc == null || who == null) return;
    var user = gs(socket.id);
    if(!user) return;

    var ud = userData[user.uid];
    if(!ud.mapIn) return;
    if(ud.mapIn == "") return;
    var r = (ud.mapIn.includes(";") ? ud.mapIn.split(";")[0] : ud.mapIn);
    if(!r) return;
    //

    //Gain Map Access
    var rr = g[r];
    if(!rr) return;

    if(rr.u[user.uid] == null) return;
    if(rr.u[user.uid].l == loc) return; //Same loc

    //Gain Obj Access
    var o = rr.p[loc];
    if(!o) return; //obj doesn't exist

    rr.u[user.uid].l = loc;
    db.ref("LGCP/maps/" + r + "/users/" + who + "/l").set(loc);
    socket.to(r).emit('updatePlayer',who,rr.u[user.uid]);
  });
  socket.on('createMap',function(data,call){
    if(!call) return;
    if(data.n == null || data.ep == null || data.vp == null) return;
    if(data.n == "") return;

    let user = userSock[socket.id];
    if(!user) return;
    //console.log("CREATED BY: ",user.displayName);

    //if(Object.keys(data).length > 3) return;

    let end = function(data){
      if(mm){
        console.log("CreateMAP ERR: A map with that name already exists");
        call("A map with that name already exists!");
        return;
      }
      //Create Map
      if(g[data.n]){
        console.log("ERR: Map override rejected");
        return;
      }
      var mapEncoded = { //g[data.n]
        auth:{
          des:"A LGCP 6 map.",
          pass:data.ep
        },
        created:GetDate(),
        owner:user.displayName,
        partd:{0:{hold:true}}, //null,"0,0"
        parts:["0,0;0,0,0;10"]
      };
      db.ref("LGCP/maps/" + data.n).set(mapEncoded);
      g[data.n] = MapDecoder(mapEncoded)
      let ud = userData[user.uid];
      if(ud){
        if(!ud.myMaps) ud.myMaps = [];
        ud.myMaps.push(data.n);
        userRef.child(user.uid + "/myMaps/" + (ud.myMaps.length-1)).set(data.n);
      }
      call(true,data);
    };

    console.log("USER: " + user.displayName + " is Attempting to create map with name: " + data.n);

    let mm = g[data.n] ? true : false;
    if(!mm){
      db.ref("LGCP/maps/" + data.n + "/auth").once('value',function(snap){
        if(snap.val()) mm = true;
        end(data);
      });
    }
    else end(data);
  });
  socket.on('disconnect',function(){
    var user = gs(socket.id);
    if(!user) return;

    var ud = userData[user.uid];
    if(ud) if(ud.mapIn){
      var r = (ud.mapIn.includes(";") ? ud.mapIn.split(";")[0] : ud.mapIn);
      //socket.to(r).emit('setter',2,[user.uid]);
      var rr = g[r];
      if(rr){
        if(rr.u){
          //rr.u[user.uid].h = false;
          socket.to(r).emit('updatePlayer',user.uid,null);
          //db.ref("LGCP/maps/" + r + "/users/" + user.uid + "/h").set(false);
        }
      }
    }

    delete userUid[user.uid];
    delete userSock[socket.id];
    delete userData[user.uid];
    delete hasLoaded[user.uid];
  });
  //Creation
  function amax(arr){
    var max = -1;
    arr.forEach(function(c){
      c = parseInt(c);
      if(c > max) max = c;
    });
    return max;
  }
  socket.on('createPieceS',function(data){
    if(data == null) return;
    //validate data
    if(!data.props) return;
    if(data.props.length != 3) return;
    if(data.props[0].length != 2) return;
    if(typeof data.props[0][0] != "number" && typeof data.props[0][1] != "number")
    if(typeof data.props[2] != "number") return;
    if(data.props[1].length < 3 || data.props[1].length > 6) return;
    if(typeof data != "object") return;

    var user = gs(socket.id);
    if(!user) return;

    var ud = userData[user.uid];
    if(!ud.mapIn) return;
    if(ud.mapIn == "") return;
    var r = (ud.mapIn.includes(";") ? ud.mapIn.split(";")[0] : ud.mapIn);
    if(!r) return;
    //
    var rr = g[r];
    if(!rr) return;
    //
    var i = amax(Object.keys(rr.p))+1;
    if(rr[i]){
      console.log("obj already exists...");
      return;
    }
    //fix
    if(!data.d){
      data.d = {};
      Object.keys(data).forEach(function(key){
        if(key != "props" && key != "d"){
          data.d[key] = data[key];
          delete data[key];
        }
      });
    }
    rr.p[i] = data;
    db.ref("LGCP/maps/" + r + "/parts/" + i).set(sj(rr.p[i].props,";"));
    if(rr.p[i].d){ //Additional Data
      /*Object.keys(rr.p[i].d).forEach(function(c){
        db.ref("LGCP/maps/" + r + "/partd/" + i + "/" + c).set(rr.p[i].d[c]);
      });*/
      db.ref("LGCP/maps/" + r + "/partd/" + i).set(rr.p[i].d);
    }
    socket.to(r).emit('create',i,rr.p[i]);
  });
  socket.on('createPiece',function(id,pos,col){
    if(id == null || pos == null || col == null) return;
    if(typeof id != "object" || typeof pos != "object" || typeof col != "number") return;
    if(id.length != 2 || pos.length < 3 || pos.length > 6) return;
    var user = gs(socket.id);
    if(!user) return;

    var ud = userData[user.uid];
    if(!ud.mapIn) return;
    if(ud.mapIn == "") return;
    var r = (ud.mapIn.includes(";") ? ud.mapIn.split(";")[0] : ud.mapIn);
    if(!r) return;
    //
    var rr = g[r];
    if(!rr) return;
    //
    var i = amax(Object.keys(rr.p))+1;
    if(rr[i]){
      console.log("obj already exists...");
      return;
    }
    rr.p[i] = {props:[id,pos,col]};
    db.ref("LGCP/maps/" + r + "/parts/" + i).set(sj(rr.p[i].props,";"));
    socket.to(r).emit('create',i,rr.p[i]);
  });
  socket.on('removePiece',function(i){
    if(i == null) return;
    var user = gs(socket.id);
    if(!user) return;

    var ud = userData[user.uid];
    if(!ud.mapIn) return;
    if(ud.mapIn == "") return;
    var r = (ud.mapIn.includes(";") ? ud.mapIn.split(";")[0] : ud.mapIn);
    if(!r) return;
    //
    var rr = g[r];
    if(!rr) return;
    //
    if(!rr.p[i]) return;
    delete rr.p[i];
    db.ref("LGCP/maps/" + r + "/parts/" + i).set(null);
    socket.to(r).emit('remove',i);
  });
  function CheckUser(user){
    var ud = userData[user.uid];
    if(!ud.mapIn) return;
    if(ud.mapIn == "") return;
    var r = (ud.mapIn.includes(";") ? ud.mapIn.split(";")[0] : ud.mapIn);
    if(!r) return;
    //
    var rr = g[r];
    if(!rr) return;
    return true;
  }
  //SubItems
  socket.on('createSub',function(id,data){
    if(id == null) return;
    var user = gs(socket.id);
    if(!user) return;
    if(!CheckUser(user)){
      console.log("CREATESUB ERR: USER CHECK FAIL");
      return;
    }

    var ud = userData[user.uid];
    if(!ud.mapIn) return;
    if(ud.mapIn == "") return;
    var r = (ud.mapIn.includes(";") ? ud.mapIn.split(";")[0] : ud.mapIn);

    if(!g[r].p[id].d) g[r].p[id].d = {};
    g[r].p[id].d.sub = data;
    db.ref("LGCP/maps/" + r + "/partd/" + id).set(g[r].p[id].d);
    socket.to(r).emit('createSub',id,data);

  });

  //NEW 2020

  //Verify User V1
  function verify(socket,data={needMap:true}){
    if(socket == null) return;
    if(socket.id == null) return;

    var user = gs(socket.id);
    if(!user) return;
    
    var needMapCheck = CheckUser(user);
    if(data.needMap){
      if(!needMapCheck) return;
    }

    return {needMap:needMapCheck};
  }

  //Getter
  /*socket.on('getter',function(arr,func){
    var verifyData = verify(socket,{needMap:false});
    if(verifyData == null) return;

    var user = gs(socket.id);

    if(typeof arr != "object") return;
    if(!JSON.stringify(arr).startsWith("[")) return;

    arr.forEach(data=>{
      if(data.i == null) return;
      switch(data.i){
        case 0: //Get user color id
          let dataMain = userData[user.uid];
          if(!dataMain.s) return;
          if(dataMain.s.c == null) return;
          let id = dataMain.s.c;
          if(func) func(data.i,id);
        break;
      }
    });
  });*/
  socket.on('getter2',function(id,data,func){
    var verifyData = verify(socket,{needMap:false});
    if(verifyData == null) return;

    if(func == null) return;
    if(typeof func != "function") return;

    var user = gs(socket.id);

    if(id == null) return;
    
    switch(id){
      case 0: //get player color
        var dataMain = userData[user.uid];
        if(!dataMain.s) return;
        if(dataMain.s.c == null) return;
        let id = dataMain.s.c;
        if(func) func(id);
      break;
      case 1: //get map settings data
        var dataMain = userData[user.uid];
        if(data == null) return;
        if(typeof data != "object") return;
        if(!data.length) return;
        switch(data[0]){
          case 0: //Attempt to get password
            if(data[1] == null) data[1] = dataMain.mapIn.split(";")[0];
            if(data[1] == null) return;
            var perm = false;
            var pass;
            
            if(dataMain.mapIn.split(";")[0] == data[1]) perm = true;
            if(!perm){
              dataMain.myMaps.forEach(function(mapName){
                if(!perm) if(mapName == data[1]) perm = true;
              });
            }
            if(!perm){
              Object.keys(dataMain.mapHistory).forEach(function(key){
                var mapStr = dataMain.mapHistory[key];
                var namePass = mapStr.split(";");
                if(!perm) if(namePass[0] == data[1]){
                  pass = namePass[1] != null ? namePass[1] : false;
                  perm = true;
                }
              });
            }
            if(perm){
              if(pass == null){
                db.ref("LGCP/maps/" + data[1] + "/auth/pass").once('value',function(snap){
                  if(snap){
                    func(snap.val());
                  }
                });
              }
              else func(pass);
            }
            else func(false);
          break;
          case 1: //Get Map Desc
            if(data[1] == null) data[1] = dataMain.mapIn.split(";")[0];
            if(data[1] == null) return;
            db.ref("LGCP/maps/" + data[1] + "/auth/des").once('value',function(snap){
              if(snap){
                func(snap.val());
              }
            });
          break;
          case 2: //Get all users in Map
            if(data[1] == null) data[1] = dataMain.mapIn.split(";")[0];
            if(data[1] == null) return;
            db.ref("LGCP/maps/" + data[1] + "/users").once('value',function(snap){
              if(snap){
                var arr = {};
                var i = 0;
                Object.keys(snap.val()).forEach(function(uid){
                  var end = function(){
                    i++;
                    if(i == Object.keys(snap.val()).length){
                      func(arr);
                    }
                  };
                  if(userData[uid]){
                    arr[uid] = {name:userData[uid].name,s:userData[uid].s,p:userData[uid].photo};
                    end();
                  }
                  else{
                    db.ref("users/" + uid).once('value',function(snap2){
                      var val = snap2.val();
                      arr[uid] = {name:val.name,s:val.s,p:val.photo,off:true};
                      end();
                    });
                  }
                });
              }
            });
          break;
        }
      break;
    };
  });
  function verifyMapOwnership(dataMain,name){
    var perm = false;
    
    if(dataMain.mapIn.split(";")[0] == name) perm = true;
    if(!perm){
      dataMain.myMaps.forEach(function(mapName){
        if(!perm) if(mapName == name) perm = true;
      });
    }
    if(!perm){
      Object.keys(dataMain.mapHistory).forEach(function(key){
        var mapStr = dataMain.mapHistory[key];
        var namePass = mapStr.split(";");
        if(!perm) if(namePass[0] == name) perm = true;
      });
    }
    return perm;
  }
  socket.on('setter',function(id,data){
    var verifyData = verify(socket,{needMap:false});
    if(verifyData == null) return;

    var user = gs(socket.id);

    if(id == null) return;

    if(data == null) return;

    if(data[0] == null) return;

    var dataMain = userData[user.uid];
    
    if(data[1] == null) data[1] = dataMain.mapIn.split(";")[0];
    if(data[1] == null) return;

    if(!verifyMapOwnership(dataMain,data[1])) return;
    switch(id){
      case 0: //Set Pass
        db.ref("LGCP/maps/" + data[1] + "/auth/pass").set(data[0]);
        socket.to(data[1]).emit('setter',id,data[0]);
      break;
      case 1: //Set Desc
        db.ref("LGCP/maps/" + data[1] + "/auth/des").set(data[0]);
        socket.to(data[1]).emit('setter',id,data[0]);
      break;
    };
  });
});
