import Modal from "react-modal";
import React, {useEffect, useState} from "react";
import {resetCurrentUser} from "../../../Store/CurrentUser.js";
import {$backBaseUrl} from "../../../Store/config.js"
import {useUnit} from "effector-react";
import "./QRCode.css"

export const QRCode = ({modalIsOpen, closeModal}) => {
    const [QrCode, setQrCode] = useState("");
    const baseUrl = useUnit($backBaseUrl)
    
    useEffect(() => {
        GetQRCode()
    }, []);
    
    const GetQRCode = () =>{
        fetch(`${baseUrl}/generateQR`, {
            method: 'GET',
            credentials: 'include',
            withCredentials: true,

        })
            .then(async response => {
                if (response.status === 401) {
                    resetCurrentUser()
                    return
                }
                return response.text()
            })
            .then(data => {
                setQrCode(data)
            })
            .catch(error => {
                console.error('Ошибка:', error);
            })
    }
    return(
        <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            contentLabel="Input Form"
            style={{
                content: {
                    top: '50%',
                    left: '50%',
                    right: 'auto',
                    bottom: 'auto',
                    marginRight: '-50%',
                    transform: 'translate(-50%, -50%)'
                }
            }}>
            <img className="QrCode" src={QrCode} alt={"pzdNeRabotaet"}/>
        </Modal>
    )
}