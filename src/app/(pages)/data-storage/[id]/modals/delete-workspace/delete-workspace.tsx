import React, { useState, useMemo } from 'react';
import { Modal, Button, message } from 'antd';
import axios from 'axios';
import { BaseURL } from '@/app/constants/index';
import { useEmail } from '@/app/context/emailContext';
import { getToken } from '@/utils/auth';

interface DeleteWorkspaceModalProps {
    open: boolean;
    workspaceName: string;
    workspaceId: string;
    onOk: () => void;
    onCancel: () => void;
}

const DeleteWorkspaceModal: React.FC<DeleteWorkspaceModalProps> = ({ open, workspaceName, workspaceId, onOk, onCancel }) => {
    const { email } = useEmail();
    const [isLoading, setIsLoading] = useState(false);
    const token = useMemo(() => getToken(), []);

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            const response = await axios.delete(`${BaseURL}/cleaned_workspace`, {
                params: {
                    userEmail: email,
                    workSpace: workspaceId,
                },
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });

            if (response.status === 200) {
                message.success('Cleaned Workspace deleted successfully!');
                onOk();
            } else {
                message.error('Failed to delete Cleaned Workspace.');
            }
        } catch (error) {
            message.error('Failed to delete Cleaned Workspace.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            title="Delete Cleaned Workspace"
            centered
            open={open}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel} className='btn btn-outline'>
                    Cancel
                </Button>,
                <Button key="delete" type="primary" danger onClick={handleDelete} className='btn btn-delete' loading={isLoading}>
                    Delete
                </Button>,
            ]}
        >
            <p>Are you sure you want to delete the Cleaned Workspace "{workspaceName}"?</p>
        </Modal>
    );
};

export default DeleteWorkspaceModal;
