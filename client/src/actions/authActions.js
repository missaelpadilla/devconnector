//Register User
import axios from 'axios';
import { GET_ERRORS,SET_CURRENT_USER } from './types'
import setAuthToken from '../utils/setAuhtToken'
import jwt_decode from 'jwt-decode';

export const registerUser = (userData, history)  => dispatch => {
    axios
    .post('/api/users/register/', userData)
    .then(res => history.push('/login'))
    .catch(err => 
        dispatch({
            type: GET_ERRORS,
            payload: err.response.data
        })
    );
  };


  //Login - Get User Token
  export const loginUser = userData => dispatch => {
      axios.post('/api/users/login', userData)
      .then( res => {
            // save to local storage
            const { token } = res.data;
            //set token to ls
            localStorage.setItem('jwtToken',token);
            //set token to auth header
            setAuthToken(token);
            //Decode token to get user data
            const decoded = jwt_decode(token);
            //set current user
            dispatch(setCurrentUser(decode));    

      })
      .catch(err => 
        dispatch({
        type: GET_ERRORS,
        payload: err.response.data
    }));
  };

  //set logged in user
  export const setCurrentUser = (decoded) => {
return{
    type: SET_CURRENT_USER,
    payload: decoded
}
  }

  