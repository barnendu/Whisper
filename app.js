const app = require('express')(),
  express = require('express'),
  server = require('http').createServer(app),
  io = require('socket.io')(server)
  port = process.env.PORT || 3034;
  bodyParser = require('body-parser'),
  fs =require('fs'),
  cors = require('cors'),
  solc = require('solc'),
  cache = require('memory-cache'),
  path = require('path'),
  formidable = require('formidable'),
  Web3 = require('web3'),
  ioc =require('socket.io-client');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({credentials: true, origin: true}));
app.use(express.static(path.join(__dirname, 'public')));
var web3 = new Web3();
var shh = web3.shh;
var appName = "Transaction Propagation";
const address = "0xd665708e9c1caa06ebf1e4868a13b1673b9f05cb"
web3.setProvider(new Web3.providers.WebsocketProvider('ws://127.0.0.1:8546')); // create websocket connection
web3.eth.net.isListening().then(conn=>{
  if(conn){
    web3.eth.getAccounts((err,account)=>{
    console.log(`account is ${account[0]}`);
    web3.eth.net.getPeerCount(function(error, result){ 
      console.log("No of peer count:"+result)
    })
   
    web3.eth.getAccounts(function(err,account){web3.eth.getBalance(account[0]).then(console.log)})
  })
  }
})

// whisper message polling mechanism
shh.subscribe('messages', {
        symKeyID: 'c860cee76bb30cbe5c7925a5e8e9d864799a0e5b1796795062b6a55986e16661',//data,
        topics: ['0x99123abc']
    },
    function(error, message){
    console.log(error);
})
.on('data', function(message){
//console.log("message from node:"+web3.utils.hexToAscii(message.payload));
cache.put('foo', message.payload);
// listen other node
var node = ioc.connect( "http://localhost:" + 3035 )
node.once( "connect", function () {
    console.log( 'Client2: Connected to port ');
  node.emit( "event", message.payload );
  node.disconnect();
 });
});

app.get('/message', function(req, res) {
  //console.log(cache.get('foo'))
res.send(web3.utils.hexToAscii(cache.get('foo')));
});
app.post('/message',function(req,res){

console.log(req.body);

});
// code for deploy contract
app.post('/deployContract',function(req,res){
// deploy contract
var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      console.log(files.file.path)
    

let source = fs.readFileSync(files.file.path, 'utf8');
//console.dir("file info:"+req)
console.log('compiling contract...');
let compiledContract = solc.compile(source);
console.log('done');

for (let contractName in compiledContract.contracts) {
    // code and ABI that are needed by web3 
   var bytecode = compiledContract.contracts[contractName].bytecode;
    var abi = JSON.parse(compiledContract.contracts[contractName].interface);
}

console.log(JSON.stringify(abi, undefined, 2));
/*
* deploy contract
*/ 

console.log('deploying contract...');
var myContract=new web3.eth.Contract(abi, address, {
    from: address, // default from address
    gasPrice: '20000000000' // default gas price in wei, 20 gwei in this case
})
console.dir("contact options:"+JSON.stringify(myContract.options))
shh.post({
  symKeyID: 'c860cee76bb30cbe5c7925a5e8e9d864799a0e5b1796795062b6a55986e16661',//data,
  topic: '0x99124abc' ,
  payload: web3.utils.toHex(myContract.options),
  ttl: 100,
  priority: 1000,
  powTime: 3,
  powTarget: 0.2,
//  targetPeer:req.params.peerID
}).then(function(err, result){

res.send(myContract.options);
});
})
})


  app.all('/', function (req, res) {
    var __dirname = './public/pages';
    res.sendFile('index.html', { root: __dirname });
  });

// listen client message

io.sockets.on('connection', function(rcvConn){
rcvConn.on('event',function(block){
    if(block){
      // console.log("Received Message:"+ block)
     io.sockets.emit('mined',{status:true,msg:'successfully mined'});
    }
});
  
 });
server.listen(port,function(){
console.log('RESTful API server started on: ' + port);
});



