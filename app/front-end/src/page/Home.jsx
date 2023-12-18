import React, { useState, useEffect, useContext, useRef } from "react";
import { Web3Context } from "../App";
import AllNftCard from '../components/AllNftCard'
import NotificationAlert from '../components/NotificationAlert'
import { Dropdown } from 'react-bootstrap';

export default function Home() {

    const { program } = useContext(Web3Context);

    const [nfts, setNfts] = useState(null);

    useEffect(() => {
        loadNfts();
    }, [program]);

    async function loadNfts() {
        if (program) {
            const nftsData = await program.account.nftData.all().catch(error => console.log(error));
            setNfts(nftsData);
        }
    }

    const notificationRef = useRef(null)

    return (
        <div className="container-fluid">
            <div className="container-fluid p-5 bg-light text-success text-center">
                <h1>NFT Auction Website</h1>
            </div>
            <div className="mt-3 row">
                <NotificationAlert
                    ref={notificationRef}
                />
                {nfts && nfts.map((nft) => (
                    (
                        <AllNftCard data={nft} />
                    )
                ))}
            </div>
        </div>
    );
};
