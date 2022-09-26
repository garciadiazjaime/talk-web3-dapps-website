import Head from 'next/head'
import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

import MetaMaskError from '../components/metamask-error'
import NetworkError from '../components/network-error'
import AccountError from '../components/account-error'
import BalanceError from '../components/balance-error'
import UploadNFT from '../components/upload-nft'

export default function Home() {
  const [error, setError] = useState("")
  const [account, setAccount] = useState("")

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
  }

  const connectWallet = async () => {
    const { ethereum } = window

    const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
    setAccount(accounts[0])
    setError('')
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

  useEffect(() => {
    init()
  }, [])

  useEffect(checkBalance, [account])
  console.log({error})
  return (
    <div className="container">
      <Head>
        <title>Makesicko NFT</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="title">
          Makesicko NFT
        </h1>
        { account && 
          <div>
            <p>Account: {account}</p>
            <UploadNFT />
          </div>
        }

        { error === 'METAMASK' && <MetaMaskError />}

        { error === 'NETWORK' && <NetworkError />}

        { error === 'ACCOUNT' && (
          <div>
            <AccountError />
            <button onClick={connectWallet}>Connect Wallet</button>
          </div>
        )}

        { error === 'BALANCE' && <BalanceError />}


      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        footer img {
          margin-left: 0.5rem;
        }

        footer a {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .title a {
          color: #0070f3;
          text-decoration: none;
        }

        .title a:hover,
        .title a:focus,
        .title a:active {
          text-decoration: underline;
        }

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
        }

        .title,
        .description {
          text-align: center;
        }

        .description {
          line-height: 1.5;
          font-size: 1.5rem;
        }

        code {
          background: #fafafa;
          border-radius: 5px;
          padding: 0.75rem;
          font-size: 1.1rem;
          font-family: Menlo, Monaco, Lucida Console, Liberation Mono,
            DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
        }

        .grid {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;

          max-width: 800px;
          margin-top: 3rem;
        }

        .card {
          margin: 1rem;
          flex-basis: 45%;
          padding: 1.5rem;
          text-align: left;
          color: inherit;
          text-decoration: none;
          border: 1px solid #eaeaea;
          border-radius: 10px;
          transition: color 0.15s ease, border-color 0.15s ease;
        }

        .card:hover,
        .card:focus,
        .card:active {
          color: #0070f3;
          border-color: #0070f3;
        }

        .card h3 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }

        .card p {
          margin: 0;
          font-size: 1.25rem;
          line-height: 1.5;
        }

        .logo {
          height: 1em;
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
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}
