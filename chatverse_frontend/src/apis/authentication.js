import { toast } from "@/hooks/use-toast";
import axios from "axios";

const server_url = import.meta.env.VITE_APP_SERVER_URL;
const URL = `${server_url}/api/v1/auth`;
const API = (token) => 
    axios.create({
        baseURL: URL,
        headers: {Authorization: `Bearer ${token}`},
    });

const registerUser = async (formdata) => {
    try{
        return await axios.post(`${URL}/register`,formdata);
    } catch(error){
        console.error(error);
    }
};
const loginUser = async (formdata) => {
    try{
        return await axios.post(`${URL}/login`,formdata);
    } catch(error){
        console.error(error);
    }
};
const googleAuth = async (formdata) => {
    try{
        return await axios.post(`${URL}/google`,formdata);
    } catch(error){
        console.error(error);
    }
};

const validUser = async () => {
    try{
        const token = localStorage.getItem('userToken');
        if(!token) return {};
        const { data } = await API(token).get('/valid');
        return data;
    }catch(error){
        console.error(error);
    }
};
const searchUser = async (id) => {
    try{
        const token = localStorage.getItem('userToken');
        return await API(token).get(`/user?search=${id}`);
    }catch(error){
        console.error(error);
    }
};

const updateUser = async (id,formdata) => {
    try{
        const token = localStorage.getItem('userToken');
        const { data } = await API(token).patch(`/user/${id}`,formdata);
        return data;
    }catch(error){
        console.error(error);
        toast.error('Something went wrong, try again!')
    }
    
};

const checkValid = async (navigate) => {
    const data = await validUser();
    if(!data?.user){
        navigate('/login');
    } else{
        navigate('/chats');
    }
}

export {
    registerUser,
    loginUser,
    googleAuth,
    validUser,
    searchUser,
    updateUser,
    checkValid
};

