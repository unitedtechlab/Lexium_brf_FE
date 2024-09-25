import React, { useState } from 'react';
import { Modal, Input, Button, message } from 'antd';

interface SaveGlobalVariableModalProps {
    visible: boolean;
    onCancel: () => void;
    onSave: (globalVariableName: string) => void;
}

const SaveGlobalVariableModal: React.FC<SaveGlobalVariableModalProps> = ({ visible, onCancel, onSave }) => {
    const [globalVariableName, setGlobalVariableName] = useState('');

    const handleSave = () => {
        if (!globalVariableName) {
            message.error('Please enter a variable name.');
            return;
        }
        onSave(globalVariableName);
        setGlobalVariableName('');
    };

    const handleCancel = () => {
        setGlobalVariableName('');
        onCancel();
    };

    return (
        <Modal
            title="Save as Global Variable"
            open={visible}
            onCancel={handleCancel}
            footer={[
                <Button key="cancel" onClick={handleCancel} className='btn'>
                    Cancel
                </Button>,
                <Button key="save" type="primary" onClick={handleSave} className='btn btn-outline'>
                    Save
                </Button>,
            ]}
        >
            <Input
                placeholder="Enter Global Variable Name"
                value={globalVariableName}
                onChange={(e) => setGlobalVariableName(e.target.value)}
            />
        </Modal>
    );
};

export default SaveGlobalVariableModal;
