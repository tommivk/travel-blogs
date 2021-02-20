const citiesRouter = require('express').Router();
const axios = require('axios');

citiesRouter.post('/', async (req, res, next) => {
  try {
    const { body } = req;

    let response;

    const URL = 'http://geodb-free-service.wirefreethought.com';

    if (body.filter !== undefined) {
      response = await axios
        .get(`${URL}${'/v1/geo/cities?limit=5&offset=0&namePrefix='}${body.filter}`);

      return res.status(200).json(response.data);
    }

    if (body.href !== undefined) {
      response = await axios.get(`${URL}${body.href}`);

      return res.status(200).json(response.data);
    }

    return res.status(400).send();
  } catch (error) {
    return next(error);
  }
});

module.exports = citiesRouter;
