'use strict';

const Server = require('socket.io');
const util = require('util');

class Queue {

  constructor(q) {
    this.events = new Set();
    this.name = q;
    this.q = Queue.io.of(`/${q}`);
    this.q.on('connection', this.connect.bind(this));
  }
  
  monitorEvent(event) { 
    this.events.add(event); 
  }

  clients(room) {
    return Object.keys(this.q.adapter.rooms[room].sockets);
  }

  connect(socket) {
    socket.on('subscribe', (event,cb) => {

      console.log(`new connection: ${socket.id}`)
      if ( this.events.has(event) ) {
        socket.join(event);
        cb && cb(undefined, `Subscribed to ${event} in ${this.name} ... ${socket.id}`);
      }
      else {
        cb && cb(`Invalid Event: ${event} in ${this.name}`);
      }
    });
  }
  
  static publish(message) {
    console.log(`publish was called with : ${message} as a payload`);
    let {queue, event, payload} = message;
    Queue.io.of(queue).to(event).emit('trigger', payload);
  }

  static start() {
    const PORT = process.env.PORT || 3333;
    Queue.io = new Server(PORT);
    Queue.io.on('connection', socket => {
      socket.on('publish', Queue.publish);
    });
    console.log(`Q server up on ${PORT}`);
  }

}

module.exports = Queue;
