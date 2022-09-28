import Head from 'next/head'
import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { LazyLoadImage } from 'react-lazy-load-image-component';

import MetaMaskError from '../components/metamask-error'
import NetworkError from '../components/network-error'
import AccountError from '../components/account-error'
import BalanceError from '../components/balance-error'
import UploadNFT from '../components/upload-nft'

import { getNFTs, setListener, CONTRACT_ADDRESS } from '../utils/contract'


export default function Home() {
  const [error, setError] = useState("")
  const [account, setAccount] = useState("")
  const [nfts, setNFTS] = useState([])

  const init = async () => {
    const { ethereum } = window

    if (!ethereum) {
      setError('METAMASK')
      return
    }

    const network = await ethereum.request({ method: 'eth_chainId' })
    const rinkebyId = '0x5'
    if (network !== rinkebyId) {
      setError('NETWORK')
      return
    }

    const accounts = await ethereum.request({ method: 'eth_accounts'})
    if (accounts.length === 0) {
      setError('ACCOUNT')
      return
    }
    setAccount(accounts[0])
    initListener()
  }

  const connectWallet = async () => {
    const { ethereum } = window

    const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
    setAccount(accounts[0])
    setError('')

    const nfts = await getNFTs()    
    setNFTS(nfts)
  }

  const checkBalance = async () => {
    if (!account) {
      return
    }

    const { ethereum } = window

    const balance = await ethereum.request({ 
      method: 'eth_getBalance',
      params: [account, 'latest']
    })
    if (ethers.utils.formatEther(balance) <= 0) {
      setError('BALANCE')
      return
    }
  }

  const uploadNFTs = async () => {
    const nfts = await getNFTs()
    
    setNFTS(nfts)
  }

  const initListener = async () => {
    setListener(async (from, tokenUri) => {
      console.log('NewMakesickoNFTMInted', from, tokenUri.toString())
      await uploadNFTs()
    })

    const nfts = await getNFTs()
    setNFTS(nfts)
  }

  useEffect(() => {
    init()
  }, [])

  useEffect(checkBalance, [account])
  console.log({error, nfts})
  return (
    <div>
      <Head>
        <title>iJS 2022 Demo</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <header>
        <h1 className='container'>iJS 2022 Demo</h1>
      </header>

      <main className='container'>
        
        { account && 
          <div>
            <p className='meta'>
              Contract: {CONTRACT_ADDRESS}
            </p>
            <p className='meta'>
              Account: {account}  
            </p>
            <UploadNFT />
          </div>
        }

        { error === 'METAMASK' && <MetaMaskError />}

        { error === 'NETWORK' && <NetworkError />}

        { error === 'ACCOUNT' && (
          <div>
            <AccountError />
            <br />
            <a href='#' className='button' onClick={connectWallet}>Connect Your Wallet</a>
          </div>
        )}

        { error === 'BALANCE' && <BalanceError />}
        
        {
          !!nfts.length && nfts.reverse().map((nft, index) => (
            <div key={index} className="post">
              <p>
              <LazyLoadImage
                src={nft.image}
              />
              </p>
              <p>{nft.description}</p>
              <p>{nft.name}</p>
            </div>)
          )
        }

      </main>

      <style jsx>{`
        .container {
          max-width: 1080px;
          margin: 0 auto;
        }

        header {
          background: #012a33;
          color: white;
          padding: 24px 0;
        }

        h1 {
          margin: 0;
          padding: 0;
        }

        main {
          padding: 24px 0; 
        }

        .post {
          margin: 0 0 120px 0;
        }

        p {
          word-break: break-word;
        }

        .meta {
          overflow: scroll;
        }

        @media (max-width: 600px) {
          .grid {
            width: 100%;
            flex-direction: column;
          }
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: monospace;
          font-size: 1.5em;
          background: #fdfdfd;
          color: #012a33;
        }

        input {
          font-size: 1em;
          width: 100%;
        }

        img {
          border-radius: 3px;
          max-height: 640px;
          max-width: 100%;
        }

        .button {
          text-decoration: none;
          color: #012a33;
          border: 2px solid #012a33;
          padding: 12px 24px;
          display: inline-block;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}
