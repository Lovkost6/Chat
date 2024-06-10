import Modal from "react-modal";
import React, {useEffect, useState} from "react";
import {resetCurrentUser} from "../../Store/CurrentUser.js";
import useDebounce from '../../Utils/useDebounce.jsx';
import "./CreateChat.css"
import {$backBaseUrl} from "../../Store/config.js"
import {useUnit} from "effector-react";
export const CreateChat = ({modalIsOpen, closeModal}) => {

    const [users, setUsers] = useState([])
    const [search, setSearch] = useState("")
    const debouncedSearchTerm = useDebounce(search, 100);
    const [error, setError] = useState('');
    const baseUrl = useUnit($backBaseUrl)

    useEffect(() => {
        if (debouncedSearchTerm) {
            FindUsers()
        }
    }, [debouncedSearchTerm]);
    const FindUsers = () => {

        fetch(`${baseUrl}/users?filterName=${debouncedSearchTerm}`, {
            method: 'GET',
            credentials: 'include',
            withCredentials: true,

        })
            .then(async response => {
                if (response.status === 401) {
                    resetCurrentUser()
                    return
                }
                return response.json()
            })
            .then(data => {
                setUsers(data)
            })
            .catch(error => {
                console.error('Ошибка:', error);
            })
    }
    const CreateChat = (selectedUserId) => {
        fetch(`${baseUrl}/create-chat`, {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            credentials: 'include',
            withCredentials: true,
            body: JSON.stringify({"friendId":selectedUserId })

        })
            .then(async response => {
                if (response.status === 401) {
                    resetCurrentUser()
                    return
                }
                if (response.status === 400) {
                    setError(await response.text());
                    return
                }
                closeModal()
                return response.json()
            })
            .then(data => {
            })
            .catch(error => {
                console.error('Ошибка:', error);
            })
    }

    return (
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
            <input
                value={search}
                placeholder="Поиск..."
                type="text"
                onChange={e => setSearch(e.target.value)}
            />
            {error && <div className="error">{error}</div>}
            {users.map(x => (
                
                    <div className="userContainer">
                    <div className="findUser">{x.name}</div>
                    <div className="findUser">{x.userName}</div>
                    <button className="addChatButton" onClick={e=> CreateChat(x.id)}>+</button>
                    </div>
                )
            )}
            <button type="button" onClick={closeModal}>Закрыть</button>
        </Modal>
    )
}