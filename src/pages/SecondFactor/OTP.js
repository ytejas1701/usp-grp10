import styles from './SecondFactor.module.css';
import { useRef, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { getDatabase, ref, update } from "firebase/database";
import app from '../../firebase';

const OTP = ()=>{
    var attemptsCount = useRef(0);
    var startTime = useRef(performance.now());

    const user = useOutletContext();
    const navigate = useNavigate();

    const inputRef = useRef(null);

    const [message, setMessage] = useState(``)
    const [buttonText, setButtonText] = useState(` Click here to get an OTP on +91${user.phone}.`)
    const [responseState, setResponseState] = useState('');
    
    const updateDatabase = async (timeTaken, attempts)=>{
        try {
            const db = getDatabase(app);
            await update(ref(db, `users/${user.uid}`),{
                dataOTP:{ 
                    isDone: true,
                    timeTaken,
                    attempts:attempts.current
                },
            });
        } catch (error) {
            console.log(error.message);
        }
    }
    
    const submitHandler = async (event)=>{
        event.preventDefault();
        attemptsCount.current++;
        setResponseState('');
        const enteredCode = inputRef.current.value;
        if(!enteredCode){ setTimeout(() => setResponseState(styles.incorrect), 1000); }
        else if(enteredCode.length !== 6){ setTimeout(() => setResponseState(styles.incorrect), 1000); }
        else await verifyOTP(enteredCode);
    }

    const verifyOTP = async (code)=>{
        try {
            const response = await fetch("https://usp-grp10.herokuapp.com/otp/verify",{
                method:"POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body:JSON.stringify({phone:user.phone, code}),
            });
            if(!response.ok) throw new Error();
            const {status} = await response.json();
            if(status==="approved") {
                setResponseState(styles.correct);
                var timeTaken = (performance.now() - startTime.current) / 1000;
                await updateDatabase(timeTaken, attemptsCount)
                setTimeout(()=>navigate('/login'), 1000);
            }
            else setResponseState(styles.incorrect);
        } catch (error) {
            console.log(error.message);
        }
    }

    const sendOTP = async ()=>{
        setButtonText(' Resend OTP');
        try {
            setMessage(`Sending OTP to +91${user.phone}...`);
            const response = await fetch("https://usp-grp10.herokuapp.com/otp/send",{
                method:"POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body:JSON.stringify({phone:user.phone}),
            });
            if(!response.ok) throw new Error();
            setMessage(`Enter the OTP sent to +91${user.phone}.`)
        } catch (error) {
            console.log(error.message)
            setMessage(`Could not send OTP.`)
        }
    }

    return(
        <div className={styles.dialog}>
            <div className={styles.title}>
                <svg    
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16">
                    <path d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"/>
                </svg>
                Authenticate with One Time Password
            </div>
            <div className={styles.body}>
                {message}
                <span onClick={sendOTP}>{buttonText}</span>
            </div>
            <form
                onSubmit={submitHandler} 
                className={responseState}>
                <input ref={inputRef}/>
                <svg
                    type='submit'
                    onClick={submitHandler}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16">
                    <path d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/>
                </svg>
            </form>
        </div>
    );
}

export default OTP;