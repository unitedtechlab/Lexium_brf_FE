import React from 'react';
import { Modal, Select, Button, Form, Row, Col } from 'antd';

interface TableModalProps {
    isModalVisible: boolean;
    handleOk: (values: any) => void;
    handleCancel: () => void;
    setSelectedTable: (value: string | null) => void;
    workspaces: any[];
    folders: any[];
    selectedWorkspace: string | null;
}

const TableModal: React.FC<TableModalProps> = ({
    isModalVisible,
    handleOk,
    handleCancel,
    setSelectedTable,
    folders,
    selectedWorkspace
}) => {
    const [form] = Form.useForm();

    const onOk = () => {
        form.validateFields()
            .then(values => {
                handleOk(values);
                form.resetFields();
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };

    return (
        <Modal
            title="Select a Table"
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
                name="folderselect"
                layout="vertical"
            >
                <Row>
                    <Col md={24} sm={24}>
                        <Form.Item
                            name="table"
                            label="Select Table"
                            rules={[{ required: true, message: 'Please select a table' }]}
                        >
                            <Select
                                placeholder="Select a table"
                                onChange={(value) => setSelectedTable(value)}
                                disabled={!selectedWorkspace}
                            >
                                {folders
                                    .filter(folder => folder.workspaceId === selectedWorkspace)
                                    .map((folder) => (
                                        <Select.Option key={folder.id} value={folder.id}>
                                            {folder.name}
                                        </Select.Option>
                                    ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    {/* <Col md={24} sm={24}>
                        <h6>Select Below Fields for Merge Tables.</h6>
                    </Col>
                    <Col md={24} sm={24}>
                        <Form.Item
                            name="mergeType"
                            label="Merge Type"
                        >
                            <Select>
                                <Select.Option value="inner">Inner Join</Select.Option>
                                <Select.Option value="full">Full Join</Select.Option>
                                <Select.Option value="left">Left Join</Select.Option>
                                <Select.Option value="right">Right Join</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col> */}
                </Row>
            </Form>
        </Modal>
    );
};

export default TableModal;
