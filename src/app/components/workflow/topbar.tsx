import React, { useState } from 'react';
import styles from '@/app/assets/css/workflow.module.css';
import { Button, message } from 'antd';

interface TopbarProps {
    onSaveClick: () => Promise<boolean>;
    setWorkflowName: (name: string) => void;
    workflowName: string;
    workspaceId?: string | null;
    setWorkflowOutput: (output: any) => void;
    setIsRunClicked: (isRun: boolean) => void;
    onRunClick: () => Promise<void>;
    isRunLoading: boolean;
}

const Topbar: React.FC<TopbarProps> = ({
    onSaveClick,
    setWorkflowName,
    workflowName,
    workspaceId,
    setWorkflowOutput,
    setIsRunClicked,
    onRunClick,
    isRunLoading
}) => {
    const [isRunEnabled, setIsRunEnabled] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isWorkflowNameEmpty, setIsWorkflowNameEmpty] = useState<boolean>(true);

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
            } else {
                setIsRunEnabled(false);
                message.error('Failed to save workflow.');
            }
        } catch (error) {
            setIsRunEnabled(false);
        } finally {
            setIsSaving(false);
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
                        onClick={onRunClick}
                        disabled={!isRunEnabled || isRunLoading}
                    >
                        {isRunLoading ? 'Running...' : 'Run'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Topbar;
