import React, { useState, useEffect } from 'react';
import { Modal, Select, Button, Form, Row, Col, message } from 'antd';
import { fetchFolders } from '@/app/API/api';

interface StartNodeModalProps {
    isModalVisible: boolean;
    handleOkay: (values: any, isMergeSelected: boolean) => void;
    handleCancel: () => void;
    setSelectedTable: (value: string | null) => void;
    workspaces: any[];
    folders: any[];
    selectedWorkspace: string | null;
    email: string;
    initialValues?: any;
}

const StartNodeModal: React.FC<StartNodeModalProps> = ({
    isModalVisible,
    handleOkay,
    handleCancel,
    setSelectedTable,
    folders,
    selectedWorkspace,
    email,
    initialValues
}) => {
    const [form] = Form.useForm();
    const [columns, setColumns] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleTableChange = async (value: string) => {
        setSelectedTable(value);
        setIsLoading(true);

        try {
            const folders = await fetchFolders(email, selectedWorkspace!, setIsLoading);
            const selectedFolder = folders.find(folder => folder.id === value);
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
                const isTable1Selected = Boolean(values.table1Single);
                const isMergeSelected = Boolean(values.table1 && values.table2);

                if (!isTable1Selected && !isMergeSelected) {
                    message.error('Please select at least one table.');
                    return;
                }
                handleOkay(values, isMergeSelected);
                form.resetFields();
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };


    return (
        <Modal
            title="Starting Node"
            open={isModalVisible}
            onOk={onOk}
            centered
            onCancel={handleCancel}
            width={"100%"}
            className='max-width-md'
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
                name="filterForm"
                layout="vertical"
                initialValues={initialValues}
            >
                <div className="padding-16">
                    <Row gutter={16}>
                        <Col md={24} sm={24}>
                            <Form.Item
                                name="table1Single"
                                label="Select First Table"
                            >
                                <Select
                                    placeholder="Select First Table"
                                    disabled={!selectedWorkspace}
                                    onChange={handleTableChange}
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
                    </Row>
                    <div className='or-div'>
                        <span>OR</span>
                    </div>
                    <h6>Select below Details if you want to Merge Tables</h6>
                    <Row gutter={16}>
                        <Col md={12} sm={24}>
                            <Form.Item
                                name="table1"
                                label="Select First Table"
                            >
                                <Select
                                    placeholder="Select First Table"
                                    disabled={!selectedWorkspace}
                                    onChange={handleTableChange}
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
                        <Col md={12} sm={24}>
                            <Form.Item
                                name="column1"
                                label="Select Column for First Table"
                            >
                                <Select placeholder="Select Column">
                                    {columns.map((column) => (
                                        <Select.Option key={column} value={column}>
                                            {column}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col md={12} sm={24}>
                            <Form.Item
                                name="table2"
                                label="Select Second Table"
                            >
                                <Select
                                    placeholder="Select Second Table"
                                    disabled={!selectedWorkspace}
                                    onChange={handleTableChange}
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
                        <Col md={12} sm={24}>
                            <Form.Item
                                name="column2"
                                label="Select Column for Second Table"
                            >
                                <Select placeholder="Select Column">
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
                                name="mergeType"
                                label="Merge Type"
                            >
                                <Select>
                                    <Select.Option value="inner join">Inner Join</Select.Option>
                                    <Select.Option value="outer join">Outer Join</Select.Option>
                                    <Select.Option value="full join">Full Join</Select.Option>
                                    <Select.Option value="left join">Left Join</Select.Option>
                                    <Select.Option value="right join">Right Join</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </div>
            </Form>
        </Modal>
    );
};

export default StartNodeModal;
