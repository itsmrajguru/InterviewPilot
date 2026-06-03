
/* creating the axios setup ,so that the data from the frontend can be 
easily sent to the backend with the help of REST API vehicles*/

import axios from 'axios'

/* calling the basic backend url
without any further RESTAPI addeed to it*/

const envUrl = import.meta.env.VITE_API_BASE_URL || "";

/*if the envURI ends with the "/" then remove it , because further RESTAPI's
 like (/auth/signup) already contains the "/"
 otherwise if the base url is not present then use the local backend base url */
const API_URL = envUrl 
  ? (envUrl.endsWith('/') ? envUrl.slice(0,-1) : envUrl)
  : "http://localhost:8000/api/v1";


/*this only confirms that if render forgets to add any extra RESTAPI like /api/v1 
  then add it automatically...*/
const finalApiUrl = (API_URL.includes('onrender.com') && !API_URL.includes('/api/v1'))
  ? `${API_URL}/api/v1`
  : API_URL;


/* creating a custom axios object , that automatically adds base url (http://localhost:8000/api/v1)
before the RESTAPI's like api.post('auth/login') you are hitting 
and withCredentials --> means send the cookie( that contains the refresh token)
with every request being sent to the backend*/
  const api = axios.create({
  baseURL: finalApiUrl,
  withCredentials: true
})

