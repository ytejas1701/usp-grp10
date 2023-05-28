import { Fragment, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './FirstFactor.module.css';
import app from '../../firebase';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import FormMessage from './FormMessage';
import validator from 'validator';
import RegistrationDialog from './RegistrationDialog';

const Register = ()=>{
    const [isLoading, setLoading] = useState(false);
    const [hasRegistered, setRegistered] = useState(false);

    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const fullNameRef = useRef(null);
    const phoneRef = useRef(null);
    const [passkey, setPasskey] = useState(null);
    const [secret, setSecret] = useState(null);

    const [emailMessage, setEmailMessage] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');
    const [fullNameMessage, setFullNameMessage] = useState('');
    const [phoneMessage, setPhoneMessage] = useState('');

    const validateForm = ()=>{
        const email = emailRef.current.value;
        const password = passwordRef.current.value;
        const fullName = fullNameRef.current.value;
        const phone = phoneRef.current.value;

        var result = true;

        if(!email){ setEmailMessage('Please enter an email id.'); result=false;}
        else if(!validator.isEmail(email)){ setEmailMessage('Please enter a valid email id.'); result=false;}
        else setEmailMessage('');

        if(!password){ setPasswordMessage('Please create a password'); result=false;}
        else if(password.length<6){ setPasswordMessage('Passwords must be at least 6 characters long.'); result = false;}
        else setPasswordMessage('');

        if(!fullName){ setFullNameMessage('Please enter your name.'); result = false;}
        else setFullNameMessage('');

        if(!phone){ setPhoneMessage('Please enter your mobile number.'); result = false;}
        else if(!validator.isMobilePhone(phone, 'en-IN')){ setPhoneMessage('Please enter a valid phone number.'); result=false;}
        else setPhoneMessage('');

        return result;
    }

    const submitHandler = async (event)=>{
        event.preventDefault();
        if(validateForm()){
            try {
                setLoading(true);
                const email = emailRef.current.value;
                const password = passwordRef.current.value;
                const fullName = fullNameRef.current.value;
                const phone = phoneRef.current.value;

                const auth = getAuth(app);
                const db = getDatabase(app);

                const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
                const randomNumber = Math.floor(1000 + Math.random() * 9000);
                setPasskey(randomNumber);
                const response = await fetch("https://usp-grp10.herokuapp.com/totp/secret",{
                    method:"POST",
                });
                if(!response.ok) throw new Error();
                const responseObject = await response.json();   
                setSecret({...responseObject, otpauth_url:responseObject.otpauth_url.replace("SecretKey", fullName.replace(" ", ""))})
                await set(ref(db, `users/${userCredentials.user.uid}`),{
                    fullName,
                    phone,
                    email,
                    secretBase32:responseObject.base32,
                    passkey:randomNumber,
                    dataOTP:{ isDone:false },
                    dataTOTP:{ isDone:false },
                    dataPasskey:{ isDone:false },
                });
                setRegistered(true);
            } catch (error) {
                setLoading(false);
                console.log(error.message);
            }
        }
    }
    const navigate = useNavigate();
    const [hidePassword, setHidePassword] = useState(true);
    return (
        <Fragment>
            {hasRegistered
            ?<RegistrationDialog passkey={passkey} secret={secret}/>
            :<form className={styles.auth}>
                <div className={styles.inputField}>
                    <svg 
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 16 16">
                        <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                    </svg>
                    <input
                        ref={fullNameRef} 
                        placeholder='Full Name'/>
                    {fullNameMessage&&<FormMessage message={fullNameMessage}/>}
                </div>
                <div className={`${styles.inputField}`}>
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 16 16">
                        <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414.05 3.555ZM0 4.697v7.104l5.803-3.558L0 4.697ZM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586l-1.239-.757Zm3.436-.586L16 11.801V4.697l-5.803 3.546Z"/>
                    </svg>
                    <input
                        ref={emailRef} 
                        placeholder='Email'/>
                    {emailMessage&&<FormMessage message={emailMessage}/>}
                </div>
                <div className={styles.inputField}>
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"/>
                    </svg>
                    <input
                        ref={phoneRef}
                        type="tel" 
                        placeholder='Phone'/>
                    {phoneMessage&&<FormMessage message={phoneMessage}/>}
                </div>
                <div className={styles.inputField}>
                    <svg 
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 16 16">
                        <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                    </svg>
                    <input
                        ref={passwordRef}
                        type={hidePassword?'password':'text'}
                        placeholder='Create Password'/>
                    {hidePassword
                    ?<svg
                        className={styles.iconButton}
                        onClick={()=>setHidePassword(state=>!state)}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 16 16">
                        <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588zM5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474L5.21 3.089z"/>
                        <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12-.708.708z"/>
                    </svg>
                    :<svg
                        className={styles.iconButton}
                        onClick={()=>setHidePassword(state=>!state)}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 16 16">
                        <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                        <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                    </svg>}
                    {passwordMessage&&<FormMessage message={passwordMessage}/>}
                </div>
                <button
                    disabled={isLoading} 
                    onClick={submitHandler}>
                    Register
                </button>
                <span
                    onClick={()=>navigate("/login")}
                    className={styles.textButton}>
                    ALREADY HAVE AN ACCOUNT? LOGIN
                </span>
            </form>}
        </Fragment>
        
    );
}

export default Register;