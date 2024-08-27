import React, { useState, useMemo } from 'react';
import { Modal, Button, message } from 'antd';
import axios from 'axios';
import { BaseURL } from '@/app/constants/index';
import { useEmail } from '@/app/context/emailContext';
import { getToken } from '@/utils/auth';

interface Props {
    fileId: string;
    workspaceId: string;
    folderName: string;
    open: boolean;
    onCancel: () => void;
    onDeleteSuccess: () => void;
}

const DeleteFileModal: React.FC<Props> = ({
    fileId,
    workspaceId,
    folderName,
    open,
    onCancel,
    onDeleteSuccess,
}) => {
    const { email } = useEmail();
    const [isLoading, setIsLoading] = useState(false);
    const token = useMemo(() => getToken(), []);

    const handleDeleteFile = async () => {
        setIsLoading(true);
        try {
            const response = await axios.delete(`${BaseURL}/file`, {
                params: {
                    userEmail: email,
                    workSpace: workspaceId,
                    folderName: folderName,
                    fileName: fileId,
                },
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });

            if (response.status === 200) {
                message.success('File deleted successfully');
                onDeleteSuccess();
            } else {
                message.error('Failed to delete file');
            }
        } catch (error) {
            console.error('Error deleting file:', error);
            message.error('Failed to delete file');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            title="Delete File"
            centered
            open={open}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel} className='btn btn-outline'>
                    Cancel
                </Button>,
                <Button key="delete" type="primary" danger onClick={handleDeleteFile} className='btn btn-delete' loading={isLoading}>
                    Delete
                </Button>,
            ]}
        >
            <p>Are you sure you want to delete this file?</p>
        </Modal>
    );
};

export default DeleteFileModal;
