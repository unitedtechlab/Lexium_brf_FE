import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import axios from 'axios';
import { BaseURL } from '@/app/constants/index';
import { useEmail } from "@/app/context/emailContext";
import { getToken } from '@/utils/auth';

interface Props {
    workspace: string;
    folderName: string;
    fileName: string;
    visible: boolean;
    onCancel: () => void;
    onOk: (newName: string) => void;
}

const getFileNameWithoutExtension = (name: string) => {
    const index = name.lastIndexOf('.');
    return index === -1 ? name : name.substring(0, index);
};

const EditFileModal: React.FC<Props> = ({
    workspace,
    folderName,
    fileName,
    visible,
    onCancel,
    onOk,
}) => {
    const { email } = useEmail();
    const [newName, setNewName] = useState(getFileNameWithoutExtension(fileName));
    const [isLoading, setIsLoading] = useState(false);
    const token = useMemo(() => getToken(), []);

    useEffect(() => {
        setNewName(getFileNameWithoutExtension(fileName));
    }, [fileName]);

    const handleOk = async () => {
        setIsLoading(true);
        try {
            const requestData = {
                UserEmail: email,
                workSpace: workspace.toUpperCase(),
                folderName: folderName.toUpperCase(),
                fileName: fileName.toUpperCase(),
                data: newName,
            };

            const response = await axios.put(`${BaseURL}/file`, requestData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (response.status === 200) {
                message.success('File name updated successfully');
                onOk(newName);
            } else {
                console.error('Failed to update file name - status:', response.status);
                message.error('Failed to update file name.');
            }
        } catch (error) {
            console.error('Error editing file name:', error);
            message.error('Failed to update file name.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            title="Edit File Name"
            centered
            open={visible}
            onOk={handleOk}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel} className='btn btn-outline'>
                    Cancel
                </Button>,
                <Button key="edit" type="primary" onClick={handleOk} loading={isLoading} className='btn'>
                    Edit
                </Button>,
            ]}
        >
            <Form layout="vertical" id='editfile-form'>
                <Form.Item label="New File Name">
                    <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Enter new file name"
                        id='file-name'
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EditFileModal;
