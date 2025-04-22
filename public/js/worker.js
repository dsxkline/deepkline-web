
self.addEventListener('message', function(e) {
    console.log("In worker (public): received data: "+ e.data)
    let message = 'In worker (public): The sum of 1 to ' + e.data + ' is '
    console.log(message)
    self.postMessage(message)
  }, false);