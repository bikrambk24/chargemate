/** 
* Next.js App Root 
* Loads Bootstrap CSS and Bootstrap Icons globally 
* Author: Akashdeep (HE38702) 
*/ 
 
import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap-icons/font/bootstrap-icons.css'; 
import '../styles/globals.css'; 
import { useEffect } from 'react'; 
 
export default function App({ Component, pageProps }) { 
 useEffect(() => { 
   // Load Bootstrap JS on client side only 
   require('bootstrap/dist/js/bootstrap.bundle.min.js'); 
 }, []); 
 
 return <Component {...pageProps} />; 
} 
