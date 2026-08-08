import axios from 'axios';

const API = axios.create({
  baseURL: 'https://hr-nexus-mocha.vercel.app/api',
});

export default API;