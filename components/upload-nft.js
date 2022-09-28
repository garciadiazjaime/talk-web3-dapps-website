import { useRef, useState } from 'react'
import ReactLoading from 'react-loading';

import { mintNFT } from '../utils/contract'


async function getNFTBase64(url) {
    const lambdaURL = `/.netlify/functions/get-nft-base64?url=${encodeURIComponent(url)}`
    const response = await fetch(lambdaURL)
    const nftBase64 = await response.text()
    console.log(`data:application/json;base64,${nftBase64}`)

    return nftBase64
}

export default function UploadNFT() {
    const inputRef = useRef(null)
    const [ loading, setLoading ] = useState(false)
    const mintHandler = async (event) => {
        const url = inputRef.current.value
        if (!url) {
            return
        }

        event.preventDefault()
        setLoading(true)
        
        try {
            const nftBase64 = await getNFTBase64(url)
            await mintNFT(nftBase64)
        } catch(error) {
            console.log(error)
        }

        setLoading(false)
    }

    return (
        <form>
            <div>
                <p>
                    Instagram Post or Tweet URL:
                </p>
                <p>
                    <input type="text" ref={inputRef} />
                </p>
                <p>
                    <a href='#' className='button' onClick={mintHandler}>Mint</a>
                </p>
                {loading && <ReactLoading color="#012a33" />}
            </div>
        </form>
    )
}
