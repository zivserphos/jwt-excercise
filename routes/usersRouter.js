const router = require("express").Router();

router.post("users/register");
router.post("users/login");
router.post("users/token");
router.post("users/tokenValidate");
router.post("users/logout");

module.exports = router;
