import React, { useState } from 'react';
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

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            const token = getToken();
            const response = await axios.delete(`${BaseURL}/workspace`, {
                params: {
                    userEmail: email,
                    workSpace: workspaceId,
                },
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.status === 200) {
                message.success('Workspace deleted successfully!');
                onOk();
            }
        } catch (error) {
            message.error('Failed to delete workspace.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            title="Delete Workspace"
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
            <p>Are you sure you want to delete the workspace "{workspaceName}"?</p>
        </Modal>
    );
};

export default DeleteWorkspaceModal;
