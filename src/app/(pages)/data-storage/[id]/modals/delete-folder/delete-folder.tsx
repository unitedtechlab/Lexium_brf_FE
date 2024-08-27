import React, { useState, useMemo } from 'react';
import { Modal, Button, message } from 'antd';
import axios from 'axios';
import { BaseURL } from '@/app/constants/index';
import { useEmail } from '@/app/context/emailContext';
import { getToken } from '@/utils/auth';

interface DeleteFolderModalProps {
    open: boolean;
    workspaceName: string;
    workspaceId: string;
    folderName: string;
    onOk: () => void;
    onCancel: () => void;
}

const DeleteFolderModal: React.FC<DeleteFolderModalProps> = ({ open, workspaceName, workspaceId, folderName, onOk, onCancel }) => {
    const { email } = useEmail();
    const [isLoading, setIsLoading] = useState(false);
    const token = useMemo(() => getToken(), []);

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            const response = await axios.delete(`${BaseURL}/cleaned_folder`, {
                params: {
                    userEmail: email,
                    workSpace: workspaceId,
                    folderName: folderName,
                },
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });

            if (response.status === 200) {
                message.success('Cleaned File deleted successfully!');
                onOk();
            } else {
                message.error('Failed to delete Cleaned File.');
            }
        } catch (error) {
            message.error('Failed to delete Cleaned File.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            title="Delete Cleaned File"
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
            <p>Are you sure you want to delete the Cleaned File "{folderName}"?</p>
        </Modal>
    );
};

export default DeleteFolderModal;
