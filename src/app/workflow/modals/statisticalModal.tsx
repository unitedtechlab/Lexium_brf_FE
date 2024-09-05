import React, { useState, useEffect } from 'react';
import { Modal, Select, Button, Form, Row, Col, message } from 'antd';
import { fetchFolderData } from '@/app/API/api';

interface StatisticalModalProps {
    isModalVisible: boolean;
    handleOkay: (values: any) => void;
    handleCancel: () => void;
    connectedTable: string | null;
    email: string;
    selectedWorkspace: string | null;
}

const StatisticalModal: React.FC<StatisticalModalProps> = ({
    isModalVisible,
    handleOkay,
    handleCancel,
    connectedTable,
    selectedWorkspace,
    email,
}) => {
    const [form] = Form.useForm();
    const [columns, setColumns] = useState<{ key: string; name: string }[]>([]);
    const [columnDataTypes, setColumnDataTypes] = useState<{ [key: string]: string }>({});
    const [confirmedDataType, setConfirmedDataType] = useState<string | null>(null);
    const [selectedColumnName, setSelectedColumnName] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        if (connectedTable) {
            fetchTableColumns(connectedTable);
        } else {
            setColumns([]);
            setConfirmedDataType(null);
            setSelectedColumnName(null);
        }
    }, [isModalVisible, connectedTable]);

    const fetchTableColumns = async (tableId: string) => {
        if (!selectedWorkspace || !tableId) return;
        setIsLoading(true);

        try {
            const folderData = await fetchFolderData(email, selectedWorkspace, tableId);

            if (folderData) {
                const columnsData = Object.entries(folderData).map(([key, dataType]) => ({
                    key,
                    name: key,
                }));

                if (columnsData.length > 0) {
                    setColumns(columnsData);
                    setColumnDataTypes(folderData);
                } else {
                    message.error('No columns found for the selected table.');
                }
            } else {
                message.error('No folder data found for the selected table.');
            }
        } catch (error) {
            message.error('Failed to fetch columns or data types.');
            console.error('Error fetching folder data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleColumnChange = (value: string) => {
        const column = columns.find(col => col.key === value);
        if (column) {
            const dataType = columnDataTypes[column.name] || null;
            setConfirmedDataType(dataType);
            setSelectedColumnName(column.name);
        } else {
            console.error('Column not found for key:', value);
        }
    };

    const onOk = () => {
        form.validateFields()
            .then(values => {
                values.column = selectedColumnName;
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
                name="statisticalForm"
                layout="vertical"
            >
                <div className="padding-16">
                    <Row gutter={16}>
                        <Col md={12} sm={24}>
                            <Form.Item
                                name="column"
                                label="Select Table Column"
                                rules={[{ required: true, message: 'Please select a column' }]}
                            >
                                <Select
                                    placeholder="Select Column"
                                    onChange={handleColumnChange}
                                    disabled={columns.length === 0}
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
                                            <Select.Option value="std">Standard Deviation</Select.Option>
                                            <Select.Option value="var">Variance</Select.Option>
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
