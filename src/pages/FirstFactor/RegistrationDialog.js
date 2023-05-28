import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import styles from './FirstFactor.module.css';
import { useEffect, useState } from 'react';

const RegistrationDialog = ({passkey, secret})=>{
    const [url, setUrl] = useState('');
    useEffect(()=>{
        const initializeQR = async ()=>{
            try {
                const dataURL = await QRCode.toDataURL(secret.otpauth_url)
                setUrl(dataURL);
            } catch (error) {
                console.log(error.message);
            }
        }
        initializeQR();
    },[secret])

    const navigate = useNavigate();
    return(
        <div className={styles.dialog}>
            <div className={styles.box}>
                <div className={styles.left}>{passkey}</div>
                <div className={styles.right}>
                    Please remember this Passkey. You will be required to use it later for authentication.
                </div>
            </div>
            <div className={styles.box}>
                <div className={styles.left}>
                    <img src={url}></img>
                </div>
                <div className={styles.right}>
                    Please scan this QR code with an authenticator app. You will be required to use it later for authentication.
                </div>
            </div>
            <span onClick={()=>navigate('/login')}>Click here to Login</span>
        </div>
    );
}

export default RegistrationDialog;