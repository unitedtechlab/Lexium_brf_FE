import React, { useState } from 'react';
import styles from '../workflow.module.css';
import { Button, message } from 'antd';
import { runWorkflow } from '@/app/API/api';
import { useEmail } from '@/app/context/emailContext';

interface TopbarProps {
    onSaveClick: () => Promise<boolean>;
    setWorkflowName: (name: string) => void;
    workflowName: string;
    workspaceId?: string | null;
    setWorkflowOutput: (output: any) => void;
    setIsRunClicked: (isRun: boolean) => void;
}

const Topbar: React.FC<TopbarProps> = ({
    onSaveClick,
    setWorkflowName,
    workflowName,
    workspaceId,
    setWorkflowOutput,
    setIsRunClicked
}) => {
    const [isRunEnabled, setIsRunEnabled] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isWorkflowNameEmpty, setIsWorkflowNameEmpty] = useState<boolean>(true);
    const { email } = useEmail();

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const name = event.target.value.trim();
        setWorkflowName(name);

        setIsWorkflowNameEmpty(name === '');

        if (name === '') {
            setIsSaved(false);
            setIsRunEnabled(false);
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
                // message.success('Workflow saved successfully!');
            } else {
                setIsRunEnabled(false);
                message.error('Failed to save workflow.');
            }
        } catch (error) {
            setIsRunEnabled(false);
            // message.error('An error occurred while saving the workflow.');
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

            if (workflowData) {
                setWorkflowOutput(workflowData);
                setIsRunClicked(true);
                message.success('Workflow run successfully!');
                console.log("workflowData", workflowData);
            } else {
                message.error('No output nodes found in the workflow.');
            }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error.message || 'Failed to run workflow.';
            message.error(errorMessage);
            console.error('Error running workflow:', error);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className={styles.topbarWrapper}>
            <div className={`flex gap-1 ${styles.topbar}`}>
                <div className={`flex gap-1 ${styles.discardBtn}`}>
                    <a href="/workflows-list" className='btn btn-discard'>Discard</a>
                    <a href="/workflow" className='btn btn-discard btn-outline'>Create New</a>
                </div>
                <div className={styles.workspaceName}>
                    <input
                        type="text"
                        placeholder='Workflow Name'
                        onChange={handleInputChange}
                        readOnly={isSaved}
                    />
                </div>
                <div className={`flex gap-1 ${styles.rightButtons}`}>
                    <Button
                        className='btn'
                        onClick={handleSaveClick}
                        disabled={isSaving || isWorkflowNameEmpty}
                    >
                        {isSaving ? 'Saving...' : 'Save'}
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
