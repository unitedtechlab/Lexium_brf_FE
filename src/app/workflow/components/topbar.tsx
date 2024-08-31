import React, { useState } from 'react';
import styles from '../workflow.module.css';
import { Button, message } from 'antd';
import { runWorkflow } from '@/app/API/api';
import { useEmail } from '@/app/context/emailContext';

interface TopbarProps {
    onSaveClick: () => Promise<boolean>;
    setWorkflowName: (name: string) => void;
    workspaceId?: string | null;
}

const Topbar: React.FC<TopbarProps> = ({ onSaveClick, setWorkflowName, workspaceId }) => {
    const [isRunEnabled, setIsRunEnabled] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [workflowName, setWorkflowNameLocal] = useState<string>('');
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { email } = useEmail();

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

    const handleRunClick = async () => {
        if (!email) {
            message.error('User email is missing.');
            return;
        }
        if (!workspaceId) {
            message.error('Workspace ID is missing.');
            return;
        }
        if (!workflowName.trim()) {
            message.error('Workflow name is missing.');
            return;
        }

        setIsLoading(true);
        try {
            const workflowData = await runWorkflow(email, workspaceId, workflowName);
            console.log('Workflow Data:', workflowData);
            message.success('Workflow run successfully!');
        } catch (error) {
            message.error('Failed to run workflow.');
            console.error('Error running workflow:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.topbarWrapper}>
            <div className={`flex ${styles.topbar}`}>
                <div className={styles.discardBtn}>
                    <a href="/workflows-list" className='btn btn-discard btn-outline'>Discard</a>
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
                        className='btn'
                        onClick={handleSaveClick}
                        disabled={isSaving}
                    >
                        Save
                    </Button>
                    <Button
                        className='btn'
                        onClick={handleRunClick}
                        disabled={!isRunEnabled || isLoading}
                    >
                        {isLoading ? 'Running...' : 'Run'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Topbar;
