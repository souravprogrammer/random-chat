function socketWrapper(io, socket, callback) {
  return (data) => {
    callback(data);
  };
}

export default socketWrapper;
