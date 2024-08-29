import React, { useState } from 'react';
import styles from '../workflow.module.css';
import { Button, message } from 'antd';

interface TopbarProps {
    onSaveClick: () => Promise<boolean>;
    setWorkflowName: (name: string) => void;
}

const Topbar: React.FC<TopbarProps> = ({ onSaveClick, setWorkflowName }) => {
    const [isRunEnabled, setIsRunEnabled] = useState(false);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setWorkflowName(event.target.value);
    };

    const handleSaveClick = async () => {
        try {
            const success = await onSaveClick();
            if (success) {
                setIsRunEnabled(true);
            } else {
                setIsRunEnabled(false);
                message.error('Failed to save workflow.');
            }
        } catch (error) {
            setIsRunEnabled(false);
            message.error('An error occurred while saving the workflow.');
        }
    };

    return (
        <div className={styles.topbarWrapper}>
            <div className={`flex ${styles.topbar}`}>
                <div className={styles.discardBtn}>
                    <a href="/workflows-list" className='btn btn-discard'>Discard</a>
                </div>
                <div className={styles.workspaceName}>
                    <input
                        type="text"
                        placeholder='Workflow Name'
                        defaultValue="Workflow Name"
                        onChange={handleInputChange}
                    />
                </div>
                <div className={`flex gap-1 ${styles.rightButtons}`}>
                    <Button className='btn btn-outline' onClick={handleSaveClick}>Save</Button>
                    <Button className='btn' disabled={!isRunEnabled}>Run</Button>
                </div>
            </div>
        </div>
    );
};

export default Topbar;
