import React, { useContext, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Carousel, Col, Row, Image, Container, ListGroup, Button, Table } from 'react-bootstrap'
import { AuctionStatus, ApprovalStatus, ScopeReference } from '../components/Utils'
// import { exponent } from '../utils/Constants'
import { Web3Context } from '../App'
import { BsFillPersonVcardFill, BsCoin } from 'react-icons/bs'
import RegisterAuctionModal from '../components/RegisterAuctionModal'
import NotificationAlert from '../components/NotificationAlert'

const Detail = () => {
  const { program } = useContext(Web3Context);
  const { account } = useContext(Web3Context);

  const { address } = useParams()
  const [data, setData] = useState(null)
  const [bids, setBids] = useState(null)
  const [owner, setOwner] = useState(null)
  const [isOwner, setIsOwner] = useState(true)

  const handleEffect = async () => {
    if (program) {
      const data = await program.account.nftData.fetch(address).catch(error => console.log(error));
      setData(data)

      const bids = await data.bids
      setBids(bids)

      const owner = await data.ownerAddress.toString()
      setOwner(owner)

      const isOwner = await (account && account.toString() == owner)
      setIsOwner(isOwner)
    }
  }

  useEffect(() => {
    handleEffect()
  }, [program, bids])

  const renderImages = () => {
    const images = []
    data?.nftImages.forEach(element =>
      images.push(<Carousel.Item>
        <Image thumbnail src={element} style={{ width: '100%', height: '400px' }} />
      </Carousel.Item>))
    return images
  }

  const renderTable = () => {
    const rows = []
    data?.bids.forEach(element =>
      rows.push(
        <tr>
          <td> {element.index} </td>
          <td> <ScopeReference hexString={element.bidder.toString()} type='address' /> </td>
          <td> {element.quantity} SOL </td>
          {/* <td> {element.isWithdrawn ? 'Yes' : 'No'}</td> */}
        </tr>
      ))
    return rows
  }

  const notificationRef = useRef(null)
  const enableShow = (alert) => (notificationRef.current).setShow(alert)

  return (
    <div>
      <Container fluid>
        <NotificationAlert ref={notificationRef} />
        <Row>
          <Col xl={6}>
            <Carousel className='mb-3'>
              {renderImages()}
            </Carousel>

            <div>
              <p className='h5'>Auction Results</p>

              <div className='mb-2 d-flex align-items-center'>
                <BsCoin size={24} className='me-2' />  {data?.startingPrice} SOL
              </div>
              <Table bordered responsive>
                <thead>
                  <tr>
                    <th>Index</th>
                    <th>Bidder</th>
                    <th>Quantity</th>
                    {/* <th>Withdrawn</th> */}
                  </tr>
                </thead>

                {
                  bids?.length == 0 ?
                    <tbody>
                      <tr>
                        <td colSpan={5} className='text-center'> No matching records found </td>
                      </tr>
                    </tbody>
                    :
                    <tbody>
                      {renderTable()}
                    </tbody>
                }
              </Table>
              {!isOwner ? <div className='d-flex float-end'> 
                <RegisterAuctionModal
                  address={address}
                  enableShow={enableShow}
                  bids={bids}
                  startingPrice={data?.startingPrice}
                  setBids={setBids}
                  className='me-3' />
              </div> : <></>}
            </div>
          </Col>
          <Col xl={6}>
            <div className='mb-2'>
              <ScopeReference
                hexString={address}
                className='h4'
                type='address' />

            </div>
            <ApprovalStatus className='mb-2' type={true} />
            <AuctionStatus className='mb-2' type={true} />

            <ListGroup className='mb-3'>
              <ListGroup.Item><b>Owner Full Name: </b>{data?.props.ownerFullName}</ListGroup.Item>
            </ListGroup>
          </Col>
        </Row>
      </Container>
    </div >
  )
}
export default Detail
