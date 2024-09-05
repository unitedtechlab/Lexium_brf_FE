import React, { useState, useEffect } from 'react';
import { Modal, Select, Button, Form, Row, Col, message } from 'antd';
import { fetchFolders } from '@/app/API/api';

interface SortModalProps {
    isModalVisible: boolean;
    handleOkay: (values: any) => void;
    handleCancel: () => void;
    connectedTable: string | null;
    folders: any[];
    selectedWorkspace: string | null;
    email: string;
    initialValues?: any;
}

const SortModal: React.FC<SortModalProps> = ({
    isModalVisible,
    handleOkay,
    handleCancel,
    connectedTable,
    folders,
    selectedWorkspace,
    email,
    initialValues
}) => {
    const [form] = Form.useForm();
    const [columns, setColumns] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        if (connectedTable) {
            setIsLoading(true);
            fetchColumnsForTable(connectedTable);
        }
    }, [connectedTable]);

    const fetchColumnsForTable = async (table: string) => {
        try {
            const folders = await fetchFolders(email, selectedWorkspace!, setIsLoading);
            const selectedFolder = folders.find(folder => folder.id === table);
            if (selectedFolder) {
                const columns = selectedFolder.columns ? Object.values(selectedFolder.columns) : [];
                setColumns(columns);
            }
        } catch (error) {
            message.error('Failed to fetch columns.');
        } finally {
            setIsLoading(false);
        }
    };

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
            title="Sorting"
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
                name="sortForm"
                layout="vertical"
                initialValues={initialValues}
            >
                <div className="padding-16">
                    <Row gutter={16}>
                        <Col md={24} sm={24}>
                            <Form.Item
                                name="column"
                                label="Select Column for Sorting"
                                rules={[{ required: true, message: 'Please select a column' }]}
                            >
                                <Select
                                    placeholder="Select Column"
                                    loading={isLoading}
                                >
                                    {columns.map((column) => (
                                        <Select.Option key={column} value={column}>
                                            {column}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col md={24} sm={24}>
                            <Form.Item
                                name="sortType"
                                label="Sorting Type"
                                rules={[{ required: true, message: 'Please select a sorting type' }]}
                            >
                                <Select placeholder="Select Sorting Type">
                                    <Select.Option value="asc">Asc</Select.Option>
                                    <Select.Option value="desc">Desc</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </div>
            </Form>
        </Modal>
    );
};

export default SortModal;
