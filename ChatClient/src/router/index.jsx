import {createBrowserRouter, Navigate, Outlet} from "react-router-dom";
import { App } from "../App.jsx";
import {SignIn} from "../Components/SignIn/SignIn.jsx";
import {Home} from "../Components/Home/Home.jsx";
import {$currentUser} from "../Store/CurrentUser.js";
import {useUnit} from "effector-react";
import {SignUp} from "../Components/SignUp/SignUp.jsx";

export const routesPath = {
    Home: '/',
    SignIn: '/sign-in',
    SignUp: '/sign-up',
    SignOut: '/sign-out',
}
function UserRoutes() {
    const  user = useUnit($currentUser);

    return (
        user ? <Outlet /> : <Navigate to={routesPath.SignIn} />
    )
}

export const router = createBrowserRouter([
    {
        path: routesPath.Home,
        element: <App />,
        children: [
            {
                element: <UserRoutes/>,
                children:[
                    {path: routesPath.Home, element: <Home/>}
                ]
            },
            { path: routesPath.SignUp, element: <SignUp/> },
            { path: routesPath.SignIn, element: <SignIn/> },
        ],
        errorElement: <ErrorPage />
    },
])

function ErrorPage() { return (<Navigate to={routesPath.Home} />) }