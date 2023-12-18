import React, { useContext, useState } from 'react'
import { Button, Col, FloatingLabel, Form, InputGroup, Modal, Row } from 'react-bootstrap'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { getStorage, getDownloadURL, uploadBytes, ref } from 'firebase/storage'
import { BsExclamationCircle } from 'react-icons/bs'
import { Web3Context } from '../App'
import * as anchor from '@coral-xyz/anchor'

const { SystemProgram, Keypair } = anchor.web3
let myAccount = Keypair.generate()

const CreateNftModal = () => {
    const [show, setShow] = useState(false)
    const handleClose = () => setShow(false)
    const handleShow = () => {
        setShow(true)
        formik.resetForm()
    }

    const { program } = useContext(Web3Context);
    const { account } = useContext(Web3Context);

    const formik = useFormik({
        initialValues: {
            ownerFullName: 'NFT 1',
            images: null,
            startingPrice: 0.1,
        },

        validationSchema: Yup.object({
            ownerFullName: Yup.string().required('Owner Full Name is required'),
            startingPrice: Yup.number()
                .min(0.1, 'Starting Price must be equal or more than 0.1 SOL')
                .required('Starting Price is required'),
            images: Yup.array().required('Nft Images is required'),
        }),

        onSubmit: values => {
            const handleSubmit = async () => {
                const nftImageFiles = values.images
                const nftImages = []
                const storage = getStorage()

                for (let i = 0; i < nftImageFiles.length; i++) {
                    const file = nftImageFiles[i]
                    const data = await file.arrayBuffer()
                    const metadata = {
                        contentType: 'image/png',
                    }
                    const storageRef = ref(storage, `/images/${file.name}`)
                    await uploadBytes(storageRef, data, metadata)
                    nftImages.push(await getDownloadURL(storageRef))
                }

                if (program) {
                    await program.methods
                        .createNft(
                            {
                                ownerFullName: values.ownerFullName,
                            },
                            values.startingPrice, nftImages
                        )
                        .accounts({
                            nft: myAccount.publicKey,
                            owner: account,
                            systemProgram: SystemProgram.programId
                        })
                        .signers([myAccount])
                        .rpc().catch(error => console.log(error));
                }

                handleClose()
            }
            handleSubmit()
        }
    })

    const handleUpload = async (event) => {
        const files = event.target.files
        if (files == null) return null
        if (files.length < 1) return null

        const uploadedFiles = []
        for (let i = 0; i < files.length; i++) {
            const file = files.item(i)
            try {
                uploadedFiles.push(file)
            } catch (error) {
                console.error('Error uploading image:', error)
            }
        }
        return uploadedFiles
    }
    return (
        <div className='w-100 mb-3'>
            <Button variant='success' className='btn float-end' onClick={handleShow}>
                Create New NFT
            </Button>
            <Modal show={show} onHide={handleClose} dialogClassName="modal-lg">
                <Form onSubmit={formik.handleSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>Create Nft Contract</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div>
                            <p className="h5"> Nft Properties </p>
                            <Row>
                                <Col lg={4}>
                                    <FloatingLabel
                                        label="Owner Full Name"
                                    >
                                        <Form.Control
                                            id="ownerFullName"
                                            placeholder=""
                                            defaultValue={formik.values.ownerFullName}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur} />
                                    </FloatingLabel>
                                    {formik.touched.ownerFullName && formik.errors.ownerFullName ? (
                                        <p className='validation-error'>
                                            <BsExclamationCircle className='me-2' />
                                            <small> {formik.errors.ownerFullName} </small>
                                        </p>
                                    ) : null}
                                </Col>
                            </Row>
                        </div>
                        <div className="mt-4">
                            <p className="h5"> Nft Images </p>
                            <Form.Control
                                id="images"
                                aria-describedby="basic-addon1"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange=
                                {
                                    async (event) => {
                                        const uploadedFiles = await handleUpload(event)
                                        formik.values.images = uploadedFiles
                                    }
                                }
                                onBlur={formik.handleBlur}
                            />
                            {formik.touched.images && formik.errors.images ? (
                                <p className='validation-error'>
                                    <BsExclamationCircle className='me-2' />
                                    <small> {formik.errors.images.toString()} </small>
                                </p>
                            ) : null}
                        </div>
                        <div className="mt-4">
                            <p className="h5"> Starting Price </p>
                            <InputGroup>
                                <Form.Control
                                    id="startingPrice"
                                    aria-describedby="basic-addon1"
                                    type="number"
                                    defaultValue={formik.values.startingPrice}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                <InputGroup.Text id="basic-addon1">SOL</InputGroup.Text>
                            </InputGroup>
                            {formik.touched.startingPrice && formik.errors.startingPrice ? (
                                <p className='validation-error'>
                                    <BsExclamationCircle className='me-2' />
                                    <small> {formik.errors.startingPrice} </small>
                                </p>
                            ) : null}
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-success" onClick={handleClose}>
                            Close
                        </Button>
                        <Button variant="success" type="submit">
                            Submit
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    )
}

export default CreateNftModal