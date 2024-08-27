import React from 'react';
import styles from '../workflow.module.css';
import { Button } from 'antd';

interface TopbarProps {
    onSaveClick: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onSaveClick }) => {
    return (
        <div className={styles.topbarWrapper}>
            <div className={`flex ${styles.topbar}`}>
                <div className={styles.discardBtn}>
                    <a href="/dashboard" className='btn btn-discard'>Discard</a>
                </div>
                <div className={styles.workspaceName}>
                    <input type="text" placeholder='Workflow Name' defaultValue="Workflow Name" />
                </div>
                <div className={`flex gap-1 ${styles.rightButtons}`}>
                    <Button className='btn' onClick={onSaveClick}>Save</Button>
                </div>
            </div>
        </div>
    );
};

export default Topbar;
