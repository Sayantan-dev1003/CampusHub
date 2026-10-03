function sendData(res, data, message = 'OK', status = 200) {
  res.status(status).json({ success: true, message, data });
}

function sendList(res, data, meta, message = 'OK') {
  res.status(200).json({ success: true, message, data, meta });
}

module.exports = { sendData, sendList };
