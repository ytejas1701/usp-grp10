import styles from './SecondFactor.module.css';

const ChooseMethod = ()=>{
    return(
        <div className={styles.dialog}>
            <div className={styles.title}>
                Choose a Method for Authentication
            </div>
        </div>
    );
}

export default ChooseMethod;