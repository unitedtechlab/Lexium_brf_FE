import React from 'react';
import { Modal, Input, Button, Form } from 'antd';

interface CustomfillModalProps {
    visible: boolean;
    onCancel: () => void;
    onOk: (customValue: string) => void;
    customFillValue: string;
    setCustomFillValue: (value: string) => void;
}

const CustomfillModal: React.FC<CustomfillModalProps> = ({ visible, onCancel, onOk, customFillValue, setCustomFillValue }) => {
    const [form] = Form.useForm();

    const handleOk = () => {
        form.validateFields()
            .then(() => {
                onOk(customFillValue);
            })
            .catch(info => {
                console.error('Validation Failed:', info);
            });
    };

    return (
        <Modal
            title="Custom Fill Value"
            centered
            open={visible}
            onCancel={onCancel}
            onOk={handleOk}
            footer={[
                <Button key="cancel" onClick={onCancel} className="btn btn-outline">
                    Cancel
                </Button>,
                <Button key="submit" type="primary" onClick={handleOk} className="btn">
                    Save
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical" id="folder-form">
                <Form.Item
                    name="customValue"
                    label="Enter custom value"
                    rules={[{ required: true, message: "Please Enter custom value" }]}
                >
                    <Input
                        placeholder="Enter custom value"
                        value={customFillValue}
                        onChange={(e) => setCustomFillValue(e.target.value)}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CustomfillModal;
