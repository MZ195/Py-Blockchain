const express = require("express")
const router = express.Router()
const bitcoin = require("../../Network")

// creates a new transaction and adds it to the pending transactions
router.post('/', function (req, res) {
    const newTransaction = req.body
    let blockIndex = bitcoin.addTransactionToPendingTransactions(newTransaction)

    res.json({
        note: `New transaction will be added to block #${blockIndex}`
    })
})

// creates new transaction AND will broadcast that transaction to all nodes
router.post('/broadcast', function(req, res) {
    // console.log(req)
    let amount = req.body.amount
    let sender = req.body.sender
    let recipient = req.body.recipient

    const newTransaction = bitcoin.createNewTransaction(amount, sender, recipient)
    bitcoin.addTransactionToPendingTransactions(newTransaction)

    const requestPromises = []
    bitcoin.networkNodes.forEach(networkNodeURL => {
        const requestOptions = {
            uri: networkNodeURL + '/transaction',
            method: 'POST',
            body: newTransaction,
            json: true
        } 

        requestPromises.push(rp(requestOptions))
    })

    Promise.all(requestPromises)
    .then(data => {
        res.json({
            note: 'Transaction created and broadcast successfully.'
        })
    })
})

module.exports = router