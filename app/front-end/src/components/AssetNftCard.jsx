import React, { useContext, useState } from 'react'
import { Button, Card, Form } from 'react-bootstrap'
import { Web3Context } from "../App";
import { useNavigate } from 'react-router-dom'
import { ScopeReference } from './Utils'
import { ApprovalStatus } from '../components/Utils'

const AssetNftCard = (props) => {

    const { program } = useContext(Web3Context);
    const { account } = useContext(Web3Context);


    const navigate = useNavigate()

    return (
        <>
            {account != null && props.data.account.ownerAddress.toString() == account.toString() ?
                <div className="col-3 mt-3" >
                    <Card className=''>
                        <Card.Img style={{ height: 200 }} variant="top" src={props.data.account.nftImages[0]} />
                        <Card.Body>
                            <Card.Title> <ScopeReference hexString={props.data.publicKey.toString()} type='address' /></Card.Title>
                            <Card.Text>
                                <div>Starting Price: {props.data.account.startingPrice} SOL</div>
                            </Card.Text>
                            <Button onClick={() => navigate(`/detail/${props.data.publicKey.toString()}`)} variant="outline-success" className="float-end"> Detail </Button>
                        </Card.Body>
                    </Card>
                </div>
                : <></>
            }
        </>)
}

export default AssetNftCard