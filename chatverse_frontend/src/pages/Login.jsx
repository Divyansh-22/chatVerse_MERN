import { Input } from "@/components/ui/input"; // Shadcn Input component
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react"; // React hook for managing form state
import { Link, useNavigate } from "react-router-dom";
import { googleAuth, loginUser, validUser } from "@/apis/authentication";
import { gapi } from 'gapi-script';
import { useToast } from "@/hooks/use-toast";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { Spinner } from "@/components/ui/spinner";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Perform the login process here (e.g., API call)
    setIsLoading(true);
    const { data } = await loginUser(formData);
    if (data?.token) {
      localStorage.setItem("userToken", data.token);
      setIsLoading(false);
      toast({ title: "Login Successful" });
      navigate("/chats");
    } else {
      toast({ title: "Invalid Credentials!" });
      setIsLoading(false);
      setFormData({ ...formData, password: "" });
    }
  };
  
  const googleSuccess = async (credentialResponse) => {
    console.log(credentialResponse);
    setIsLoading(true);
    const response = await googleAuth({ tokenId: credentialResponse.credential});
    setIsLoading(false);
    
    console.log(`response is ${response.data}`);
    if(response?.data?.token){
      localStorage.setItem('userToken',response.data.token);
      toast({title:"Logged in successfully!"});
      navigate('/chats');
    } else{
      toast({title:"SOmething went wrong! please try again"});
    }
    
  };
  
  const googleFailure = async (error) => {
    console.log("Some Error occurred",error);
    toast({title: "Something went wrong, please try again!"})
  }

  useEffect(() => {
    const initClient = async () => {
      try {
        await gapi.client.init({
          clientId: import.meta.env.VITE_APP_GOOGLE_CLIENT_ID,
          scope: 'profile email'
        });
        const data = await validUser();  // Call validUser after gapi initialization
        if (data?.user) {
          navigate('/chats');
        }
      } catch (error) {
        console.error('GAPI Init Error:', error);
      }
    };
    gapi.load('client:auth2', initClient);  // Ensure gapi is loaded
  }, [navigate]);
  
  
  return (
    <div className="flex flex-col items-center justify-center bg-gray-900">
      <div className="w-96 p-6 bg-gray-800 rounded-lg border border-gray-700">
        <h1 className="text-3xl font-semibold text-center text-violet-50 mb-6">
          Login
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Input
              name="email"
              type="email"
              placeholder="Enter your Email"
              className="w-full p-3 bg-[#34343400] text-white border border-gray-600 rounded-lg"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <Input
              name="password"
              type="password"
              placeholder="Enter your Password"
              className="w-full p-3 bg-[#34343400] text-white border border-gray-600 rounded-lg"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full p-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition duration-300"
          >
            Login
          </Button>
        </form>
        <p className="text-violet-50 text-center mt-4">
          Don’t have an account?{" "}
          <Link className="text-[rgba(0,195,154,1)] underline" to="/register">
            Sign up
          </Link>
        </p>
        <GoogleOAuthProvider
          clientId={import.meta.env.VITE_APP_GOOGLE_CLIENT_ID}
        >
          <GoogleLogin
            onSuccess={googleSuccess}
            onError={googleFailure}
          />
        
        </GoogleOAuthProvider>
        
        { isLoading? <Spinner/> : ""}
      </div>
    </div>
  );
};

export default Login;
