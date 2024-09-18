import { registerUser, validUser } from "@/apis/authentication";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react"; // React hook for managing form state
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { gapi } from "gapi-script";
import { Spinner } from "@/components/ui/spinner";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
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
    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Passwords do not match" });
      return;
    }
    // Perform the registration process here
    setIsLoading(true);
    const { data } = await registerUser(formData);
    if (data?.token) {
      localStorage.setItem("userToken", data.token);
      setIsLoading(false);
      toast({ title: "Registered Successfully" });
      navigate("/login");
    } else {
      setIsLoading(false);
      toast({ title: "Invalid Credentials!" });
    }
    console.log(formData);
  };

  const googleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    const response = await validUser({
      tokenId: credentialResponse.credential,
    });
    setIsLoading(false);

    if (response?.data?.success) {
      localStorage.setItem("userToken", response.data.token);
      toast({ title: "Registered Successfully!" });
      navigate("/chats");
    } else {
      toast({ title: "Something went wrong, please try again!" });
    }
  };

  const googleFailure = (error) => {
    console.log("Error : ", error);
    toast({ title: "Something went wrong, please try again!" });
  };

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
          Register
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Input
              name="fullName"
              type="text"
              placeholder="Enter your full name"
              className="w-full p-3 bg-[#34343400] text-white border border-gray-600 rounded-lg"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>
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
          <div className="mb-4">
            <Input
              name="confirmPassword"
              type="password"
              placeholder="Confirm your Password"
              className="w-full p-3 bg-[#34343400] text-white border border-gray-600 rounded-lg"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full p-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition duration-300"
          >
            Register
          </Button>
        </form>
        <p className="text-violet-50 text-center mt-4">
          Already have an account?{" "}
          <Link className="text-[rgba(0,195,154,1)] underline" to="/login">
            Sign in
          </Link>
        </p>
        <GoogleOAuthProvider
          clientId={import.meta.env.VITE_APP_GOOGLE_CLIENT_ID}
        >
          <GoogleLogin onSuccess={googleSuccess} onError={googleFailure} />
        </GoogleOAuthProvider>

        {isLoading? <Spinner/>: ""}
      </div>
    </div>
  );
};

export default Register;
