import React, { useState, useEffect } from 'react';
import { Modal, Select, Button, Form, Row, Col, message } from 'antd';
import { fetchFolders, fetchFolderData } from '@/app/API/api';

interface StatisticalModalProps {
    isModalVisible: boolean;
    handleOkay: (values: any) => void;
    handleCancel: () => void;
    setSelectedTable: (value: string | null) => void;
    workspaces: any[];
    folders: any[];
    selectedWorkspace: string | null;
    email: string;
    initialValues?: any;
}

const StatisticalModal: React.FC<StatisticalModalProps> = ({
    isModalVisible,
    handleOkay,
    handleCancel,
    setSelectedTable,
    folders,
    selectedWorkspace,
    email,
    initialValues,
    workspaces,
}) => {
    const [form] = Form.useForm();
    const [columns, setColumns] = useState<{ key: string, name: string }[]>([]);
    const [columnDataTypes, setColumnDataTypes] = useState<{ [key: string]: string }>({});
    const [confirmedDataType, setConfirmedDataType] = useState<string | null>(null);
    const [selectedColumnName, setSelectedColumnName] = useState<string | null>(null); // Track selected column name
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        setConfirmedDataType(null);
        setSelectedColumnName(null); // Reset selected column name
    }, [isModalVisible]);

    const handleTableChange = async (value: string) => {
        setSelectedTable(value);
        setIsLoading(true);

        try {
            const fetchedFolders = await fetchFolders(email, selectedWorkspace!, setIsLoading);
            const selectedFolder = fetchedFolders.find(folder => folder.id === value);
            if (selectedFolder) {
                const columns = selectedFolder.columns
                    ? Object.entries(selectedFolder.columns).map(([key, name]) => ({ key, name }))
                    : [];
                setColumns(columns);

                const confirmedDataTypes = await fetchFolderData(email, selectedWorkspace!, value);
                setColumnDataTypes(confirmedDataTypes);
            }
        } catch (error) {
            message.error('Failed to fetch columns or data type.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleColumnChange = (value: string) => {
        const column = columns.find(col => col.key === value);
        if (column) {
            const dataType = columnDataTypes[column.name] || null;
            setConfirmedDataType(dataType);
            setSelectedColumnName(column.name); // Set the selected column name
        } else {
            console.log("Column not found for key:", value);
        }
    };

    const onOk = () => {
        form.validateFields()
            .then(values => {
                values.column = selectedColumnName; // Ensure the selected column name is used
                handleOkay(values);
                form.resetFields();
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };

    return (
        <Modal
            title="Statistical Functions"
            open={isModalVisible}
            onOk={onOk}
            onCancel={handleCancel}
            centered
            width={'100%'}
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
                name="sortForm"
                layout="vertical"
                initialValues={initialValues}
            >
                <div className="padding-16">
                    <Row gutter={16}>
                        <Col md={24} sm={24}>
                            <Form.Item
                                name="table"
                                label="Select Table"
                                rules={[{ required: true, message: 'Please select a table' }]}
                            >
                                <Select
                                    placeholder="Select Table"
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
                                name="column"
                                label="Select Table Column"
                                rules={[{ required: true, message: 'Please select a column' }]}
                            >
                                <Select
                                    placeholder="Select Column"
                                    onChange={handleColumnChange}
                                >
                                    {columns.map(({ key, name }) => (
                                        <Select.Option key={key} value={key}>
                                            {name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col md={12} sm={24}>
                            <Form.Item
                                name="statisticalfunction"
                                label="Statistical Function"
                                rules={[{ required: true, message: 'Please select a statistical function' }]}
                            >
                                <Select placeholder="Select Statistical Function" disabled={!confirmedDataType}>
                                    {confirmedDataType === 'number' && (
                                        <>
                                            <Select.Option value="mean">Mean</Select.Option>
                                            <Select.Option value="mode">Mode</Select.Option>
                                            <Select.Option value="median">Median</Select.Option>
                                            <Select.Option value="std">Std</Select.Option>
                                            <Select.Option value="var">Var</Select.Option>
                                        </>
                                    )}
                                    {confirmedDataType !== 'number' && (
                                        <Select.Option value="mode">Mode</Select.Option>
                                    )}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <p className='note_text'><b>Note:</b> The statistical function will create a new column named column_name_(stat_function).</p>
                </div>
            </Form>
        </Modal>
    );
};

export default StatisticalModal;
