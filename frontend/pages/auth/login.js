import { useState } from 'react'; 
import Link from 'next/link'; 
import { useRouter } from 'next/router'; 
import Layout from '../../components/Layout'; 
import { authAPI, saveAuth } from '../../lib/api'; 
 
export default function LoginPage() { 
 const router = useRouter(); 
 const [form, setForm] = useState({ email: '', password: '' }); 
 const [error, setError] = useState(''); 
 const [loading, setLoading] = useState(false); 
 
 const handleChange = (e) => 
   setForm((f) => ({ ...f, [e.target.name]: e.target.value })); 
 
 const handleSubmit = async (e) => { 
   e.preventDefault(); 
   setError(''); 
   setLoading(true); 
   try { 
     const res = await authAPI.login(form); 
     saveAuth(res.data.token, res.data.user); 
     router.push('/stations'); 
   } catch (err) { 
     setError(err.response?.data?.message || 'Login failed. Please try again.'); 
   } finally { 
     setLoading(false); 
   } 
 }; 
 
 return ( 
   <Layout title="Login – ChargeMate"> 
     <div className="container py-5"> 
       <div className="row justify-content-center"> 
         <div className="col-md-5 col-lg-4"> 
           <div className="card cm-card p-4 p-md-5"> 
             {/* Header */} 
             <div className="text-center mb-4"> 
               <i 
                 className="bi bi-lightning-charge-fill mb-2" 
                 style={{ fontSize: '3rem', color: '#2ecc71' }} 
               ></i> 
               <h3 className="fw-bold mb-1">Welcome Back</h3> 
               <p className="text-muted small"> 
                 Sign in to your ChargeMate account 
               </p> 
             </div> 
 
             {/* Error */} 
             {error && ( 
               <div className="alert alert-danger py-2 small"> 
                 <i className="bi bi-exclamation-circle me-2"></i>{error} 
               </div> 
             )} 
 
             {/* Form */} 
             <form onSubmit={handleSubmit}> 
               <div className="mb-3"> 
                 <label className="form-label fw-semibold small"> 
                   Email Address 
                 </label> 
                 <input 
                   type="email" 
                   name="email" 
                   className="form-control" 
                   placeholder="you@example.com" 
                   value={form.email} 
                   onChange={handleChange} 
                   required 
                   autoComplete="email" 
                 /> 
               </div> 
 
               <div className="mb-4"> 
                 <label className="form-label fw-semibold small"> 
                   Password 
                 </label> 
                 <input 
                   type="password" 
                   name="password" 
                   className="form-control" 
                   placeholder="••••••••" 
                   value={form.password} 
                   onChange={handleChange} 
                   required 
                   autoComplete="current-password" 
                 /> 
               </div> 
 
               <button 
                 type="submit" 
                 className="btn btn-cm w-100" 
                 disabled={loading} 
                 style={{ padding: '10px' }} 
               > 
                 {loading ? ( 
                   <> 
                     <span className="spinner-border spinner-border-sm me-2"></span> 
                     Signing in… 
                   </> 
                 ) : ( 
                   <> 
                     <i className="bi bi-box-arrow-in-right me-2"></i> 
                     Sign In 
                   </> 
                 )} 
               </button> 
             </form> 
 
             <hr className="my-4" /> 
             <p className="text-center text-muted small mb-0"> 
               No account yet?{' '} 
               <Link 
                 href="/auth/register" 
                 className="fw-semibold" 
                 style={{ color: '#2ecc71' }} 
               > 
                 Register free 
               </Link> 
             </p> 
           </div> 
         </div> 
       </div> 
     </div> 
   </Layout> 
 ); 
} 
