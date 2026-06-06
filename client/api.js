
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
  ? (envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl)
  : "http://localhost:7878/api/v1";


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


/* lets add request and response interceptors
Interceptors --> are nothing but the middle man , that works to check the
access token always 
there are 2 types
a)api.interceptors.request()
b)api.interceptors.response()
*/

/* a) request interceptor--> inserts the access token in the header */
api.interceptors.request.use((config) => {
  //import the access token from localstorage
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config;
})





/* b) response interceptors :auto refresh the access token if expires*/
api.interceptors.response.use(

)
api.interceptors.response.use(
  // Success: unwrap the response data so callers receive the payload directly
  (response) => {
    return response.data
  },

  // Error: attempt a silent token refresh on 401, then retry original request
  async (error) => {
    /*
      originalRequest is the failed call (e.g. GET /jobs).
      We store it so that after getting a new token we can replay it
      seamlessly — the user never sees the failure.
    */
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/token/refresh') {
      originalRequest._retry = true
      try {
        console.log('Token expired — attempting silent refresh...');
        // use raw axios to skip this interceptor loop
        const response = await axios.post(API_URL + '/auth/token/refresh', {}, { withCredentials: true });
        const res = response.data;
        const { newAccessToken } = res;
        localStorage.setItem('token', newAccessToken)
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
        return api(originalRequest)
      }
      catch (e) {
        console.log('Refresh token failed — redirecting to login');
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login';
        return Promise.reject(e);
      }
    }

    // Log all other API errors for debugging
    if (error.response) {
      console.error(`API Error [${error.response.status}]:`, error.response.data);
    }
    return Promise.reject(error);
  }
)
export default api;
