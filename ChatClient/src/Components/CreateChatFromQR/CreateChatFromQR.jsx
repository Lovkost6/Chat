import {Navigate, redirect, useNavigate, useParams} from "react-router-dom";
import {resetCurrentUser} from "../../Store/CurrentUser.js";
import {useEffect, useState} from "react";
import {router, routesPath} from "../../router/index.jsx";
import {useUnit} from "effector-react";
import {$backBaseUrl} from "../../Store/config.js";
import "./CreateChatFromQR.css"

export const CreateChatFromQR =()=>{
    const { id } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const baseUrl = useUnit($backBaseUrl)

    useEffect(() => {
        CreateChat()
    }, []);
    
    const CreateChat = () => {
        fetch(`${baseUrl}/create-chat`, {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            credentials: 'include',
            withCredentials: true,
            body: JSON.stringify({"friendId":id })

        })
            .then(async response => {
                if (response.status === 401) {
                    resetCurrentUser()
                    return
                }
                if (response.status === 400) {
                    navigate(routesPath.Home)
                    return
                }
                navigate(routesPath.Home)
                return response.json()
            })
            .then(data => {
            })
            .catch(error => {
                console.error('Ошибка:', error);
            })
        }
    return(
        <div className="Qrcreate">{error}</div>
    )
}