# Mothership

The goal is to have all communication point to or read from the Mothership

this hid repo fires socket events TO mothership, clients subscribe to mothership events. 

# Docs
docs https://docs.cycling74.com/max6/dynamic/c74_docs.html#live_object_model
notes https://docs.cycling74.com/max7/
or https://docs.cycling74.com/max7/vignettes/live_object_model

# Checkout scribbletune


## Example Max Calls
`console.log('dont forget to fucking arm the thing');
 max.set({
   path: 'live_set tracks 0',
   property: 'arm',
   value: true
 });
 max.call({
   path: 'live_set tracks 0 clip_slots 0 clip',
   method: 'fire'
 });
 max.call({
   path: 'live_set tracks 0 clip_slots 0 clip',
   method: 'stop'
 });
 max.set({
   path: wut,
   property: 'solo',
   value: true
 });
 max.get({
   path: wut,
   property: 'clip_slots'
 })
 .once('value', function(val) {
   console.log(wut + ' is ' + val);
 });
 `
