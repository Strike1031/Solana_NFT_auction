import React, { useState, useEffect, useContext, useRef } from "react";
import { Button, Card, Form } from 'react-bootstrap'
import CreateNftModal from '../components/CreateNftModal'
import { Link } from "react-router-dom";
import { Web3Context } from "../App";
import AssetNftCard from '../components/AssetNftCard'
// import NotificationAlert from '../components/NotificationAlert'

export default function Assets() {

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

    // const notificationRef = useRef(null)
    // const enableShow = (alert) => (notificationRef.current).setShow(alert)

    return (
        <div className="container-fluid">
            <div className="container-fluid p-5 bg-light text-success text-center">
                <h1>My Assets</h1>
            </div>
            <div className="mt-3 row">
                <CreateNftModal />
                {/* <NotificationAlert
                    ref={notificationRef}
                /> */}
                {nfts && nfts.map((nft, index) => (
                    <AssetNftCard data={nft} key={index} />
                ))}
            </div>
        </div>
    );
};
