import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getDatabase, ref, onValue, get } from "firebase/database";
import { getAuth } from "firebase/auth";
import app from '../../firebase';
import styles from './SecondFactor.module.css';

const SecondFactor = ()=>{
    const navigate = useNavigate();
    const [isLoading, setLoading] = useState(true);
    const chosenMethod = useLocation().pathname.replace('auth', '').replace('/', '').replace('/', '');

    const [user, setUser] = useState({});

    const clickHandler = (method)=>{
        if(!chosenMethod && user?.isMethodDone && !user?.isMethodDone[method]){
            navigate(method);
        }
    }

    const getClassName = (method)=>{
        return (`
            ${styles.navButton} 
            ${chosenMethod===method?styles.selected:''} 
            ${chosenMethod!==''?styles.disabled:''}
            ${user?.isMethodDone && user?.isMethodDone[method]?styles.done:''}`)
    }

    useEffect(()=>{
        const auth = getAuth(app);
        const db = getDatabase(app);    
        const uid = auth?.currentUser?.uid;

        const initialize = async ()=>{
            try {
                const snapshot = await get(ref(db, `users/${uid}`))
                if(snapshot.exists()){
                    if(snapshot.val().dataOTP.isDone&&
                        snapshot.val().dataTOTP.isDone&&
                        snapshot.val().dataPasskey.isDone){
                            navigate('form')
                        }
                    setUser({
                        uid,
                        fullname: snapshot.val().fullName,
                        phone: snapshot.val().phone,
                        email: snapshot.val().email,
                        passkey: snapshot.val().passkey,
                        secret: snapshot.val().secretBase32,
                        isMethodDone:{
                            passkey: snapshot.val().dataPasskey.isDone,
                            otp: snapshot.val().dataOTP.isDone,
                            totp: snapshot.val().dataTOTP.isDone }
                    })                        
                    
                }         
                setLoading(false);
            } catch (error) {
                console.log(error.message);
            }
        }

        if(!uid) navigate("/login");
        else initialize();

    },[])

    return(
        <div className={styles.mainContent}>
            {!isLoading&&<div className={styles.navBar}>
                <div
                    onClick={()=>clickHandler('otp')}  
                    className={getClassName('otp')}>
                    OTP
                </div>
                <div
                    onClick={()=>clickHandler('totp')}  
                    className={getClassName('totp')}>
                    TOTP
                </div>
                <div
                    onClick={()=>clickHandler('passkey')}  
                    className={getClassName('passkey')}>
                    PASSKEY
                </div>
            </div>}
            {!isLoading&&<Outlet context={user}/>}
        </div>
    );
}

export default SecondFactor;