import styles from './SecondFactor.module.css';
import { useRef, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { getDatabase, ref, update } from "firebase/database";
import app from '../../firebase';

const Passkey = ()=>{
    var attemptsCount = useRef(0);
    var startTime = useRef(performance.now());

    const user = useOutletContext();
    const navigate = useNavigate();

    const inputRef = useRef(null);

    const [responseState, setResponseState] = useState('');

    const updateDatabase = async (timeTaken, attempts)=>{
        try {
            const db = getDatabase(app);
            await update(ref(db, `users/${user.uid}`),{
                dataPasskey:{ 
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
        const enteredPasskey = inputRef.current.value;
        if(enteredPasskey === user.passkey.toString()){
            setResponseState(styles.correct);
            var timeTaken = (performance.now() - startTime.current) / 1000;
            await updateDatabase(timeTaken, attemptsCount)
            setTimeout(()=>navigate('/login'), 1000);
        }else{
            setTimeout(()=>setResponseState(styles.incorrect), 1000);
        }
    }

    return(
        <div className={styles.dialog}>
            <div className={styles.title}>
                <svg 
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16">
                    <path d="M3.5 11.5a3.5 3.5 0 1 1 3.163-5H14L15.5 8 14 9.5l-1-1-1 1-1-1-1 1-1-1-1 1H6.663a3.5 3.5 0 0 1-3.163 2zM2.5 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
                </svg>
                Authenticate with Secret Passkey
            </div>
            <div className={styles.body}>Enter the Passkey which had been generated during your registration.</div>
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

export default Passkey;