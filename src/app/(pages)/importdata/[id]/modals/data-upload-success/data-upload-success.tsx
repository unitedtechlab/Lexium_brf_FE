import React from 'react';
import { Modal, Button } from 'antd';

interface DataSuccessfulModalProps {
    visible: boolean;
    onCancel: () => void;
    onSubmit: () => void;
    onCleanDataNow: () => void;
    successfulFiles: string[];
    unsuccessfulFiles: { name: string, message: string }[];
}

const DataSuccessfulModal: React.FC<DataSuccessfulModalProps> = ({ visible, onCancel, onSubmit, onCleanDataNow, successfulFiles, unsuccessfulFiles }) => {
    return (
        <Modal
            title="Import Data"
            centered
            open={visible}
            onCancel={onCancel}
            footer={[
                <Button key="skip" onClick={onSubmit} className='btn'>
                    Submit
                </Button>,
            ]}
        >
            <p>Your data will be successfully imported. Data cleaning can help identify and fix errors or inconsistencies in your data, leading to more accurate and reliable results.</p>
            <p><b>Note: You have to Establish the columns for this folder.</b></p>

            <ul className="list-style">
                {successfulFiles.map((file, index) => (
                    <li key={index} className='success'>{file} Uploaded Succesfully</li>
                ))}

                {unsuccessfulFiles.map((file, index) => (
                    <li key={index} className='error'>{file.name}: {file.message}</li>
                ))}
            </ul>
        </Modal>
    );
};

export default DataSuccessfulModal;
