import { setCookieBeforeAuth } from '../helpers/authHeader';
import Cookie from 'js-cookie';
const axios = require('axios');

export const authenService = {
    signin,
    signFacebook
}

function signin(authen, password) {
    setCookieBeforeAuth(); 

    return new Promise((resolve, reject) => {
        axios({
          method: 'POST',
          url: `auth/login`,
          data: {
            username: authen,
            password: password
          },
          withCredentials: true,
        })
        .then(res => {
          resolve(res.data);
        })
        .catch(err => {
          reject(err);
        });
    });
}

function signFacebook() {
    setCookieBeforeAuth();
    console.log('service')

    return new Promise((resolve, reject) => {
        axios({
          method: 'GET',
          url: `auth/facebook`
        })
        .then(res => {

          resolve(res.data);
        })
        .catch(err => {
          reject(err);
        });
    });
}