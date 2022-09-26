import { useRef } from 'react'

export default function UploadNFT() {
    const inputRef = useRef(null)
    const mintHandler = async (event) => {
        console.log(event)
        event.preventDefault()
        console.log(inputRef.current.value)
        const response = await fetch(inputRef.current.value)
        console.log(response)
    }

    return (
        <form>
            <div>
                <span>Image</span>
                <input type="text" ref={inputRef} />
                <button onClick={mintHandler}>Mint</button>
            </div>
        </form>
    )
}
