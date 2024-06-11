import {useEffect, useRef, useState} from "react";
import "./Home.css"
import {$currentUser, resetCurrentUser} from "../../Store/CurrentUser.js";
import {routesPath} from "../../router/index.jsx";
import {useNavigate} from "react-router-dom";
import * as signalR from "@microsoft/signalr";
import {useUnit} from "effector-react";
import Modal from 'react-modal';
import {CreateChat} from "../Modal/CreateChat/CreateChat.jsx";
import {$backBaseUrl} from "../../Store/config.js"
import {useLocalStorage} from "../../Utils/useLocalStorage.jsx";
import {QRCode} from "../Modal/QR/QRCode.jsx";
import boopSfx from '../../../public/sounds/new_message.mp3';
import useSound from "use-sound";
import {AudioRecorder} from "../AudioRecorder/AudioRecorder.jsx";
import {CallComponent} from "../Call/CallComponent.jsx";


export const Home = () => {
    const [selectedChat, setSelectedChat] = useLocalStorage("selectedChat", null);
    const [chats, setChats] = useState([])
    const [messages, setMessages] = useState([])
    const [connection, setConnection] = useState()
    const [sendingMessage, setSendingMessage] = useState()
    const [modalCreateIsOpen, setModalCreateIsOpen] = useState(false);
    const [modalQRIsOpen, setModalQRIsOpen] = useState(false);
    const navigate = useNavigate();
    const user = useUnit($currentUser)
    const baseUrl = useUnit($backBaseUrl)
    const messagesEndRef = useRef(null);
    const [play] = useSound(boopSfx);
    const openModalCreate = () => {
        setModalCreateIsOpen(true);
    };
    const openModalQR = () => {
        setModalQRIsOpen(true);
    };

    const closeModalCreate = () => {
        setModalCreateIsOpen(false);
        GetChats()
    };
    const closeModalQR = () => {
        setModalQRIsOpen(false);
    };

    useEffect(() => {
        GetConnection()
        GetChats()
    }, []);

    useEffect(() => {
        ConnectionOn()
    }, [connection]);

    function ConnectionOn() {
        if (connection == null) {
            return
        }
        connection.off("RecieveMessage")
        connection.on("RecieveMessage", function (message) {
            if (message.ownerId !== user.id) {
                play()
            }
            setChats(prev => {
                return prev.map(x => {
                    if (selectedChat === null) {
                        if (x.id === message.chatId) {
                            x.notReadCount += 1
                        }
                        return x
                    }
                    if (selectedChat.id !== message.chatId && x.id === message.chatId) {
                        x.notReadCount += 1
                    }
                    return x
                })
            })
            if (selectedChat == null) {
                return
            }
            if (message.chatId === selectedChat.id) {
                setMessages(prev => [...prev, message]);
            }
        });
    }

    useEffect(() => {
        ConnectionOn()
        if (selectedChat == null) {
            return
        }
        GetMessages()

        setChats(prev => {
            return prev.map(x => {
                if (x.id === selectedChat.id) {
                    x.notReadCount = 0
                }
                return x
            })
        })
    }, [selectedChat]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior: "instant"});
    };
    const SignOut = () => {
        fetch(`${baseUrl}/sign-out`, {
            method: 'GET',
            credentials: 'include',
            withCredentials: true,

        })
        resetCurrentUser()
        navigate(routesPath.Home)

    }
    const SendMessage = async () => {
        if (connection && sendingMessage.trim() !== "") {
            try {
                await connection.invoke("SendMessage", selectedChat.id.toString(), selectedChat.userId.toString(), sendingMessage.toString());
                setSendingMessage("");
            } catch (error) {
                console.error('Ошибка при отправке сообщения:', error);
            }
        }

    }

    const GetConnection = async () => {
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${baseUrl}/chatHub`)
            .build();
        try {
            await newConnection.start();
            setConnection(newConnection);
        } catch (error) {
            console.error('Ошибка при установлении соединения с SignalR:', error);
        }
    }

    const GetMessages = () => {
        fetch(`${baseUrl}/messages/${selectedChat.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
            credentials: 'include',
        })
            .then(response => {
                if (response.status === 401) {
                    resetCurrentUser()
                    return
                }
                return response.json()
            })
            .then(data => {

                setMessages(data.reverse())
            })
            .catch(error => {
                console.error('Ошибка:', error);
            })
    }

    const GetChats = () => {
        fetch(`${baseUrl}/chats`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
            credentials: 'include',
        })
            .then(response => {
                if (response.status === 401) {
                    resetCurrentUser()
                    return
                }
                return response.json()
            })
            .then(data => {
                setChats(data)
            })
            .catch(error => {
                console.error('Ошибка:', error);
            })
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        SendMessage()
    };
    const handleAudioSave = async (audioBlob) => {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'audio.wav');
        
        const response = await fetch(`${baseUrl}/upload`, {
            method: 'POST',
            body: formData,
            withCredentials: true,
            credentials: 'include',
        });
    
        const data = await response.json();
        await connection.invoke("SendMessage", selectedChat.id.toString(), selectedChat.userId.toString(),data.audioUrl);
        console.log(data.audioUrl)
        
    };

    return (
        <div className="home-container">
            <div className="sidebar">
                <div className="header">
                    <h2>Чаты</h2>
                    <button onClick={openModalQR}>QR</button>
                    <QRCode closeModal={closeModalQR} modalIsOpen={modalQRIsOpen}/>

                    <button onClick={openModalCreate}>Создать</button>
                    <CreateChat closeModal={closeModalCreate} modalIsOpen={modalCreateIsOpen}/>
                </div>
                <div className="chats-list">
                    {chats?.map(chat => (
                        <div
                            key={chat.id}
                            className={`chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
                            onClick={() => {
                                setSelectedChat(chat)
                            }}
                        >
                            {chat.userName}&nbsp;
                            <span className="notification">&nbsp;{chat.notReadCount}&nbsp;</span>
                        </div>
                    ))}
                </div>
                <button onClick={e => SignOut()}>Выйти</button>
            </div>
            <div className="chat-window">
                {selectedChat ? (
                    <>
                        <div className="chat-header">
                            <h3>{selectedChat.name}</h3>
                        </div>
                        <div className="chat-messages">
                            {messages?.map(mes => {
                                const isOwnMessage = user.id === mes.ownerId;
                                return (
                                    <div key={mes.id} className={isOwnMessage ? "me" : "friend"}>
                                        <div>{isOwnMessage ? user.name : selectedChat.userName}</div>
                                        {/* Используется userName вместо name для selectedChat */}
                                        {mes.text.includes("https")?
                                        <video controls name="media">
                                        <source src={mes.text} type="audio/wav"/>
                                        </video>:
                                        <div>{mes.text}</div>
                                        }
                                        <div className="createAtMessage">{mes.createAt.substring(0,16)}</div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef}/>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="chat-input">
                                <input value={sendingMessage} onChange={e => {
                                    setSendingMessage(e.target.value)
                                }} type="text"
                                       placeholder="Напишите сообщение..."/>
                                <button type="submit">Отправить</button>
                            </div>
                        </form>
                                <AudioRecorder onSave={handleAudioSave}/>
                                <CallComponent user={user} targetUserId={selectedChat.userId}/>
                    </>
                ) : (
                    <div className="no-chat-selected">
                        <h3>Выберите чат для начала общения</h3>
                    </div>
                )}
            </div>
        </div>
    );

}