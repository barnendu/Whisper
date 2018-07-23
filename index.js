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
  ioc =require('socket.io-client'), 
  config = require('nconf');

var configFilePath = path.join(__dirname,  'config-ser.json');
config.argv()
    .env()
    .file({ file: configFilePath });
    // fetch server info from config file.
var hosts = config.get('server:hosts') ;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({credentials: true, origin: true}));
app.set('view engine' , 'ejs');
app.set('views' , path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, 'public')));
var web3 = new Web3();
var shh = web3.shh;
var appName = "Transaction Propagation";
const address = "0xd665708e9c1caa06ebf1e4868a13b1673b9f05cb";

web3.setProvider(new Web3.providers.WebsocketProvider('ws://127.0.0.1:8546')); // create websocket connection
var netObject = {};
web3.eth.net.isListening().then(conn=>{
  if(conn){
    web3.eth.getAccounts((err,account)=>{
    console.log(`account is ${account[0]}`);
    netObject.accounts = account;
    web3.eth.net.getPeerCount(function(error, result){ 
      console.log("No of peer count:"+result)
      netObject.peers = result;
    })
   
    web3.eth.getAccounts(function(err,account){web3.eth.getBalance(account[0]).then(console.log)})
  })
  }
})



// listen client message
function MinedBlock(rcvMessage){
  console.log('compiling contract...');
let compiledContract = solc.compile(rcvMessage.fileInfo);
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
var myContract=new web3.eth.Contract(abi, rcvMessage.account, {
    from: rcvMessage.account, // default from address
    gasPrice: '20000000000' // default gas price in wei, 20 gwei in this case
})
for(var i=0; i< hosts.length; i++){
    var node= ioc.connect(hosts[i]);
    node.once( "connect", function () {
    console.log( `Client${i}: Connected to port `);
    node.emit( "event", web3.utils.toHex(myContract.options));
    node.disconnect();
 });
}

}




io.sockets.on('connection', function(rcvConn){
// received mined block from peers
rcvConn.on('minedBlock', function(rcvMessage){
MinedBlock(rcvMessage)
console.log("received mined Info:"+rcvMessage)

});
// message for successfully received message from peer
 rcvConn.on("event",function(block){
    if(block){
       console.log("Received from peer node Message:"+ web3.utils.toAscii(block))
  for(var i=0; i< hosts.length; i++){
    var node= ioc.connect( hosts[i]);
    node.once( "connect", function () {
    console.log( 'Client2: Connected to port ');
    node.emit( "mined", {status:true,msg:'successfully mined'});
    node.disconnect();
    });
  }
     
    }
});
// propagate message to UI client.
rcvConn.on("mined", function(data){
if(data.status){
console.log('successfully mined');
var node =ioc.connect(config.get('client'));
node.once( "connect", function () {
node.emit("success",{status:true,msg:'successfully mined'});
node.disconnect();
});
}
})
});
server.listen(port,function(){
console.log('RESTful API server started on: ' + port);
});



