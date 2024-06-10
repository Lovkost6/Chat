import React, { useState } from 'react';
import './SignUp.css';
import {Link, useNavigate} from "react-router-dom";
import {routesPath} from "../../router/index.jsx";
import {$backBaseUrl} from "../../Store/config.js"
import {useUnit} from "effector-react";

export const SignUp = ({ onSignUp }) => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const baseUrl = useUnit($backBaseUrl)

    const handleSubmit = (event) => {
        event.preventDefault();
        if (name === '' || username === '' || password === '') {
            setError('Пожалуйста, заполните все поля');
            return;
        }
        fetch(`${baseUrl}/sign-up`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
            credentials: 'include',
            body: JSON.stringify({ "Name": name,"UserName":username, "Password":password }),
        })
            .then(response => {
                if (response.status === 400){
                    setError("Такой логин уже существует")
                    return
                }
                return  response.json()
            })
            .then(data => {
                console.log(data)
                if (data.id) {
                    navigate(routesPath.SignIn);
                } else {
                    setError('Ошибка');
                }
            })
            .catch(error => {
                console.error('Ошибка:', error);
                setError('Произошла ошибка при регистрации');
            });
    };

    return (
        <div className="signup-container">
            <div className="signup-box">
                <div className="signup-header">РЕГИСТРАЦИЯ</div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Имя"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Имя пользователя"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    {error && <div className="error">{error}</div>}
                    <div className="signup-footer">
                        <Link to={
                            routesPath.SignIn
                        } className="signin-link">Войти</Link>
                        <button type="submit" className="signup-button">ЗАРЕГИСТРИРОВАТЬСЯ</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

