const express = require("express");
const router = express.Router();
const getIndicatorData = require('../data_processers/indicatorData')
const {stackedBar, boxWhisker, pie} = require('../data_processers/livelihood.js')

router.get("/indicator_data", async (req, res) => {
    res.send(await getIndicatorData())
})

router.get("/livelihood/stacked_bar", async (req, res) => {
    res.send(await stackedBar())
})
router.get("/livelihood/box_whisker", async (req, res) => {
    res.send(await boxWhisker())
})
router.get("/livelihood/pie", async (req, res) => {
    res.send(await pie())
})

module.exports = router;