import React, { useState } from 'react';
import {Link, useNavigate} from "react-router-dom";
import {router, routesPath} from "../../router/index.jsx";
import "./SignIn.css"
import {setCurrentUser} from "../../Store/CurrentUser.js";

export const SignIn = () => {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const handleSubmit = (event) => {
        event.preventDefault();
        if (login === '' || password === '') {
            setError('Пожалуйста, заполните все поля');
            return;
        }

        fetch('https://localhost:7275/sign-in', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
            credentials: 'include',
            body: JSON.stringify({ "UserName":login, "Password":password }),
        })
            .then(response => response.json())
            .then(data => {
                
                if (data.id) {
                    setCurrentUser(data)
                    navigate(routesPath.Home);
                } else {
                    setError('Неверный логин или пароль');
                }
            })
            .catch(error => {
                console.error('Ошибка:', error);
                setError('Произошла ошибка при входе');
            });
    };

    return (
        <div className="signin-container">
            <div className="signin-header">АВТОРИЗАЦИЯ НА САЙТЕ</div>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="Логин"
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
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
                <div className="signin-footer">
                    <Link to={
                        routesPath.SignUp
                    } className="signup-link">Зарегистрироваться</Link>
                    <button type="submit" className="signin-button">ВОЙТИ</button>
                </div>
            </form>
        </div>
    );
};

