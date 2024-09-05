import React, { useState, useEffect } from 'react';
import { Modal, Select, Button, Form, Row, Col, Input, message } from 'antd';
import { fetchFolderData } from '@/app/API/api';

interface FilterModalProps {
    isModalVisible: boolean;
    handleOkay: (values: any) => void;
    handleCancel: () => void;
    setSelectedTable: (value: string | null) => void;
    workspaces: any[];
    folders: any[];
    selectedWorkspace: string | null;
    email: string;
    initialValues?: any;
    connectedTable: string | null;
}

const FilterModal: React.FC<FilterModalProps> = ({
    isModalVisible,
    handleOkay,
    handleCancel,
    setSelectedTable,
    folders,
    selectedWorkspace,
    email,
    initialValues,
    connectedTable
}) => {
    const [form] = Form.useForm();
    const [columns, setColumns] = useState<{ key: string, name: string }[]>([]);
    const [columnDataTypes, setColumnDataTypes] = useState<{ [key: string]: string }>({});
    const [confirmedDataType, setConfirmedDataType] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        if (connectedTable) {
            fetchColumnsForTable(connectedTable);
        }
        if (initialValues) {
            form.setFieldsValue(initialValues);
        }
    }, [connectedTable, initialValues]);

    const fetchColumnsForTable = async (tableId: string) => {
        setSelectedTable(tableId);
        setIsLoading(true);

        try {
            const selectedFolder = folders.find(folder => folder.id === tableId);
            if (selectedFolder) {
                const columnsArray = selectedFolder.columns
                    ? Object.entries(selectedFolder.columns).map(([key, name]) => ({ key, name: name as string }))
                    : [];
                setColumns(columnsArray);

                const confirmedDataTypes = await fetchFolderData(email, selectedWorkspace!, tableId);
                setColumnDataTypes(confirmedDataTypes);

                if (initialValues && initialValues.column) {
                    const initialColumnType = confirmedDataTypes[initialValues.column];
                    setConfirmedDataType(initialColumnType);
                }
            }
        } catch (error) {
            message.error('Failed to fetch columns.');
        } finally {
            setIsLoading(false);
        }
    };


    const handleColumnChange = (value: string) => {
        const column = columns.find(col => col.key === value);
        if (column) {
            const dataType = columnDataTypes[column.name] || null;
            setConfirmedDataType(dataType);
            form.setFieldValue('columnName', column.name);
        } else {
            console.log("Column not found for key:", value);
        }
    };

    const onOk = () => {
        form.validateFields()
            .then(values => {
                const selectedColumn = columns.find(col => col.key === values.column);
                if (selectedColumn) {
                    values.column = selectedColumn.name;
                }
                handleOkay(values);
                form.resetFields();
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };

    const renderOperators = () => {
        if (!confirmedDataType) return null;

        switch (confirmedDataType) {
            case 'number':
                return (
                    <>
                        <Select.Option value="=">{'='}</Select.Option>
                        <Select.Option value="!=">{'!='}</Select.Option>
                        <Select.Option value=">">{'>'}</Select.Option>
                        <Select.Option value="<">{'<'}</Select.Option>
                        <Select.Option value=">=">{'>='}</Select.Option>
                        <Select.Option value="<=">{'<='}</Select.Option>
                    </>
                );
            case 'date':
                return (
                    <>
                        <Select.Option value="=">{'='}</Select.Option>
                        <Select.Option value="!=">{'!='}</Select.Option>
                        <Select.Option value=">">{'>'}</Select.Option>
                        <Select.Option value="<">{'<'}</Select.Option>
                        <Select.Option value=">=">{'>='}</Select.Option>
                        <Select.Option value="<=">{'<='}</Select.Option>
                    </>
                );
            case 'text':
                return (
                    <>
                        <Select.Option value="=">{'='}</Select.Option>
                        <Select.Option value="!=">{'!='}</Select.Option>
                        <Select.Option value="string_match">String Match</Select.Option>
                    </>
                );
            default:
                return (
                    <>
                        <Select.Option value="=">{'='}</Select.Option>
                        <Select.Option value="!=">{'!='}</Select.Option>
                        <Select.Option value="string_match">String Match</Select.Option>
                    </>
                );
        }
    };

    return (
        <Modal
            title="Filter"
            open={isModalVisible}
            onOk={onOk}
            centered
            onCancel={handleCancel}
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
                        <Col md={12} sm={24}>
                            <Form.Item
                                name="column"
                                label="Select Column for Filter"
                                rules={[{ required: true, message: 'Please select a column' }]}
                            >
                                <Select
                                    placeholder="Select Column"
                                    onChange={handleColumnChange}
                                    loading={isLoading}
                                >
                                    {columns.map(({ key, name }) => (
                                        <Select.Option key={key} value={key}>
                                            {name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item name="columnName" hidden={true}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col md={12} sm={24}>
                            <Form.Item
                                name="operator"
                                label="Comparison Operator"
                                rules={[{ required: true, message: 'Please select an operator' }]}
                            >
                                <Select placeholder="Select Operator">
                                    {renderOperators()}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col md={24} sm={24}>
                            <Form.Item
                                name="value"
                                label="Enter Value"
                                rules={[{ required: true, message: 'Please enter a value' }]}
                            >
                                <Input placeholder="Enter Value" />
                            </Form.Item>
                        </Col>
                    </Row>
                </div>
            </Form>
        </Modal>
    );
};

export default FilterModal;
