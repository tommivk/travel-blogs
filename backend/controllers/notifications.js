const notificationsRouter = require('express').Router()
const Notification = require('../models/notification')

notificationsRouter.get('/', async (req, res) => {
  const notifications = await Notification.find({})
  res.json(notifications)
})

notificationsRouter.get('/user/:id', async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      receivers: { $in: req.params.id },
    })
    console.log(notifications)
    res.send(notifications)
  } catch (error) {
    next(error)
  }
})

module.exports = notificationsRouter
