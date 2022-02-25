const config = require('config')
const queueHelper = require('../helpers/queue')
const generalHelper = require('../helpers/general')
const db = require('../models')
const logger = require("../helpers/logger");
const { DeployUtil } = require("casper-js-sdk");

async function main() {
    let consumers = config.rabbitmq.consumers
    while (true) {
        let tx = await db.RequestToCasper.find({ isProcessed: false }).sort({ timestamp: 1 }).limit(1)
        if (tx && tx.length > 0) {
            tx = tx[0]
            logger.info('sending %s to sign', tx.deployHash)
            if (tx) {
                for (let i = 0; i < consumers.length; i++) {
                    let consumer = consumers[i]
                    await queueHelper.newQueue(`${consumer}-signer`,
                        {
                            requestHash: tx.requestHash,
                            index: tx.index,
                            deployHash: tx.deployHash,
                            deployHashToSign: tx.deployHashToSign,
                            toWallet: tx.toWallet,
                            fromChainId: tx.fromChainId,
                            toChainId: tx.toChainId,
                            originChainId: tx.originChainId,
                            originToken: tx.originToken.toLowerCase(),
                            destinationContractHash: tx.destinationContractHash,
                            timestamp: tx.timestamp,
                            deployJsonString: tx.depoyJsonString,
                            amount: tx.amount
                        }
                    )
                }
                tx.isProcessed = true
                await tx.save()
            }
        }
        console.log('sleep 10 seconds before continue')
        await generalHelper.sleep(10000)
    }
}

main()