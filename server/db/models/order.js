const Sequelize = require('sequelize')
const db = require('../db')

const Order = db.define('order', {
  submitted: {
    type: Sequelize.BOOLEAN,
    defaulValue: false
  },
  numberOfItems: {
    type: Sequelize.INTEGER
  }
})

module.exports = Order
