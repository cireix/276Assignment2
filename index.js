const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
const uri = "mongodb+srv://admin:P@55w0rd@cluster0-mu65a.mongodb.net/Asn2?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });
const bodyParser = require("body-parser")

var app = express();
  app.use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
app.use(bodyParser.urlencoded({extended: false}))

function handleData(res,data){
    //Send back to client
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data))
}
function query(collection,config,callback){
  collection.find(config).toArray(function(err,data){
      callback(err, data);
  });
}
// Must be in promise to take in account the load time or null will be returned
function queryWrap(res,collection,config){
    var promise = () =>{
        return new Promise((resolve,reject)=>{
            query(collection,config,function(err, data){
                err ? reject(err) : resolve(data);
            })
        })
    }
    var callPromise = async() =>{
        var result = await(promise());
        return result;
    }
    callPromise().then(function(result){
        handleData(res, result);
    });
}

app.get("/getAll", (req, res) => {
  var req = req.query;
  try{
      client.connect((err,db) => {
          if (err){
              console.log(err);
          }else{
              const dbCol = client.db("Asn2").collection("Person");
              queryWrap(res,dbCol,{});
          }
      },function(err){
          db.close();
      });
  }catch (err){
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({"status":"error","code":"-1","msg":"An error has occured"}));
  }
});

app.post("/add",(req,res)=>{
  var req = req.body;
  try{
    console.log(req);
    client.connect((err,db) => {
      if (err) {
        console.log(err);
      }else{
        const dbCol = client.db("Asn2").collection("Person");
        dbCol.insertOne(req,function(err,res2){
          if (err) throw err;
          console.log("Inserted ",req);
        })
      }
    },function(err){
      db.close();
    })
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({"status":"success","code":1,"msg":"Inserted document"}));
  } catch (err){
    console.log(err);
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({"status":"error","code":"-1","msg":"An error has occured"}));
  }
})

app.post("/remove",(req,res)=>{
  var req = req.body;
  try{
    const id = req.id;
    client.connect((err,db) => {
      if (err) {
        console.log(err);
      }else{
        const dbCol = client.db("Asn2").collection("Person");
        dbCol.deleteOne({"_id":new mongodb.ObjectID(id)},function(err,res2){
          if (err) throw err;
          console.log("Removed ",id);
        })
      }
    },function(err){
      db.close();
    })
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({"status":"success","code":1,"msg":"Removed document"}));
  } catch (err){
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({"status":"error","code":"-1","msg":"An error has occured"}));
  }
})

app.post("/edit",(req,res)=>{
  var req = req.body;
  console.log(req);
  try{
    const id = req.id;
    delete req["_id"];
    const fields = req;
    console.log(fields);
    client.connect((err,db) => {
      if (err) {
        console.log(err);
      }else{
        const dbCol = client.db("Asn2").collection("Person");
        dbCol.updateOne({"_id":new mongodb.ObjectID(id)},{$set:fields},function(err,res2){
          if (err) throw err;
          console.log("Updated ",id);
        })
      }
    },function(err){
      db.close();
    })
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({"status":"success","code":1,"msg":"Updated document"}));
  } catch (err){
    console.log(err);
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({"status":"error","code":"-1","msg":"An error has occured"}));
  }
})