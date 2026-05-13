function sendSuccess(res, data = {}, message = 'Operación exitosa', status = 200) {
  return res.status(status).json({ success: true, message, data });
}

function sendError(res, status = 500, message = 'Error interno') {
  return res.status(status).json({ success: false, message });
}

function sendPaginated(res, data, total, page, limit) {
  return res.status(200).json({
    success: true,
    data,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  });
}

module.exports = { sendSuccess, sendError, sendPaginated };
