/* calling RESTAPI's using axios to connect with the server */
import api from '../api'

/* here the  return is actually returning the json responses
sent by the controller to the frontend */

export async function signup(email, password) {
  return api.post('auth/signup', { email, password })
}

export async function loginUser(email, password) {
  /* we are not directly returning here, 
  even though , we are cretaing a variable and returning it , 
  because we dont want to send the access token to the frontend
  instaed , extact it from the RESTAPI and save in the localstorage */

  const data = api.post('auth/login', { email, password })
  if (data.accessToken) {
    localStorage.setItem("token", accessToken)
    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user))
    }
  }
  return data;
}

export async function verifySignupOtp({email,otp}) {
  return api.post('auth/verify-otp',{email,otp})
}