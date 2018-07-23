const app = require('express')(),
  express = require('express'),
  server = require('http').createServer(app),
  io = require('socket.io')(server)
  port = process.env.PORT || 4345;
  bodyParser = require('body-parser'),
  fs =require('fs'),
  cors = require('cors'),
  cache = require('memory-cache'),
  path = require('path'),
  formidable = require('formidable'),
  ioc =require('socket.io-client'),
  config = require('nconf');

var configFilePath = path.join(__dirname,  'config.json');
config.argv()
    .env()
    .file({ file: configFilePath });

/* get blockchain server information */
var netObject={};
  netObject.hosts = config.get('server:hosts') ;
  netObject.nodeCount=config.get('node');
  netObject.nodeInfo=config.get('nodeInfo');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({credentials: true, origin: true}));
app.set('view engine' , 'ejs');
app.set('views' , path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, 'public')));

app.all('/', function (req, res) {
    res.render('index', netObject);
  });

// code for deploy contract
app.post("/deployContract",function(req,res){
// deploy contract
console.log("service called...");
var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      console.dir(fields.account)

let fileRaw = fs.readFileSync(files.file.path, 'utf8');
console.log('compiling contract...');
console.log("server:"+netObject.hosts[fields.node.split("-")[1]-1])
var node = ioc.connect( netObject.hosts[fields.node.split("-")[1]-1] );
node.once( "connect", function () {
    console.log( 'Client2: Connected to port');
  node.emit( "minedBlock", {fileInfo:fileRaw,account:fields.account});
  node.disconnect();
});

})
});

io.sockets.on('connection', function(rcvConn){
   rcvConn.on("success",function(data){
       if(data.status){
           console.log("success!")
        io.sockets.emit("mined",{status:true,msg:'successfully mined'});
     }
   }) 
})

/* Create HTTP server*/
server.listen(port,function(){
console.log('RESTful API server started on: ' + port);
});
