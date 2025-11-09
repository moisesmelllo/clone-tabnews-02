function status(request, response) {
  response.status(200).json({
    statusCode: response.statusCode,
    url: response.req.url,
    version: response.req.httpVersion,
  });
}

export default status;
