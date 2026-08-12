import axios, { HttpStatusCode } from "axios";
import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";



export const AuthContext = createContext({});

const client = axios.create({
    baseURL: "http://localhost:8000/api/v1"
})

export const AuthProvider = ({children}) => {

    const authContext = useContext(AuthContext);

    const [userData, setUserData] = useState(null);

    const router = useNavigate();

    const handleRegister = async (name, username, password) => {
        try {
            let request = await client.post("/register", {
                name: name,
                username: username,
                password: password
            })

            if (request.status == HttpStatusCode.Created) {
                return request.data.message;
            }
        } catch (err) {
            throw err;
        }
    }

    const handleLogin = async (username, password) => {
        try {
            let request = await client.post("/login", {
                username: username,
                password: password
        });

        if(request.status === HttpStatusCode.OK) {
            localStorage.setItem("token", request.data.token);
            router("/home");
        }
     } catch (err) {
        throw err;
     }
    }

    const getHistoryOfUser = async () => {
        try {
            let request = await client.get("/users/get_all_activity", {
                params: {
                    token: localStorage.getItem("token")
                }
            });
            return request.data
        } catch (err) {
            throw err;
        }

    };

    const data  = {
        userData, setUserData, handleRegister, handleLogin, getHistoryOfUser
    };

    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    )
}


