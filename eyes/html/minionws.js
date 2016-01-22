var Minion = Minion || {};
/**
 * Connect to websocket that pushes deltas from graphite. Topics is a list
 * of deltas to subscribe to ({expression: <graphite expr>, topic: <topic name for push>})
 * The server responds with topics naemd {"topic": <name> } for each increment.
 (ok, rephrase this)
 */

Minion.WebSocketStream = function(url, callbacks) {
  this.socketUrl = url;
  this.callbacks = callbacks;
  this.reconnect(this);
};

Minion.WebSocketStream.prototype.reconnect = function(self) {
  console.debug('Reconnecting to ' + self.socketUrl);
  try {
    self.connection = new WebSocket(self.socketUrl);
  } catch (e) {
    setTimeout(self.reconnect, 5000, self);
    return;
  }
  self.connection.onopen = function() {
    if (self.callbacks.onConnect) {
      self.callbacks.onConnect(self.connection);
    }
  };
  self.connection.onclose = function() {
    if (self.callbacks.onClose) {
      self.callbacks.onClose();
    }
    setTimeout(self.reconnect, 5000, self);
  };

  self.connection.onerror = function(err) {
    console.debug('Web socket error: ' + err);
    if (self.callbacks.onError) {
      self.callbacks.onError();
    }
  };

  self.connection.onmessage = function(e) {
    var notification = JSON.parse(e.data);
    if (self.callbacks.onMessage) {
      self.callbacks.onMessage(notification);
    }
  };
};