const config = require('config')
const Web3Util = require('./web3')
const db = require('../models')

const EventHelper = {
  getRequestEvent: async (networkId, txHash, txIndex) => {
    let result = {}
    try {
      let web3 = await Web3Util.getWeb3(networkId)
      let tx = await web3.eth.getTransactionReceipt(txHash)
      let logs = tx.logs
      for (let i = 0; i < logs.length; i++) {
        let log = logs[i]
        if (log.topics[0] === '0xc210de9a5a98ab6c6b579b8d4b8003cce89c8ec3ff669ff2481d63172e00779b') {
          let data = log.data.replace('0x', '')
          let decoded = web3.eth.abi.decodeParameters([
            {type: "address", name: "token"},
            {type: "bytes", name: "toAddr"},
            {type: "uint256", name: "amount"},
            {type: "uint256", name: "originChainId"},
            {type: "uint256", name: "fromChainId"},
            {type: "uint256", name: "toChainId"},
            {type: "uint256", name: "index"}
          ], log.data)

          let originToken = decoded.token
          let toAddrBytes = decoded.toAddr
          let decodedAddress = web3.eth.abi.decodeParameters(
            [{ type: "string", name: "decodedAddress" }],
            toAddrBytes
          );
          let account = decodedAddress.decodedAddress.toLowerCase()
          let amount = decoded.amount
          let originChainId = parseInt(decoded.originChainId)
          let fromChainId = parseInt(decoded.fromChainId)
          let toChainId = parseInt(decoded.fromChainId)
          let index = parseInt(decoded.index)

          if (index === parseInt(txIndex)) {
            result = {
              requestHash: txHash,
              requestBlock: log.blockNumber,
              account: account,
              originToken: originToken,
              fromChainId: fromChainId,
              originChainId: originChainId,
              toChainId: toChainId,
              amount: amount,
              index: index,
            }
          }
        }
      }
    } catch (e) {
      console.log(e)
    }
    return result
  }
}

module.exports = EventHelper
