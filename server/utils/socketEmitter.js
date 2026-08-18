let _io = null;

const setIO = (io) => {
    _io = io;
};

const emitToRoom = (room, event, data) => {
    if (_io) {
        _io.to(room).emit(event, data);
    }
};

const broadcastToAll = (event, data) => {
    if (_io) {
        _io.emit(event, data);
    }
};

module.exports = { setIO, emitToRoom, broadcastToAll };
