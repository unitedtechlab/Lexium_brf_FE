import React, { useState, useEffect } from 'react';
import styles from '../workflow.module.css';
import { Button, message } from 'antd';

interface TopbarProps {
    onSaveClick: () => Promise<boolean>;
    setWorkflowName: (name: string) => void;
}

const Topbar: React.FC<TopbarProps> = ({ onSaveClick, setWorkflowName }) => {
    const [isRunEnabled, setIsRunEnabled] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [workflowName, setWorkflowNameLocal] = useState<string>('');
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!isSaved) {
            setWorkflowNameLocal(event.target.value);
            setWorkflowName(event.target.value);
        }
    };

    const handleSaveClick = async () => {
        if (isSaving) return;

        if (workflowName.trim() === '') {
            message.error('Workflow Name is required.');
            return;
        }

        setIsSaving(true);

        try {
            const success = await onSaveClick();
            if (success) {
                setIsSaved(true);
                setIsRunEnabled(true);
            } else {
                setIsRunEnabled(false);
                message.error('Failed to save workflow.');
            }
        } catch (error) {
            setIsRunEnabled(false);
            message.error('An error occurred while saving the workflow.');
        } finally {
            setIsSaving(false);
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
                        onChange={handleInputChange}
                        value={workflowName}
                        readOnly={isSaved}
                    />
                </div>
                <div className={`flex gap-1 ${styles.rightButtons}`}>
                    <Button
                        className='btn btn-outline'
                        onClick={handleSaveClick}
                        disabled={isSaving}
                    >
                        Save
                    </Button>
                    <Button className='btn' disabled={!isRunEnabled}>Run</Button>
                </div>
            </div>
        </div>
    );
};

export default Topbar;
