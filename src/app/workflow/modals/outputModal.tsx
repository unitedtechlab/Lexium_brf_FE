import React, { useEffect } from 'react';
import { Modal, Input, Button, Form, Row, Col } from 'antd';

interface OutputModalProps {
    isModalVisible: boolean;
    handleOkay: (values: any) => void;
    handleCancel: () => void;
    selectedWorkspace: string | null;
    email: string;
    connectedTable: string | null;  // Add connectedTable to props
    initialValues?: any;
}

const OutputModal: React.FC<OutputModalProps> = ({
    isModalVisible,
    handleOkay,
    handleCancel,
    selectedWorkspace,
    email,
    connectedTable,  // Add connectedTable to destructure
    initialValues = { outputName: 'rule_' } // Default value if not provided
}) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (isModalVisible) {
            form.setFieldsValue({ outputName: initialValues.outputName });
        }
    }, [isModalVisible, form, initialValues]);

    const onOk = () => {
        form.validateFields()
            .then(values => {
                handleOkay(values);
                form.resetFields();
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };

    return (
        <Modal
            title="Output Node"
            open={isModalVisible}
            onOk={onOk}
            onCancel={handleCancel}
            centered
            footer={[
                <Button key="cancel" onClick={handleCancel} className="btn btn-outline">
                    Cancel
                </Button>,
                <Button key="submit" type="primary" onClick={onOk} className="btn">
                    Save
                </Button>,
            ]}
        >
            <Form
                form={form}
                name="outputForm"
                layout="vertical"
            >
                <div className="padding-16">
                    <Row gutter={16}>
                        <Col md={24} sm={24}>
                            <h6>Connected Table Name: {connectedTable || 'No table connected'}</h6>
                            <Form.Item
                                name="outputName"
                                label="Output Name"
                                rules={[{
                                    required: true,
                                    message: 'Please add an Output name'
                                }]}
                            >
                                <Input
                                    placeholder='Enter Output name'
                                    onChange={(e) => {
                                        let value = e.target.value;
                                        if (!value.startsWith('rule_')) {
                                            value = `rule_${value.replace(/^rule_/, '')}`;
                                        }
                                        form.setFieldsValue({ outputName: value });
                                    }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </div>
            </Form>
        </Modal>
    );
};

export default OutputModal;
