const router = require('express').Router();
const c = require('../../controller/homeController.js');
const withAuth = require('../../utils/auth.js');

const propertiesRoutes = require('./propertiesHxRoutes.js');
const issueHxRoutes = require('./issueHxRoutes.js');
const taskHxRoutes = require('./taskHxRoutes.js');

router.get('/', c.renderHome);
// router.get('/', withAuth, c.renderHome);
router.get('/login', c.userLogin);
router.use('/properties', propertiesRoutes);
router.use('/issues', issueHxRoutes);
router.use('/tasks', taskHxRoutes);

module.exports = router;