import {useNavigate } from "react-router-dom"

const withAuth = (WrappedComponent ) => {
    const AuthComponent = (props) => {
        const router = useNavigate();

        const isAuthenticated = () => {
            if(localStorage.getItem("token")) {
                return true;
            }
            return false;
        }
    }
}