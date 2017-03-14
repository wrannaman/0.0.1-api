const Max4Node = require('max4node');
const max      = new Max4Node();
max.bind();
console.log('\ndocs https://docs.cycling74.com/max6/dynamic/c74_docs.html#live_object_model\n');
console.log('notes https://docs.cycling74.com/max7/');
console.log('or https://docs.cycling74.com/max7/vignettes/live_object_model');
let wut;
// wut = 'live_set tracks 1 mixer_device volume';
wut = "live_set scenes 1";


// const dgram = require('dgram');
// const message = Buffer.from('64 100 0');
// const client = dgram.createSocket('udp4');

var osc = require('node-osc');
var oscServer = new osc.Server(7003, '0.0.0.0');
oscServer.on("message", function (msg, rinfo) {
      console.log("TUIO message:");
      console.log(msg);
});

var client = new osc.Client('127.0.0.1', 7005);
// setInterval( () => {
//   console.log('sent');
//   client.send('int',144, function () {
//     //console.log('sent 1 ');
//   });
//   client.send('int',84, function () {
//     //console.log('sent 2 ');
//   });
//   client.send('int',56, function () {
//     //console.log('sent 2 ');
//   });
//   client.send('int', 0, function () {
//     console.log('sent 2 ');
//   });
//   client.send('int',62, function () {
//     console.log('sent 3 \n');
//   });
//   client.send('100',"", function () {
//     console.log('sent');
//   });
//   client.send('0','', function () {
//     console.log('sent');
//   });
//
//   setTimeout(function(){
//     console.log('stopped');
//     client.send('int',128, function () {
//       //console.log('close- sent 1');
//     });
//     client.send('int',84, function () {
//       //console.log('close- sent 2');
//     });
//     client.send('int',64, function () {
//       //console.log('close- sent 2');
//     });
//     // client.send('int',62, function () {
//     //   console.log('close- sent 3 \n');
//     // });
//
//   },500)
// },1000)



// setInterval(() => {
//   //console.log('sending ', '64 100 0');
//   // client.send("list,iii@d", 7002, 'localhost', (err) => {
//   //   if (err) console.log('werror ? ', err);
//   // });
//
// }, 10000)


// const server = dgram.createSocket('udp4');
//
// server.on('error', (err) => {
//   console.log(`server error:\n${err.stack}`);
//   server.close();
// });
//
// server.on('message', (msg, rinfo) => {
//   console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
// });
//
// server.on('listening', () => {
//   var address = server.address();
//   console.log(`server listening ${address.address}:${address.port}`);
// });
//
// server.bind(7003);
// server listening 0.0.0.0:41234


//console.log('dont forget to fucking arm the thing');
// max.set({
//   path: 'live_set tracks 0',
//   property: 'arm',
//   value: true
// });
//
// max.call({
//   path: 'live_set tracks 0 clip_slots 0 clip',
//   method: 'fire'
// });
//
// max.call({
//   path: 'live_set tracks 0 clip_slots 0 clip',
//   method: 'stop'
// });


// max.set({
//   path: wut,
//   property: 'solo',
//   value: true
// });

max.get({
  path: wut,
  property: 'clip_slots'
})
.once('value', function(val) {
  console.log(wut + ' is ' + val);
});



let in_progress = false;

const DrumCtrl = {
  handle: (drum_obj) => {
    console.log('drum obj', drum_obj);
    // console.log('drum 0 : ', drum_obj["0"]);
    // console.log('drum 1 : ', drum_obj["1"]);
    // console.log('drum 2 : ', drum_obj["2"]);
    if (drum_obj["0"] >= .9)
    {
      if ( in_progress ) return;
      in_progress = true;

      console.log('send');
      client.send('int',144, function () {
        //console.log('sent 1 ');
      });
      client.send('int',84, function () {
        //console.log('sent 2 ');
      });
      client.send('int',56, function () {
        //console.log('sent 2 ');
      });

      setTimeout(()=>{
        in_progress = false;
        client.send('int',128, function () {
          //console.log('close- sent 1');
        });
        client.send('int',84, function () {
          //console.log('close- sent 2');
        });
        client.send('int',64, function () {
          //console.log('close- sent 2');
        });
      },200)
      //console.log('firing!\n');
      // max.call({
      //   path: 'live_set tracks 0 clip_slots 0 clip',
      //   method: 'fire'
      // });

      // client.send('int',64, function () {
      //   console.log('sent 1 ');
      // });
      // client.send('int',81, function () {
      //   console.log('sent 2 ');
      // });
      //
      // setTimeout(()=>{
      //   client.send('int',64, function () {
      //     console.log('close- sent 1');
      //   });
      //   client.send('int',0, function () {
      //     console.log('close- sent 2');
      //   });
      //
      // },100)


    }

    if (drum_obj["1"] >= .9)
    {


      //console.log('stopping');
      // max.call({
      //   path: 'live_set tracks 0 clip_slots 0 clip',
      //   method: 'stop'
      // });


    }
  }
}

module.exports = DrumCtrl
