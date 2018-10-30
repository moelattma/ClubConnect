const router = require('express').Router();
const controller = require('./controller');
const passport = require('passport');


router.get('/:organizationId/expenses', (req, res) => {
	controller.grabExpenses(req, res);
});

module.exports = router;