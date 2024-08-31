import React, { useState } from 'react';
import { Modal, Button, message } from 'antd';

interface DeleteModalProps {
    open: boolean;
    entityName: string;
    entityId: string;
    onDelete: (entityId: string) => Promise<void>;
    onOk: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ open, entityName, entityId, onDelete, onOk, onCancel, isLoading = false }) => {
    const [internalLoading, setInternalLoading] = useState(false);

    const handleDelete = async () => {
        setInternalLoading(true);
        try {
            await onDelete(entityId);
            onOk();
        } catch (error) {
            message.error(`Failed to delete ${entityName}.`);
        } finally {
            setInternalLoading(false);
        }
    };

    return (
        <Modal
            title={`Delete ${entityName}`}
            centered
            open={open}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel} className='btn btn-outline'>
                    Cancel
                </Button>,
                <Button
                    key="delete"
                    type="primary"
                    danger
                    onClick={handleDelete}
                    className='btn btn-delete'
                    loading={internalLoading || isLoading}
                >
                    Delete
                </Button>,
            ]}
        >
            <p>Are you sure you want to delete the {entityName}?</p>
        </Modal>
    );
};

export default DeleteModal;
