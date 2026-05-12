/** 
* Layout Component 
* Wraps every page with Navbar, Head meta, and Footer 
*/ 
 
import Head from 'next/head'; 
import Navbar from './Navbar'; 
 
export default function Layout({ 
 children, 
 title = 'ChargeMate – EV Charging Station Finder' 
}) { 
 return ( 
   <> 
     <Head> 
       <title>{title}</title> 
       <meta name="description" content="Find and book EV charging stations across the UK" /> 
       <meta name="viewport" content="width=device-width, initial-scale=1" /> 
       <link rel="icon" href="/favicon.ico" /> 
     </Head> 
 
     <Navbar /> 
 
     <main style={{ minHeight: 'calc(100vh - 160px)' }}> 
       {children} 
     </main> 
 
     <footer className="cm-footer"> 
       <div className="container text-center"> 
         <p className="mb-1"> 
           <i 
             className="bi bi-lightning-charge-fill me-2" 
             style={{ color: '#2ecc71' }} 
           ></i> 
           <strong style={{ color: 'white' }}>ChargeMate</strong> 
         </p> 
         <p className="mb-0 small"> 
           © 2025 ChargeMate · SWE7303 DevOps Module · 
           Cloud-Native EV Charging Platform 
         </p> 
       </div> 
     </footer> 
   </> 
 ); 
} 
